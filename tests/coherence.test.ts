/**
 * One figure, one value (naive testers, 2026-11-14). The home calculator said $39,410 (12 credits a term, 5 years of
 * fees) while the table and the FAQ under it said $38,200 (4 years of fees); the cheapest-bachelor intro said $14,640
 * (a per-credit price rounded to the dollar, times 120) while its calculator said $14,688. These tests lock the fix:
 *  1. the calculator's starting values and the home table come from the same function (lib/pace.ts);
 *  2. in the built pages, the calculator's result, the table row and the FAQ answer print the same amount.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getSpec } from '../src/lib/mini-specs';
import { degreeAtPace } from '../src/lib/pace';
import { NAT, CHEAPEST4 } from '../src/lib/data';
import { formatMoney } from '../src/lib/format';

const m = (n: number) => formatMoney(Math.round(n), 0);
const defaults = (id: string) => Object.fromEntries(getSpec(id).inputs.map((i) => [i.id, i.def]));
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| | /g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ');

describe('home: calculator = table = FAQ', () => {
  const types: Array<[number, number, number]> = [
    [0, NAT.medPub4, NAT.medFeePub4],
    [1, NAT.medPub4out, NAT.medFeePub4],
    [2, NAT.medNpf4, NAT.medFeeNpf4],
    [3, NAT.medFp4, NAT.medFeeFp4],
  ];
  it.each(types)('type of school %i: calculator total equals the table’s 120-credit total', (sector, rate, fees) => {
    const v = { ...defaults('degree-cost'), sector };
    expect(getSpec('degree-cost').run(v, {}).head[1]).toBe(m(degreeAtPace(rate, fees, 120).net));
  });
  it('the default pace finishes a 120-credit bachelor’s in 4 years, as every table says', () => {
    expect(degreeAtPace(NAT.medPub4, NAT.medFeePub4, 120).years).toBe(4);
  });

  const page = 'dist/en/index.html';
  it.runIf(existsSync(page))('built home page prints one total for the public resident bachelor’s', () => {
    const t = text(readFileSync(page, 'utf8'));
    const want = m(degreeAtPace(NAT.medPub4, NAT.medFeePub4, 120).net);
    const calc = getSpec('degree-cost').run(defaults('degree-cost'), {}).head[1];
    expect(calc).toBe(want);
    // Table row and FAQ answer.
    expect(t).toMatch(new RegExp(`Public university, state resident [^A-Za-z]*\\${want}`));
    expect(t).toContain(`comes to about ${want} for a state resident`);
    // The old, contradicting total never comes back.
    const fiveYears = m(NAT.medPub4 * 120 + 5 * NAT.medFeePub4);
    expect(t.includes(fiveYears), `${fiveYears} (5 years of fees) still printed`).toBe(false);
  });
});

describe('cheapest bachelor’s: intro = calculator', () => {
  const page = 'dist/en/cheapest-online-bachelors-degree/index.html';
  it('first university: intro total equals the calculator’s default result', () => {
    const c = CHEAPEST4[0];
    const calc = getSpec('cheap-bachelor').run(defaults('cheap-bachelor'), {}).head[1];
    expect(calc).toBe(m((c.eff ?? 0) * 120));
    expect(calc).toBe(m(degreeAtPace(c.h2 ?? 0, c.f2 ?? 0, 120).net));
  });
  it.runIf(existsSync(page))('built page prints the calculator’s total in its intro', () => {
    const t = text(readFileSync(page, 'utf8'));
    const calc = getSpec('cheap-bachelor').run(defaults('cheap-bachelor'), {}).head[1];
    expect(t).toContain(`${CHEAPEST4[0].n} comes to ${calc} for 120 credits`);
  });
});

/* Tour 3 (naive testers, 2026-11-14): one count, one population for every median, one pace, totals that multiply. */
import { COLLEGES, STATES } from '../src/lib/data';
import { PACE } from '../src/lib/pace';
import { STATES_B, CHEAP_B } from '../src/lib/browser-data';
import { formatNumber } from '../src/lib/format';

const n0 = (x: number) => formatNumber(x, 0);
const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const k = s.length; return Math.round(k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2); };
const ONLINE = COLLEGES.filter((c) => (c.exc ?? 0) >= 50);

