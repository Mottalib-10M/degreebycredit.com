#!/usr/bin/env python3
"""Builds src/data/programs.json and src/data/programs-b.json: programs that can be completed entirely online, by
field and award level, at the colleges of colleges.json, with each college's per-credit charge.

Replayable after scripts/build-data.py: `python3 scripts/build-programs.py [--raw data/raw]`. Without the raw file in
place it downloads it with plain curl from nces.ed.gov (public file, no account, no key).

Input: C2024DEP.zip, IPEDS "Number of programs offered and number of programs offered via distance education",
2023-24 completions, provisional release of September 2025 (public domain, NCES). For each college and six-digit CIP
code it gives, by award level, the number of programs offered and the number that can be completed entirely via
distance education (all programs of the code: …DE; some of them: …DES). A college "offers the program fully online"
here when …DE + …DES > 0 at that level. Nothing else is inferred: no ranking, no quality score.

Prices: per-credit charges of IC2023_AY already in colleges.json, undergraduate (HRCHG2 in-state, HRCHG3 out-of-state)
for certificates, associate and bachelor's degrees, graduate (HRCHG6, HRCHG7) for master's and doctorates.
"""
import csv, io, json, os, statistics, subprocess, sys, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'data', 'raw')
if '--raw' in sys.argv:
    RAW = sys.argv[sys.argv.index('--raw') + 1]
OUT = os.path.join(ROOT, 'src', 'data')
FILE = 'C2024DEP.zip'
URL = 'https://nces.ed.gov/ipeds/datacenter/data/C2024DEP.zip'

# Fields: CIP codes (six-digit, or a prefix ending in '.' for a whole series) and the levels the page shows.
# Levels: cert = undergraduate certificates of every length, assoc, bach, mast, docr = research doctorate (PhD),
# docp = doctor's degree, professional practice and other (JD, DNP...).
FIELDS = {
    'nursing': {'cip': ['51.38'], 'levels': ['assoc', 'bach', 'mast', 'docp'], 'main': 'bach'},
    'mba': {'cip': ['52.0201'], 'levels': ['mast'], 'main': 'mast'},
    'accounting': {'cip': ['52.0301', '52.0302', '52.0304', '52.0305'], 'levels': ['cert', 'assoc', 'bach', 'mast'], 'main': 'bach'},
    'medassist': {'cip': ['51.0801'], 'levels': ['cert', 'assoc'], 'main': 'cert'},
    'healthadmin': {'cip': ['51.0701', '51.0702'], 'levels': ['bach', 'mast', 'docr'], 'main': 'mast'},
    'law': {'cip': ['22.0101'], 'levels': ['docp'], 'main': 'docp'},
    'phd': {'cip': ['*'], 'levels': ['docr'], 'main': 'docr'},
    'coding': {'cip': ['51.0707', '51.0713', '51.0714'], 'levels': ['cert', 'assoc', 'bach'], 'main': 'cert'},
    'all': {'cip': ['*'], 'levels': ['cert', 'assoc', 'bach', 'mast', 'docr', 'docp'], 'main': 'bach'},
}
LEVEL_COLS = {
    'cert': ['CERT1A', 'CERT1B', 'CERT2', 'CERT4'], 'assoc': ['ASSOC'], 'bach': ['BACHL'], 'mast': ['MASTR'],
    'docr': ['DOCRS'], 'docp': ['DOCPP', 'DOCOT'],
}
GRAD = {'mast', 'docr', 'docp'}


def fetch():
    p = os.path.join(RAW, FILE)
    if not os.path.exists(p) or os.path.getsize(p) == 0:
        os.makedirs(RAW, exist_ok=True)
        print('download', URL)
        subprocess.run(['curl', '-sL', '--max-time', '900', '-o', p, URL], check=True)


def rows():
    with zipfile.ZipFile(os.path.join(RAW, FILE)) as z:
        n = [x for x in z.namelist() if x.lower().endswith('.csv')][0]
        txt = z.read(n).decode('utf-8-sig', errors='ignore')
    rd = csv.DictReader(io.StringIO(txt))
    rd.fieldnames = [f.replace('﻿', '').strip() for f in rd.fieldnames]
    for r in rd:
        yield {k: (v or '').strip() for k, v in r.items() if k}


def iv(s):
    try:
        return int(float(s))
    except (TypeError, ValueError):
        return 0


def median(xs):
    xs = [x for x in xs if x]
    return round(statistics.median(xs)) if xs else None


def match(cip, codes):
    if cip == '99' or len(cip) < 7:  # grand total and two-digit series rows
        return False
    return any(c == '*' or (cip.startswith(c) if c.endswith('.') or len(c) < 7 else cip == c) for c in codes)


