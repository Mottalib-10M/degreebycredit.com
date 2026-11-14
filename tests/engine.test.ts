/** Engine tests (RECETTE §17): every formula of lib/engine/degree.ts recomputed by hand. */
import { describe, it, expect } from 'vitest';
import { P } from '../src/lib/engine/params';
import * as E from '../src/lib/engine/degree';
import { getSpec, SPEC_IDS } from '../src/lib/mini-specs';
import { NAT, COLLEGES, STATES, CHEAPEST4, CHEAPEST_OUT, FEATURED } from '../src/lib/data';

describe('degreeCost', () => {
  it('bachelor’s at $300, no transfer, 15 credits × 2 terms, $1,000 fees', () => {
    const r = E.degreeCost({ perCredit: 300, credits: 120, transfer: 0, feesPerYear: 1000, creditsPerTerm: 15, termsPerYear: 2, grantsPerYear: 0 });
    expect(r.tuition).toBe(36000);
    expect(r.years).toBe(4);
    expect(r.fees).toBe(4000);
    expect(r.net).toBe(40000);
    expect(r.perMonth).toBeCloseTo(40000 / 48, 6);
  });
  it('transfer credits come off the tuition and the years', () => {
    const r = E.degreeCost({ perCredit: 300, credits: 120, transfer: 45, feesPerYear: 1000, creditsPerTerm: 6, termsPerYear: 3, grantsPerYear: 0 });
    expect(r.remaining).toBe(75);
    expect(r.tuition).toBe(22500);
    expect(r.terms).toBe(13); // 75 / 6 = 12.5 → 13 terms
    expect(r.yearsExact).toBeCloseTo(13 / 3, 9);
    expect(r.years).toBe(4.5); // fees by the half year started
    expect(r.fees).toBe(4500);
  });
  it('grants are capped at the gross cost', () => {
    const r = E.degreeCost({ perCredit: 100, credits: 60, transfer: 0, feesPerYear: 0, creditsPerTerm: 15, termsPerYear: 2, grantsPerYear: 50000 });
    expect(r.grants).toBe(6000);
    expect(r.net).toBe(0);
  });
  it('transfer above the program leaves nothing to pay', () => {
    const r = E.degreeCost({ perCredit: 100, credits: 60, transfer: 90, feesPerYear: 500, creditsPerTerm: 12, termsPerYear: 2, grantsPerYear: 0 });
    expect(r.remaining).toBe(0);
    expect(r.gross).toBe(0);
  });
});

describe('other formulas', () => {
  it('out-of-state gap', () => {
    expect(E.creditGap(278, 620, 120)).toEqual({ perCredit: 342, total: 41040, ratio: 620 / 278 });
  });
  it('price with fees spread over 30 credits', () => {
    expect(E.effPerCredit(24, 4836)).toBeCloseTo(24 + 161.2, 9);
  });
  it('budget to price: (12 × 400 + 0 − 1,200) ÷ 24 = 150', () => {
    expect(E.affordablePerCredit(400, 24, 1200, 0)).toBe(150);
    expect(E.affordablePerCredit(50, 24, 1200, 0)).toBe(0);
  });
  it('percentile reading at both ends and in the middle', () => {
    const q = Array.from({ length: 101 }, (_, i) => i * 10);
    expect(E.shareAtOrBelow(q, -1)).toBe(0);
    expect(E.shareAtOrBelow(q, 500)).toBe(0.5);
    expect(E.shareAtOrBelow(q, 505)).toBe(0.5);
    expect(E.shareAtOrBelow(q, 5000)).toBe(1);
  });
  it('associate then bachelor’s', () => {
    expect(E.twoPlusTwo(127, 278, 60, 120)).toEqual({ route: 60 * 127 + 60 * 278, direct: 120 * 278, saved: 60 * (278 - 127) });
  });
  it('flat-rate tuition at 30 credits a year', () => {
    expect(E.flatRateTuition(7710, 120, 30)).toEqual({ years: 4, tuition: 30840 });
    expect(E.flatRateTuition(7710, 75, 30)).toEqual({ years: 2.5, tuition: 19275 });
  });
  it('finishers out of 100 and transfer savings', () => {
    expect(E.finishers(100, 0.4113)).toBe(41);
    expect(E.transferSavings(30, 278, 12)).toEqual({ dollars: 8340, terms: 2.5 });
  });
});

describe('federal data', () => {
  it('universe and medians are consistent', () => {
    expect(NAT.n).toBe(COLLEGES.length);
    expect(Object.keys(STATES)).toHaveLength(51);
    expect(NAT.medPub4out).toBeGreaterThan(NAT.medPub4);
    expect(NAT.medPub2).toBeLessThan(NAT.medPub4);
    expect(NAT.q).toHaveLength(101);
    for (let i = 1; i < NAT.q.length; i++) expect(NAT.q[i]).toBeGreaterThanOrEqual(NAT.q[i - 1]);
  });
  it('cheapest lists are sorted on price with fees', () => {
    for (let i = 1; i < CHEAPEST4.length; i++) expect(CHEAPEST4[i].eff!).toBeGreaterThanOrEqual(CHEAPEST4[i - 1].eff!);
    for (let i = 1; i < CHEAPEST_OUT.length; i++) expect(CHEAPEST_OUT[i].effo!).toBeGreaterThanOrEqual(CHEAPEST_OUT[i - 1].effo!);
  });
  it('the twenty largest are the twenty largest', () => {
    const top = COLLEGES.slice().sort((a, b) => (b.exc ?? 0) - (a.exc ?? 0)).slice(0, 20).map((c) => c.u);
    expect(FEATURED.map((f) => f.u).sort()).toEqual(top.sort());
  });
});

describe('calculators', () => {
  it.each(SPEC_IDS)('%s runs on its defaults and gives a figure', (id) => {
    const s = getSpec(id);
    const v = Object.fromEntries(s.inputs.map((i) => [i.id, i.def]));
    const out = s.run(v, {});
    expect(out.head[0].length).toBeGreaterThan(5);
    expect(out.head[1]).toMatch(/\d/);
  });
  it('degree-cost default = median public bachelor’s with median fees', () => {
    const s = getSpec('degree-cost');
    const v = Object.fromEntries(s.inputs.map((i) => [i.id, i.def]));
    const r = E.degreeCost({ perCredit: NAT.medPub4, credits: 120, transfer: 0, feesPerYear: NAT.medFeePub4, creditsPerTerm: P.defaults.creditsPerTerm, termsPerYear: P.defaults.termsPerYear, grantsPerYear: 0 });
    expect(s.run(v, {}).head[1]).toBe(`$${Math.round(r.net).toLocaleString('en-US')}`);
  });
});
