#!/usr/bin/env python3
"""Builds the site's data files from the public IPEDS and College Scorecard CSVs (RECETTE §4, §12.1).

Replayable: `python3 scripts/build-data.py [--raw data/raw]`. Without the raw files in place it downloads
them with curl from nces.ed.gov and ed-public-download.scorecard.network (public files, no account, no API key).

Inputs (all federal, public domain or CC-BY, cited on every page):
  HD2024.zip         IPEDS institutional characteristics header, 2024-25 collection (names, state, sector, Title IV)
  IC2023_AY.zip      IPEDS student charges 2023-24: TUITIONn, FEEn and HRCHGn (per credit hour, part-time students)
  EF2023A_DIST.zip   IPEDS fall 2023 enrollment by distance-education status (EFDETOT, EFDEEXC, EFDESOM)
  Most-Recent-Cohorts-Institution_11022026.zip  College Scorecard, release of November 2, 2026 (accreditor,
                     8-year award rate, Pell share, median debt and earnings, share of students 25 and older)
Outputs: src/data/colleges.json, src/data/states.json, src/data/data-meta.json.
"""
import csv, io, json, os, statistics, subprocess, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')
if '--raw' in sys.argv:
    RAW = sys.argv[sys.argv.index('--raw') + 1]
OUT = os.path.join(ROOT, 'src', 'data')

FILES = {
    'HD2024.zip': 'https://nces.ed.gov/ipeds/datacenter/data/HD2024.zip',
    'IC2023_AY.zip': 'https://nces.ed.gov/ipeds/datacenter/data/IC2023_AY.zip',
    'EF2023A_DIST.zip': 'https://nces.ed.gov/ipeds/datacenter/data/EF2023A_DIST.zip',
    'scorecard-inst.zip': 'https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Institution_11022026.zip',
}
STATES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut',
    'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois',
    'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana',
    'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania',
    'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
}


def fetch():
    os.makedirs(RAW, exist_ok=True)
    for name, url in FILES.items():
        p = os.path.join(RAW, name)
        if not os.path.exists(p) or os.path.getsize(p) == 0:
            print('download', url)
            subprocess.run(['curl', '-sL', '-A', 'Mozilla/5.0', '--max-time', '900', '-o', p, url], check=True)


def read_zip_csv(name, pick=None):
    with zipfile.ZipFile(os.path.join(RAW, name)) as z:
        names = [n for n in z.namelist() if n.lower().endswith('.csv') and '__macosx' not in n.lower()]
        # IPEDS ships a revised file (_RV) next to the original: the revised one wins.
        names.sort(key=lambda n: ('_rv' not in n.lower(), n))
        n = pick(names) if pick else names[0]
        raw = z.read(n)
    txt = raw.decode('utf-8-sig', errors='ignore') if name.startswith('scorecard') else raw.decode('latin-1')
    rd = csv.DictReader(io.StringIO(txt))
    rd.fieldnames = [f.replace('﻿', '').replace('ï»¿', '').strip() for f in rd.fieldnames]
    return [{k.strip(): (v or '').strip() for k, v in row.items() if k} for row in rd]


def num(s):
    if s in ('', '.', 'NA', 'NULL', 'PrivacySuppressed', None):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def ival(s):
    v = num(s)
    return None if v is None else int(round(v))


def median(xs):
    xs = [x for x in xs if x is not None]
    return round(statistics.median(xs)) if xs else None


