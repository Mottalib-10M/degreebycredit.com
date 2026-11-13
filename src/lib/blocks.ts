/** Server-side building blocks shared by the pages: tuition of a featured school, school names, quick stats. */
import * as E from './engine/degree';
import * as D from './data';

/** Tuition and fees of `credits` at a school: per credit, or its flat yearly price at 30 credits a year. */
export function schoolCost(c: { h2: number | null; t2: number | null; f2: number | null }, credits: number): { total: number; flat: boolean; years: number } {
  const years = Math.ceil((credits / 30) * 2 - 1e-9) / 2;
  if (c.h2) return { total: credits * c.h2 + years * (c.f2 ?? 0), flat: false, years };
  const t = E.flatRateTuition(c.t2 ?? 0, credits, 30);
  return { total: t.tuition + t.years * (c.f2 ?? 0), flat: true, years: t.years };
}
export const name = (n: string) => D.shortName(n);
/** Median of the non-null values. */
export function med(xs: Array<number | null | undefined>): number {
  const v = xs.filter((x): x is number => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return 0;
  const k = Math.floor(v.length / 2);
  return v.length % 2 ? v[k] : (v[k - 1] + v[k]) / 2;
}
/** Colleges with at least 50 fully online students. */
export const ONLINE = D.COLLEGES.filter((c) => (c.exc ?? 0) >= 50);