def main():
    fetch()
    colleges = {c['u']: c for c in json.load(open(os.path.join(OUT, 'colleges.json')))}
    # per field, per level: unitid -> [programs offered, programs fully online (all + some)]
    acc = {f: {lv: {} for lv in d['levels']} for f, d in FIELDS.items()}
    totals = {}
    phd_family = {}
    for r in rows():
        u = iv(r['UNITID'])
        if u not in colleges:
            continue
        cip = r['CIPCODE']
        if cip == '99':
            totals[u] = {'p': iv(r['PTOTAL']), 'de': iv(r['PTOTALDE']) + iv(r['PTOTALDES'])}
            continue
        for f, d in FIELDS.items():
            if not match(cip, d['cip']):
                continue
            for lv in d['levels']:
                off = sum(iv(r['P' + c]) for c in LEVEL_COLS[lv])
                de = sum(iv(r['P' + c + 'DE']) + iv(r['P' + c + 'DES']) for c in LEVEL_COLS[lv])
                if off:
                    a = acc[f][lv].setdefault(u, [0, 0])
                    a[0] += off
                    a[1] += de
        if len(cip) == 7 and iv(r['PDOCRSDE']) + iv(r['PDOCRSDES']) > 0:
            fam = cip[:2]
            phd_family.setdefault(fam, set()).add(u)

    def price(c, lv, out=False):
        if lv in GRAD:
            return c['h7'] if out else c['h6']
        return c['h3'] if out else c['h2']

    def eff(c, lv):
        """Undergraduate: per-credit charge plus the year's required fees spread over 30 credits (as on the rest of the
        site); graduate: the per-credit charge alone (IPEDS reports no graduate fee)."""
        p = price(c, lv)
        if not p:
            return None
        return p if lv in GRAD else round(p + (c['f2'] or 0) / 30)

    def slim(c, lv, n_online):
        return {'pe': eff(c, lv), 'u': c['u'], 'n': c['n'], 'st': c['st'], 'ctrl': c['ctrl'], 'lvl': c['lvl'], 'p': price(c, lv), 'po': price(c, lv, True),
                'f2': c['f2'] if lv not in GRAD else None, 'exc': c['exc'], 'om8': c['om8'], 'k': n_online}

    out, browser = {}, {}
    for f, d in FIELDS.items():
        F = {'levels': {}}
        B = {'levels': {}}
        for lv in d['levels']:
            m = acc[f][lv]
            offering = [u for u, (o, de) in m.items() if o > 0]
            online = [u for u, (o, de) in m.items() if de > 0]
            L = [colleges[u] for u in online]
            pub = [c for c in L if c['ctrl'] == 1]
            npf = [c for c in L if c['ctrl'] == 2]
            fp = [c for c in L if c['ctrl'] == 3]
            st = {}
            for c in L:
                s = st.setdefault(c['st'], {'n': 0, 'nPub': 0, 'low': None})
                s['n'] += 1
                if c['ctrl'] == 1:
                    s['nPub'] += 1
                p = price(c, lv)
                e = eff(c, lv)
                if c['ctrl'] == 1 and e and (s['low'] is None or e < s['low']['p']):
                    s['low'] = {'n': c['n'], 'p': e}
            priced = [c for c in L if price(c, lv)]
            cheapest = sorted(priced, key=lambda c: (eff(c, lv), -(c['exc'] or 0), c['n']))
            bigger = sorted(L, key=lambda c: (-(m[c['u']][1]), -(c['exc'] or 0), c['n']))
            med = {
                'pub': median([price(c, lv) for c in pub]), 'pubOut': median([price(c, lv, True) for c in pub]),
                'npf': median([price(c, lv) for c in npf]), 'fp': median([price(c, lv) for c in fp]),
                'pubEff': median([eff(c, lv) for c in pub]),
            }
            F['levels'][lv] = {
                'nOffer': len(offering), 'nOnline': len(online), 'nPub': len(pub), 'nNpf': len(npf), 'nFp': len(fp),
                'nPriced': len(priced), 'nPrograms': sum(m[u][1] for u in online), 'med': med,
                'nStates': len(st),
                'cheapest': [slim(c, lv, m[c['u']][1]) for c in cheapest[:25]],
                'cheapestPub': [slim(c, lv, m[c['u']][1]) for c in cheapest if c['ctrl'] == 1][:15],
                'most': [slim(c, lv, m[c['u']][1]) for c in bigger[:15]],
                'states': st,
            }
            B['levels'][lv] = {'n': len(online), 'nPub': len(pub), 'med': med, 'st': {k: [v['n'], v['low']['n'] if v['low'] else None, v['low']['p'] if v['low'] else None] for k, v in st.items()}}
        out[f] = F
        browser[f] = B
    # PhD fields: number of colleges with a research doctorate that can be completed fully online, by CIP series.
    out['phd']['families'] = sorted([[k, len(v)] for k, v in phd_family.items()], key=lambda kv: -kv[1])
    # Colleges with the most programs that can be completed fully online (grand-total row of the file).
    allc = [(u, t) for u, t in totals.items() if t['de'] > 0]
    out['all']['nAnyOnline'] = len(allc)
    out['all']['nAny'] = len(totals)
    out['all']['programsOnline'] = sum(t['de'] for _, t in allc)
    out['all']['programs'] = sum(t['p'] for t in totals.values())
    out['all']['top'] = [{'u': u, 'n': colleges[u]['n'], 'st': colleges[u]['st'], 'ctrl': colleges[u]['ctrl'], 'lvl': colleges[u]['lvl'],
                          'k': t['de'], 'p': t['p'], 'h2': colleges[u]['h2'], 'h6': colleges[u]['h6'], 'exc': colleges[u]['exc'], 'om8': colleges[u]['om8']}
                         for u, t in sorted(allc, key=lambda x: (-x[1]['de'], colleges[x[0]]['n']))[:25]]
    stc = {}
    for u, t in allc:
        s = stc.setdefault(colleges[u]['st'], [0, 0])
        s[0] += 1
        s[1] += t['de']
    out['all']['byState'] = stc
    browser['all']['byState'] = stc
    meta = {'file': FILE, 'url': URL, 'completionsYear': '2023-24', 'release': 'provisional release, September 2025', 'read': '2026-11-14'}
    # Law (JD): yearly tuition and fees for the law program, IC2023_AY ISPROF9 / OSPROF9 / ISPFEE9 / OSPFEE9.
    with zipfile.ZipFile(os.path.join(RAW, 'IC2023_AY.zip')) as z:
        n = [x for x in z.namelist() if x.lower().endswith('.csv')][0]
        ic = csv.DictReader(io.StringIO(z.read(n).decode('latin-1')))
        ic.fieldnames = [f.replace('\ufeff', '').replace('ï»¿', '').strip() for f in ic.fieldnames]
        law = {}
        for r in ic:
            u = iv(r['UNITID'])
            t = iv(r.get('ISPROF9'))
            if u in colleges and t > 0:
                law[u] = {'t': t, 'f': iv(r.get('ISPFEE9')), 'to': iv(r.get('OSPROF9')) or None, 'fo': iv(r.get('OSPFEE9'))}
    L = out['law']
    lawc = [colleges[u] for u in law]
    L['tuition'] = {
        'n': len(law), 'nPub': len([c for c in lawc if c['ctrl'] == 1]), 'nNpf': len([c for c in lawc if c['ctrl'] == 2]),
        'medPub': median([law[c['u']]['t'] for c in lawc if c['ctrl'] == 1]),
        'medPubOut': median([law[c['u']]['to'] for c in lawc if c['ctrl'] == 1]),
        'medNpf': median([law[c['u']]['t'] for c in lawc if c['ctrl'] == 2]),
        'medFee': median([law[c['u']]['f'] for c in lawc]),
    }
    onl = set(u for u, (o, de) in acc['law']['docp'].items() if de > 0)
    L['online'] = sorted([{'u': u, 'n': colleges[u]['n'], 'st': colleges[u]['st'], 'ctrl': colleges[u]['ctrl'], 'exc': colleges[u]['exc'],
                           't': law[u]['t'] if u in law else None, 'f': law[u]['f'] if u in law else None, 'to': law[u]['to'] if u in law else None,
                           'h6': colleges[u]['h6']} for u in onl], key=lambda r: (r['t'] or 10**9, r['n']))
    L['medOnline'] = median([r['t'] for r in L['online']])
    browser['law']['tuition'] = L['tuition']
    browser['law']['online'] = [{k: r[k] for k in ('n', 'st', 'ctrl', 't', 'f', 'to')} for r in L['online'] if r['t']]
    out['meta'] = meta
    browser['meta'] = meta
    json.dump(out, open(os.path.join(OUT, 'programs.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump(browser, open(os.path.join(OUT, 'programs-b.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    for f in FIELDS:
        print(f, {lv: (v['nOnline'], v['med']) for lv, v in out[f]['levels'].items()})
    print('all colleges with a fully online program:', out['all']['nAnyOnline'], 'of', out['all']['nAny'])


if __name__ == '__main__':
    main()