def main():
    fetch()
    hd = {r['UNITID']: r for r in read_zip_csv('HD2024.zip')}
    ay = {r['UNITID']: r for r in read_zip_csv('IC2023_AY.zip')}
    dist = {}
    for r in read_zip_csv('EF2023A_DIST.zip'):
        dist.setdefault(r['UNITID'], {})[r['EFDELEV']] = r
    sc = {r['UNITID']: r for r in read_zip_csv('scorecard-inst.zip')}

    colleges = []
    for u, h in hd.items():
        if h['STABBR'] not in STATES:
            continue
        # Title IV, degree-granting, active, one of the six degree-granting sectors (public / nonprofit / for-profit × 4-year / 2-year).
        if h['PSET4FLG'] != '1' or h['DEGGRANT'] != '1' or h['CYACTIVE'] != '1' or h['SECTOR'] not in ('1', '2', '3', '4', '5', '6'):
            continue
        d = dist.get(u, {})
        a = d.get('1', {})
        ug = d.get('2', {})
        gr = d.get('12', {})
        c = ay.get(u, {})
        s = sc.get(u, {})
        rec = {
            'u': int(u), 'n': h['INSTNM'], 'city': h['CITY'], 'st': h['STABBR'],
            'ctrl': int(h['CONTROL']), 'lvl': int(h['ICLEVEL']), 'cat': ival(h.get('INSTCAT')),
            'tot': ival(a.get('EFDETOT')), 'exc': ival(a.get('EFDEEXC')), 'som': ival(a.get('EFDESOM')),
            'ugTot': ival(ug.get('EFDETOT')), 'ugExc': ival(ug.get('EFDEEXC')),
            'grTot': ival(gr.get('EFDETOT')), 'grExc': ival(gr.get('EFDEEXC')),
            'h1': ival(c.get('HRCHG1')), 'h2': ival(c.get('HRCHG2')), 'h3': ival(c.get('HRCHG3')),
            'h5': ival(c.get('HRCHG5')), 'h6': ival(c.get('HRCHG6')), 'h7': ival(c.get('HRCHG7')),
            't2': ival(c.get('TUITION2')), 'f2': ival(c.get('FEE2')), 't3': ival(c.get('TUITION3')), 'f3': ival(c.get('FEE3')),
            'acc': s.get('ACCREDAGENCY') or None, 'accc': s.get('ACCREDCODE') or None,
            'om8': num(s.get('OMAWDP8_ALL')), 'om8ft': num(s.get('OMAWDP8_FTFT')), 'om8pt': num(s.get('OMAWDP8_PTNFT')),
            'pell': num(s.get('PCTPELL')), 'debt': ival(s.get('DEBT_MDN')), 'gdebt': ival(s.get('GRAD_DEBT_MDN')),
            'earn': ival(s.get('MD_EARN_WNE_P10')), 'ug25': num(s.get('UG25ABV')),
            'np': ival(s.get('NPT4_PUB')) if s.get('NPT4_PUB') not in ('', 'NA', None) else ival(s.get('NPT4_PRIV')),
            'ope': int(h['OPEFLAG']) if h['OPEFLAG'].isdigit() else None,
            'open': 1 if s.get('OPENADMP') == '1' else 0 if s.get('OPENADMP') == '2' else None,
            'hcm2': 1 if s.get('HCM2') == '1' else 0,
            'donly': 1 if s.get('DISTANCEONLY') == '1' else 0,
        }
        # Zero per-credit charges are "not reported" in practice (community colleges with no tuition are listed with t2 = 0).
        for k in ('h1', 'h2', 'h3', 'h5', 'h6', 'h7'):
            if rec[k] is not None and rec[k] <= 0:
                rec[k] = None
        rec['share'] = round(rec['exc'] / rec['tot'], 4) if rec['exc'] is not None and rec['tot'] else None
        colleges.append(rec)
    colleges.sort(key=lambda r: (-(r['exc'] or 0), r['n']))

    def eff(r):
        """In-state per-credit charge plus the year's required fees spread over 30 credits, kept to the cent.
        Rounded to the dollar here, it made 120 × eff differ from the calculator's 120 × charge + 4 years of fees
        ($14,640 against $14,688 for the same university, naive testers 2026-11-14): pages round only when they print."""
        if not r.get('h2'):
            return None
        return round(r['h2'] + (r['f2'] or 0) / 30, 2)

    def eff4(r):
        """Like eff, but a university with one yearly price and no per-credit charge counts at that price over 30 credits."""
        if r.get('h2'):
            return eff(r)
        if not r.get('t2') or r['t2'] <= 0:
            return None
        return round((r['t2'] + (r['f2'] or 0)) / 30, 2)

    def state_block(code):
        """Per-state figures; `cheapest` = lowest per-credit charge plus fees spread over 30 credits."""
        L = [r for r in colleges if r['st'] == code]
        online = [r for r in L if (r['exc'] or 0) >= 50]
        pub = [r for r in online if r['ctrl'] == 1 and r['h2']]
        npf = [r for r in online if r['ctrl'] == 2 and r['h2']]
        fp = [r for r in online if r['ctrl'] == 3 and r['h2']]
        tot = sum(r['tot'] or 0 for r in L)
        exc = sum(r['exc'] or 0 for r in L)
        som = sum(r['som'] or 0 for r in L)
        pub_all = [r for r in L if r['ctrl'] == 1 and r['h2']]
        # Among public colleges with 50+ fully online students; four-year = primarily baccalaureate (INSTCAT 2).
        cheapest = min(pub, key=eff) if pub else None
        # Four-year line: flat-priced universities count too, at their yearly price over 30 credits. Requiring a
        # per-credit charge left out every Cal State and UC campus, so California's "lowest four-year university" was
        # University of Massachusetts Global at $517.33 (naive testers, 2026-11-14, tour 4; tests/coherence.test.ts).
        pub4 = [r for r in online if r['ctrl'] == 1 and r['cat'] == 2 and eff4(r) is not None]
        cheapest4 = min(pub4, key=eff4, default=None)
        largest = online[0] if online else None
        prem = [r['h3'] - r['h2'] for r in pub if r['h3'] and r['h2'] and r['h3'] >= r['h2']]
        om = [r['om8'] for r in online if r['om8'] is not None]
        top = sorted(online, key=lambda r: -(r['exc'] or 0))[:12]
        return {
            'code': code, 'name': STATES[code], 'n': len(L), 'nOnline': len(online), 'nWithCredit': len([r for r in online if r['h2']]),
            'tot': tot, 'exc': exc, 'som': som, 'share': round(exc / tot, 4) if tot else None,
            'nPub': len(pub), 'nNpf': len(npf), 'nFp': len(fp),
            'medPub': median([r['h2'] for r in pub]), 'medPub4': median([r['h2'] for r in pub if r['lvl'] == 1]), 'nPub4': len([r for r in pub if r['lvl'] == 1]), 'medPub2': median([r['h2'] for r in pub if r['lvl'] == 2]), 'medNpf': median([r['h2'] for r in npf]), 'medFp': median([r['h2'] for r in fp]),
            'medGrad': median([r['h6'] for r in online if r['h6']]),
            'cheapest': {'u': cheapest['u'], 'n': cheapest['n'], 'h2': cheapest['h2'], 'f2': cheapest['f2'], 'eff': eff(cheapest), 'lvl': cheapest['lvl'], 'om8': cheapest['om8']} if cheapest else None,
            'cheapest4': {'u': cheapest4['u'], 'n': cheapest4['n'], 'city': cheapest4['city'], 'h2': cheapest4['h2'], 't2': None if cheapest4['h2'] else cheapest4['t2'], 'f2': cheapest4['f2'], 'eff': eff4(cheapest4), 'om8': cheapest4['om8']} if cheapest4 else None,
            'medEffPub': median([eff(r) for r in pub]),
            'largest': {'u': largest['u'], 'n': largest['n'], 'exc': largest['exc'], 'share': largest['share']} if largest else None,
            'medPremium': median(prem), 'nPremium': len(prem), 'nNoPremium': len([r for r in pub if r['h3'] and r['h2'] and r['h3'] == r['h2']]),
            'medOm8': round(statistics.median(om), 4) if om else None,
            'top': [r['u'] for r in top],
        }

    states = {c: state_block(c) for c in STATES}
    # ONE population for every national median and count (naive testers, 2026-11-14, tour 3): medians were taken on
    # all 3,801 colleges while percentiles and shares used the 2,530 with 50+ fully online students, so the site
    # printed $278 and $302 as "the median", and type counts (752 + 772 + 1,171 + 169) that summed to neither 2,530
    # nor 2,343. Now every median and type count is read on ONLINE; `n` stays only as "all colleges in the federal list".
    ONLINE = [r for r in colleges if (r['exc'] or 0) >= 50]
    q90 = round(statistics.quantiles([r['h2'] for r in ONLINE if r['h2']], n=100, method='inclusive')[89])
    nat = {
        'n': len(colleges), 'nOnline': len([r for r in colleges if (r['exc'] or 0) >= 50]),
        'tot': sum(r['tot'] or 0 for r in colleges), 'exc': sum(r['exc'] or 0 for r in colleges), 'som': sum(r['som'] or 0 for r in colleges),
        'nH2': len([r for r in ONLINE if r['h2']]), 'nH6': len([r for r in ONLINE if r['h6']]),
        'medPub4': median([r['h2'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 1 and r['h2']]),
        'medPub2': median([r['h2'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 2 and r['h2']]),
        'medPub2d': median([r['h1'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 2 and r['h1']]),
        'medNpf4': median([r['h2'] for r in ONLINE if r['ctrl'] == 2 and r['lvl'] == 1 and r['h2']]),
        'medFp4': median([r['h2'] for r in ONLINE if r['ctrl'] == 3 and r['lvl'] == 1 and r['h2']]),
        'medPub4out': median([r['h3'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 1 and r['h3']]),
        'medGradPub': median([r['h6'] for r in ONLINE if r['ctrl'] == 1 and r['h6']]),
        'medGradPubOut': median([r['h7'] for r in ONLINE if r['ctrl'] == 1 and r['h7']]),
        'medGradNpf': median([r['h6'] for r in ONLINE if r['ctrl'] == 2 and r['h6']]),
        'medGradFp': median([r['h6'] for r in ONLINE if r['ctrl'] == 3 and r['h6']]),
        'medOm8Online': round(statistics.median([r['om8'] for r in colleges if r['om8'] is not None and (r['share'] or 0) >= 0.5]), 4),
        'medOm8Campus': round(statistics.median([r['om8'] for r in colleges if r['om8'] is not None and (r['share'] or 0) < 0.25]), 4),
        'medFeePub4': median([r['f2'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 1 and r['h2'] and r['f2'] is not None]),
        'medFeePub2': median([r['f2'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 2 and r['h2'] and r['f2'] is not None]),
        'medFeeNpf4': median([r['f2'] for r in ONLINE if r['ctrl'] == 2 and r['lvl'] == 1 and r['h2'] and r['f2'] is not None]),
        'medFeeFp4': median([r['f2'] for r in ONLINE if r['ctrl'] == 3 and r['lvl'] == 1 and r['h2'] and r['f2'] is not None]),
        'medPub2out': median([r['h3'] for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 2 and r['h3']]),
        'nPub4': len([r for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 1 and r['h2']]),
        'nPub2': len([r for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 2 and r['h2']]),
        'nNpf4': len([r for r in ONLINE if r['ctrl'] == 2 and r['lvl'] == 1 and r['h2']]),
        'nFp4': len([r for r in ONLINE if r['ctrl'] == 3 and r['lvl'] == 1 and r['h2']]),
        'nPriv2': len([r for r in ONLINE if r['ctrl'] in (2, 3) and r['lvl'] == 2 and r['h2']]),
        'nAboveQ90': len([r for r in ONLINE if r['h2'] and r['h2'] > q90]),
        'nAboveQ90Npf': len([r for r in ONLINE if r['h2'] and r['h2'] > q90 and r['ctrl'] == 2]),
        'nSameOut': len([r for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 1 and r['h2'] and r['h3'] == r['h2']]),
        'nPub4Out': len([r for r in ONLINE if r['ctrl'] == 1 and r['lvl'] == 1 and r['h2'] and r['h3']]),
        'nOm8Online': len([r for r in colleges if r['om8'] is not None and (r['share'] or 0) >= 0.5]),
        'nOm8Campus': len([r for r in colleges if r['om8'] is not None and (r['share'] or 0) < 0.25]),
        'nAcc': len([r for r in colleges if r['acc'] and r['acc'] != 'NA' and (r['exc'] or 0) >= 50]),
        'nNoAcc': len([r for r in colleges if (not r['acc'] or r['acc'] == 'NA') and (r['exc'] or 0) >= 50]),
        'nPellData': len([r for r in colleges if r['pell'] is not None and (r['exc'] or 0) >= 50]),
        'medPellOnline': round(statistics.median([r['pell'] for r in colleges if r['pell'] is not None and (r['share'] or 0) >= 0.5]), 4),
        'medDebtOnline': median([r['debt'] for r in colleges if r['debt'] and (r['share'] or 0) >= 0.5]),
        'medEarnOnline': median([r['earn'] for r in colleges if r['earn'] and (r['share'] or 0) >= 0.5]),
        'medNpOnline': median([r['np'] for r in colleges if r['np'] and (r['share'] or 0) >= 0.5]),
        'nNpOnline': len([r for r in colleges if r['np'] and (r['share'] or 0) >= 0.5]),
        # Percentiles 0..100 of the in-state per-credit charge among schools with 50+ fully online students.
        'q': [round(statistics.quantiles([r['h2'] for r in colleges if r['h2'] and (r['exc'] or 0) >= 50], n=100, method='inclusive')[i - 1]) if 0 < i < 100 else (min if i == 0 else max)([r['h2'] for r in colleges if r['h2'] and (r['exc'] or 0) >= 50]) for i in range(101)],
        'nQ': len([r for r in colleges if r['h2'] and (r['exc'] or 0) >= 50]),
        'nMostlyOnline': len([r for r in colleges if (r['share'] or 0) >= 0.5 and (r['exc'] or 0) >= 50]),
        'accreditors': sorted(
            [(k, v) for k, v in __import__('collections').Counter(r['acc'] for r in colleges if r['acc'] and (r['exc'] or 0) >= 50).items()],
            key=lambda kv: -kv[1])[:20],
    }
    meta = {
        'built': '2026-11-13',
        'ipedsYear': '2023-24', 'ipedsFall': 'fall 2023', 'hdYear': '2024-25',
        'scorecardRelease': '2026-11-02',
        'files': FILES,
        'national': nat,
    }
    # Compact files for the browser bundles (RECETTE §20): the full list stays server-side.
    # The twenty largest by fully online enrollment (fall 2023), whatever their type: no hand-picked list.
    FEATURED = [r['u'] for r in sorted(colleges, key=lambda r: (-(r['exc'] or 0), r['n']))[:20]]
    by_id = {r['u']: r for r in colleges}
    slim = lambda r: {k: r[k] for k in ('u', 'n', 'st', 'ctrl', 'lvl', 'exc', 'share', 'h2', 'h3', 'h6', 'f2', 'om8') if k in r} | {'eff': eff(r)}
    top_by_state = {c: [slim(by_id[u]) for u in s['top']] for c, s in states.items()}
    featured = [slim(by_id[u]) | {'acc': by_id[u]['acc'], 'accc': by_id[u]['accc'], 'h1': by_id[u]['h1'], 't2': by_id[u]['t2'], 't3': by_id[u]['t3'], 'f3': by_id[u]['f3'], 'city': by_id[u]['city'], 'ug25': by_id[u]['ug25'], 'pell': by_id[u]['pell'], 'debt': by_id[u]['debt'], 'earn': by_id[u]['earn'], 'om8ft': by_id[u]['om8ft'], 'om8pt': by_id[u]['om8pt'], 'grTot': by_id[u]['grTot'], 'grExc': by_id[u]['grExc'], 'ugTot': by_id[u]['ugTot'], 'ugExc': by_id[u]['ugExc'], 'np': by_id[u]['np'], 'open': by_id[u]['open'], 'tot': by_id[u]['tot'], 'som': by_id[u]['som'], 'h5': by_id[u]['h5'], 'h7': by_id[u]['h7']} for u in FEATURED if u in by_id]
    missing = [u for u in FEATURED if u not in by_id]
    if missing:
        print('featured not in universe:', missing)
    # Cheapest per-credit charges among schools with at least 500 fully online students (national list).
    # Ranked on the per-credit charge plus required fees spread over 30 credits (a full-time year): Massachusetts
    # community colleges charge $24 a credit of tuition but about $5,000 a year of fees, so tuition alone misleads.
    pool = [r for r in colleges if r['h2'] and r['f2'] is not None and (r['exc'] or 0) >= 500]
    cheapest = [slim(r) for r in sorted(pool, key=lambda r: (eff(r), -(r['exc'] or 0)))[:80]]
    # Bachelor's list: INSTCAT 2 = degree-granting, primarily baccalaureate or above (community colleges that offer one
    # or two bachelor's programs are left out). Out-of-state list: charge for a student from another state, same rule.
    bpool = [r for r in pool if r['cat'] == 2]
    cheapest4 = [slim(r) for r in sorted(bpool, key=lambda r: (eff(r), -(r['exc'] or 0)))[:40]]
    effo = lambda r: round(r['h3'] + (r['f3'] if r['f3'] is not None else (r['f2'] or 0)) / 30, 2)
    cheapestOut = [slim(r) | {'effo': effo(r)} for r in sorted([r for r in bpool if r['h3']], key=lambda r: (effo(r), -(r['exc'] or 0)))[:40]]
    json.dump(cheapestOut, open(os.path.join(OUT, 'cheapest-out.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(cheapest4, open(os.path.join(OUT, 'cheapest4.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    os.makedirs(OUT, exist_ok=True)
    json.dump(top_by_state, open(os.path.join(OUT, 'top-by-state.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(featured, open(os.path.join(OUT, 'featured.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(cheapest, open(os.path.join(OUT, 'cheapest.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(colleges, open(os.path.join(OUT, 'colleges.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(states, open(os.path.join(OUT, 'states.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(meta, open(os.path.join(OUT, 'data-meta.json'), 'w'), ensure_ascii=False, indent=1)
    print(f"{len(colleges)} colleges, {len(states)} states; {nat['nH2']} with an in-state per-credit charge; {nat['exc']:,} students fully online of {nat['tot']:,}")


if __name__ == '__main__':
    main()
