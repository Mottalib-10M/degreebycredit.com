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
