/**
 * One pace for every total of the site (naive testers, 2026-11-14): the home calculator said $39,410 over 5 years
 * of fees (12 credits a term) while the table and the FAQ under it said $38,200 over 4 years. Every page, table and
 * calculator that prices a degree at "the usual pace" now calls `degreeAtPace`, so the same case gives the same
 * figure everywhere; tests/coherence.test.ts locks it.
 */
import { P } from './engine/params';
import * as E from './engine/degree';

export const PACE = { creditsPerTerm: P.defaults.creditsPerTerm, termsPerYear: P.defaults.termsPerYear };

/** Tuition and required fees of `credits` at `perCredit`, at the site's default pace (fees for every year started). */
export function degreeAtPace(perCredit: number, feesPerYear: number, credits: number, transfer = 0, grantsPerYear = 0): E.CostOutput {
  return E.degreeCost({ perCredit, credits, transfer, feesPerYear, ...PACE, grantsPerYear });
}
