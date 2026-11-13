/**
 * Cost engine (RECETTE §17): pure functions, no data file, no network. Every calculator of the site calls these.
 * Amounts are in dollars of the academic year the per-credit charge was reported for (IPEDS 2023-24); the reader
 * types the charge, the credits and the grants, so the result is an estimate of the published charges, not a bill.
 */

export interface CostInput {
  /** Per-credit-hour charge (tuition only, as reported to IPEDS). */
  perCredit: number;
  /** Credits the program requires. */
  credits: number;
  /** Credits already earned and accepted in transfer. */
  transfer: number;
  /** Required fees per academic year (IPEDS reports them per year for full-time students). */
  feesPerYear: number;
  /** Credits taken per term and terms per year: the pace sets the number of years, hence the years of fees. */
  creditsPerTerm: number;
  termsPerYear: number;
  /** Grants and scholarships per year that do not have to be repaid (Pell, state grant, employer). */
  grantsPerYear: number;
}

export interface CostOutput {
  remaining: number;
  tuition: number;
  creditsPerYear: number;
  /** Years to finish at the pace typed, rounded up to the half year for the fee count. */
  years: number;
  yearsExact: number;
  terms: number;
  fees: number;
  gross: number;
  grants: number;
  net: number;
  perYear: number;
  perMonth: number;
}

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** Years needed for `remaining` credits at `perTerm` credits a term and `termsPerYear` terms a year. */
export function yearsToFinish(remaining: number, perTerm: number, termsPerYear: number): { years: number; terms: number } {
  const r = pos(remaining);
  const pt = pos(perTerm);
  const ty = pos(termsPerYear);
  if (r === 0) return { years: 0, terms: 0 };
  if (pt === 0 || ty === 0) return { years: 0, terms: 0 };
  const terms = Math.ceil(r / pt - 1e-9);
  return { years: terms / ty, terms };
}

export function degreeCost(i: CostInput): CostOutput {
  const remaining = Math.max(0, pos(i.credits) - pos(i.transfer));
  const tuition = remaining * pos(i.perCredit);
  const creditsPerYear = pos(i.creditsPerTerm) * pos(i.termsPerYear);
  const { years: yearsExact, terms } = yearsToFinish(remaining, i.creditsPerTerm, i.termsPerYear);
  // Fees are charged per year attended: a year started is a year of fees (rounded up to the half year).
  const years = Math.ceil(yearsExact * 2 - 1e-9) / 2;
  const fees = years * pos(i.feesPerYear);
  const gross = tuition + fees;
  const grants = Math.min(gross, years * pos(i.grantsPerYear));
  const net = gross - grants;
  const perYear = yearsExact > 0 ? net / yearsExact : 0;
  return { remaining, tuition, creditsPerYear, years, yearsExact, terms, fees, gross, grants, net, perYear, perMonth: perYear / 12 };
}

/** Difference between two per-credit charges over a number of credits (out-of-state premium, school A vs B). */
export function creditGap(a: number, b: number, credits: number): { perCredit: number; total: number; ratio: number } {
  const d = pos(b) - pos(a);
  return { perCredit: d, total: d * pos(credits), ratio: pos(a) > 0 ? pos(b) / pos(a) : 0 };
}

/** Per-credit charge implied by an annual tuition and a yearly credit load, and the reverse. */
export function perCreditFromAnnual(annualTuition: number, creditsPerYear: number): number {
  return pos(creditsPerYear) > 0 ? pos(annualTuition) / pos(creditsPerYear) : 0;
}

/** Share of a yearly cost covered by yearly grants, capped at 100%, and what is left. */
export function coverage(costPerYear: number, grantsPerYear: number): { covered: number; share: number; left: number } {
  const c = pos(costPerYear);
  const g = Math.min(c, pos(grantsPerYear));
  return { covered: g, share: c > 0 ? g / c : 0, left: c - g };
}

/** Debt against earnings: ratio, and the months needed to repay the principal at a share of monthly earnings (no interest counted). */
export function debtToEarnings(debt: number, annualEarnings: number, shareOfIncome = 0.1): { ratio: number; months: number } {
  const d = pos(debt);
  const e = pos(annualEarnings);
  const monthly = (e / 12) * shareOfIncome;
  return { ratio: e > 0 ? d / e : 0, months: monthly > 0 ? d / monthly : 0 };
}

/** Out of `n` students who start, how many hold an award after eight years at rate `rate` (0-1). */
export function finishers(n: number, rate: number): number {
  return Math.round(pos(n) * Math.min(1, pos(rate)));
}

/** Credits saved by transfer, in dollars and in terms. */
export function transferSavings(transfer: number, perCredit: number, creditsPerTerm: number): { dollars: number; terms: number } {
  const t = pos(transfer);
  return { dollars: t * pos(perCredit), terms: pos(creditsPerTerm) > 0 ? t / pos(creditsPerTerm) : 0 };
}

export const SECTOR_LABEL: Record<number, string> = { 1: 'public', 2: 'private nonprofit', 3: 'private for-profit' };
export const LEVEL_LABEL: Record<number, string> = { 1: 'four-year', 2: 'two-year', 3: 'less-than-two-year' };
export const sectorLabel = (ctrl: number) => SECTOR_LABEL[ctrl] ?? 'unknown sector';
export const levelLabel = (lvl: number) => LEVEL_LABEL[lvl] ?? '';

/** Per-credit charge with the year's required fees spread over a full-time year of credits (30 by default). */
export function effPerCredit(perCredit: number, feesPerYear: number, creditsPerYear = 30): number {
  return pos(perCredit) + (pos(creditsPerYear) > 0 ? pos(feesPerYear) / pos(creditsPerYear) : 0);
}

/** Highest per-credit charge a monthly budget covers: (12 × budget + yearly grants − yearly fees) ÷ credits a year. */
export function affordablePerCredit(monthlyBudget: number, creditsPerYear: number, feesPerYear: number, grantsPerYear: number): number {
  const c = pos(creditsPerYear);
  if (c === 0) return 0;
  return Math.max(0, (12 * pos(monthlyBudget) + pos(grantsPerYear) - pos(feesPerYear)) / c);
}

/** Share (0-1) of schools whose charge is at or below `x`, read on a list of 101 percentiles (0 to 100). */
export function shareAtOrBelow(q: number[], x: number): number {
  if (!q.length || x < q[0]) return 0;
  if (x >= q[q.length - 1]) return 1;
  let i = 0;
  while (i < q.length - 1 && q[i + 1] <= x) i++;
  return i / (q.length - 1);
}

/** Two-plus-two route: the first `ccCredits` at a community college, the rest at a four-year school, against all at the four-year school. */
export function twoPlusTwo(ccPerCredit: number, uniPerCredit: number, ccCredits: number, totalCredits: number): { route: number; direct: number; saved: number } {
  const cc = Math.min(pos(ccCredits), pos(totalCredits));
  const route = cc * pos(ccPerCredit) + (pos(totalCredits) - cc) * pos(uniPerCredit);
  const direct = pos(totalCredits) * pos(uniPerCredit);
  return { route, direct, saved: direct - route };
}

/** Tuition at a flat-rate school (one price per year, whatever the credits): years at `creditsPerYear`, rounded up to the half year. */
export function flatRateTuition(annual: number, credits: number, creditsPerYear: number): { years: number; tuition: number } {
  const cpy = pos(creditsPerYear);
  if (cpy === 0) return { years: 0, tuition: 0 };
  const years = Math.ceil((pos(credits) / cpy) * 2 - 1e-9) / 2;
  return { years, tuition: years * pos(annual) };
}
