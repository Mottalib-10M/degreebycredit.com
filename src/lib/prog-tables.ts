/**
 * Server-side tables of the field pages (nursing, MBA, accounting...): programs that can be completed entirely
 * online, from IPEDS C2024DEP, with each college's per-credit charge of IC2023_AY. No ranking: every list says the
 * rule it is sorted by (lowest price, or most programs), and the price is the college's general charge.
 */
import { PROGRAMS, stateName, type ProgLevel, type ProgRow } from './data';
import { shortName } from './browser-data';
import type { table as TableFn } from './helpers';
type T = { table: typeof TableFn };
import { formatMoney, formatNumber } from './format';
import { pct } from './pct';

const m = (n: number | null | undefined) => (n ? formatMoney(Math.round(n), 0) : 'n/a');
const num = (n: number) => formatNumber(n, 0);
export type FieldKey = keyof typeof PROGRAMS;
export const LEVEL_LABEL: Record<ProgLevel, string> = { cert: 'Certificate', assoc: 'Associate degree', bach: 'Bachelor’s degree', mast: 'Master’s degree', docr: 'Research doctorate (PhD, EdD...)', docp: 'Professional doctorate' };
export const SECTOR_SHORT = ['public', 'nonprofit', 'for-profit'];
export const lvl = (f: FieldKey, l: ProgLevel) => PROGRAMS[f].levels[l]!;
const isGrad = (l: ProgLevel) => l === 'mast' || l === 'docr' || l === 'docp';

/** One row per level: colleges offering the field fully online, of those offering it at all, and the medians. */
export function levelTable(h: T, f: FieldKey, caption: string, labels: Partial<Record<ProgLevel, string>> = {}) {
  const rows = (Object.entries(PROGRAMS[f].levels) as Array<[ProgLevel, NonNullable<ReturnType<typeof lvl>>]>).map(([l, s]) => [
    labels[l] ?? LEVEL_LABEL[l], `${num(s.nOnline)} of ${num(s.nOffer)}`, m(s.med.pub), m(s.med.pubOut), m(s.med.npf), m(s.med.fp),
  ]);
  return h.table(['Level', 'Colleges with it fully online', 'Public, residents', 'Public, other states', 'Private nonprofit', 'For-profit'], rows, caption, ['l', 'r', 'r', 'r', 'r', 'r']);
}

/** Lowest per-credit prices among colleges offering the field fully online at that level (fees spread over 30 credits
 *  for undergraduate levels, as everywhere on the site). */
export function cheapestTable(h: T, f: FieldKey, l: ProgLevel, n: number, caption: string, publicOnly = false) {
  const s = lvl(f, l);
  const list: ProgRow[] = (publicOnly ? s.cheapestPub : s.cheapest).slice(0, n);
  const grad = isGrad(l);
  const rows = list.map((c) => [shortName(c.n), c.st, SECTOR_SHORT[c.ctrl - 1] ?? '', m(grad ? c.p : c.pe), m(c.po), c.exc != null ? num(c.exc) : 'n/a']);
  return h.table(['College', 'State', 'Type', grad ? 'Graduate per credit, residents' : 'Per credit with fees, residents', 'Per credit, other states', 'Students fully online'], rows, caption, ['l', 'l', 'l', 'r', 'r', 'r']);
}

/** Colleges with the most programs of the field that can be completed online at that level, then the most online students. */
export function mostTable(h: T, f: FieldKey, l: ProgLevel, n: number, caption: string) {
  const s = lvl(f, l);
  const grad = isGrad(l);
  const rows = s.most.slice(0, n).map((c) => [shortName(c.n), c.st, num(c.k), m(grad ? c.p : c.pe), c.om8 != null ? pct(c.om8, 0) : 'n/a']);
  return h.table(['College', 'State', 'Programs fully online', grad ? 'Graduate per credit' : 'Per credit with fees', 'Finished within 8 years'], rows, caption, ['l', 'l', 'r', 'r', 'r']);
}

/** States with the most colleges offering the field fully online at that level, with the lowest public price there. */
export function statesTable(h: T, f: FieldKey, l: ProgLevel, n: number, caption: string) {
  const s = lvl(f, l);
  const rows = Object.entries(s.states).sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0])).slice(0, n)
    .map(([st, x]) => [stateName(st), num(x.n), num(x.nPub), x.low ? `${m(x.low.p)}, ${shortName(x.low.n)}` : 'none reported']);
  return h.table(['State', 'Colleges', 'Of which public', 'Lowest public price per credit'], rows, caption, ['l', 'r', 'r', 'l']);
}
/** States where no college in the file offers the field fully online at that level. */
export const statesWithout = (f: FieldKey, l: ProgLevel, all: string[]) => all.filter((st) => !lvl(f, l).states[st]);