describe('1. one reference count of colleges', () => {
  it('the online colleges are the 50+ fully online ones, and the type counts add up to those with a price per credit', () => {
    expect(NAT.nOnline).toBe(ONLINE.length);
    expect(NAT.nQ).toBe(ONLINE.filter((c) => c.h2).length);
    expect(NAT.nPub2 + NAT.nPub4 + NAT.nNpf4 + NAT.nFp4 + NAT.nPriv2).toBe(NAT.nQ);
  });
  const home = 'dist/en/index.html';
  it.runIf(existsSync(home))('home title and description give the reference count, and promise no state field', () => {
    const html = readFileSync(home, 'utf8');
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
    expect(title).toContain(n0(NAT.nOnline));
    expect(desc).toContain(n0(NAT.nOnline));
    expect(desc).not.toMatch(/your state/i);
    expect(text(html)).toContain(`${n0(NAT.nOnline)} online colleges`);
  });
  // Tour 4: one count of colleges everywhere (editor, 2026-11-14): neither the whole federal list nor the subset with
  // a price per credit is printed, only the online colleges, the count of the title.
  it.runIf(existsSync('dist/en'))('only one count of colleges is printed: the online colleges of the title', () => {
    const others = [n0(NAT.n), n0(NAT.nQ)];
    const files = ['dist/llms.txt', ...['index.html', 'online-colleges-that-accept-fafsa/index.html', 'method/index.html', 'cost-per-credit-hour/index.html', 'affordable-online-colleges/index.html'].map((p) => `dist/en/${p}`)];
    for (const f of files.filter(existsSync)) {
      const t = text(readFileSync(f, 'utf8'));
      for (const x of others) expect(t.includes(x), `${f}: ${x} printed`).toBe(false);
    }
  });

});

describe('2. every national median is read on the online colleges', () => {
  it('public university, nonprofit, for-profit and fee medians match a recount on the 50+ fully online colleges', () => {
    const pick = (ctrl: number, lvl: number, k: 'h2' | 'h3' | 'f2') => ONLINE.filter((c) => c.ctrl === ctrl && c.lvl === lvl && c.h2 && c[k] != null).map((c) => c[k] as number);
    expect(NAT.medPub4).toBe(median(pick(1, 1, 'h2')));
    expect(NAT.medNpf4).toBe(median(pick(2, 1, 'h2')));
    expect(NAT.medFp4).toBe(median(pick(3, 1, 'h2')));
    expect(NAT.medFeePub4).toBe(median(pick(1, 1, 'f2')));
    expect(NAT.q[50]).toBe(median(ONLINE.filter((c) => c.h2).map((c) => c.h2 as number)));
  });
  it('the share of colleges is labelled with the price it was read on, never with the fees-included price', () => {
    const out = getSpec('credit-hour').run(defaults('credit-hour'), {});
    const row = out.rows.find(([l]) => /or less/.test(l));
    expect(row?.[0]).toContain(`${m(NAT.medPub4)} a credit or less, before fees`);
  });
  const home = 'dist/en/index.html';
  it.runIf(existsSync(home))('state medians on the home page say community colleges are included', () => {
    const t = text(readFileSync(home, 'utf8'));
    const ca = STATES.CA.medPub;
    expect(t).toMatch(/California\s*:/);
    expect(t).toMatch(new RegExp(`community colleges included,? \\${m(ca ?? 0)} a credit`));
  });
});

describe('3. one pace for every calculator', () => {
  it('every undergraduate calculator starts at the site pace', () => {
    const year = PACE.creditsPerTerm * PACE.termsPerYear;
    expect(defaults('degree-cost').perTerm).toBe(PACE.creditsPerTerm);
    expect(defaults('credit-hour').perTerm).toBe(PACE.creditsPerTerm);
    expect(defaults('credit-hour').terms).toBe(PACE.termsPerYear);
    expect(defaults('bachelor-pace').perTerm).toBe(PACE.creditsPerTerm);
    expect(defaults('bachelor-pace').terms).toBe(PACE.termsPerYear);
    expect(defaults('afford').credits).toBe(year);
    expect(defaults('fafsa-grant').credits).toBe(year);
    expect(getSpec('transfer').run(defaults('transfer'), {}).hyp).toContain(`terms of ${PACE.creditsPerTerm} credits`);
  });
});

describe('6. cheapest online colleges: prices that multiply, intro and calculator on the same state', () => {
  const page = 'dist/en/cheapest-online-colleges/index.html';
  it('the calculator opens on the state of the college the intro names', () => {
    expect(STATES_B[defaults('cheap-pick').st].code).toBe(CHEAP_B[0].st);
  });
  it.runIf(existsSync(page))('each “$X a credit with fees, so about $Y for 60 credits” holds: X × 60 = Y', () => {
    const t = text(readFileSync(page, 'utf8'));
    const hits = [...t.matchAll(/\$([\d,]+\.\d\d) a credit with fees, so about \$([\d,]+) for 60 credits/g)];
    expect(hits.length).toBeGreaterThanOrEqual(5);
    for (const [, x, y] of hits) expect(Math.round(Number(x.replace(/,/g, '')) * 60)).toBe(Number(y.replace(/,/g, '')));
  });
  it.runIf(existsSync(page))('the intro names the completion share of the cheapest college', () => {
    const t = text(readFileSync(page, 'utf8'));
    const c = CHEAP_B[0];
    expect(t).toContain(`${c.n} (${STATES[c.st].name}) comes first at ${formatMoney(c.eff ?? 0, 2)} a credit with fees`);
    expect(t).toContain(`only ${Math.round((c.om8 ?? 0) * 100)}% of its students finish`);
  });
});

/* Tour 4 (naive testers, 2026-11-14): “Lowest four-year university” for California was University of Massachusetts
   Global at $517.33, because the state filter kept only universities with a per-credit charge and every Cal State and
   UC campus bills one yearly price. The filter now counts that yearly price over 30 credits. */
describe('7. lowest four-year public university of a state', () => {
  type C = { u: number; st: string; ctrl: number; cat: number | null; exc: number | null; h2: number | null; t2: number | null; f2: number | null };
  const all = COLLEGES as unknown as C[];
  const eff4 = (c: C) => (c.h2 ? c.h2 + (c.f2 ?? 0) / 30 : c.t2 && c.t2 > 0 ? (c.t2 + (c.f2 ?? 0)) / 30 : null);
  it.each(Object.keys(STATES))('%s: a public four-year university of the state, none cheaper, flat yearly prices included', (st) => {
    const pick = (STATES as Record<string, { cheapest4: { u: number; eff: number } | null }>)[st].cheapest4;
    const pool = all.filter((c) => c.st === st && c.ctrl === 1 && c.cat === 2 && (c.exc ?? 0) >= 50 && eff4(c) != null);
    if (!pick) { expect(pool).toHaveLength(0); return; }
    const c = all.find((x) => x.u === pick.u)!;
    expect([c.st, c.ctrl, c.cat]).toEqual([st, 1, 2]);
    expect(pick.eff).toBeCloseTo(eff4(c)!, 1);
    for (const o of pool) expect(eff4(o)! + 0.01).toBeGreaterThanOrEqual(pick.eff);
  });
  it('California opens on a Cal State or UC campus, not University of Massachusetts Global', () => {
    const out = getSpec('cheap-pick').run({ ...defaults('cheap-pick'), st: STATES_B.findIndex((s) => s.code === 'CA') }, {});
    const row = out.rows.find(([l]) => /four-year/.test(l))?.[1] ?? '';
    expect(row).not.toMatch(/Massachusetts/);
    expect(row).toMatch(/^California (State|Polytechnic)|^University of California|^San |^Sonoma/);
    expect(row).toMatch(/, CA\)/);
  });
});

/* Tour 4 (editor, 2026-11-14): one reference price at the top of a page, and who it applies to. */
describe('8. one reference price at the top', () => {
  it.each(['affordable-online-colleges', 'cost-per-credit-hour'])('%s: the intro gives the public resident price, not the all-college median', async (id) => {
    const { PAGES } = await import('../src/lib/guides');
    const p = PAGES.find((x) => x.id === id)!;
    expect(p.intro).toContain(`${m(NAT.medPub4)} a credit`);
    expect(p.intro).toMatch(/state resident at a public university/);
    expect(p.intro).not.toContain(m(NAT.q[50]));
    expect(p.intro).not.toContain(m(NAT.medNpf4));
  });
});
