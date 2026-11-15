/**
 * "Find your college" (naive testers, 2026-11-14, tour 5, all three: "Prices at 2,530 online colleges", yet no way to
 * type MY school). Browser-safe: no data import. The rows come from /data/college-search.json, built at build time by
 * src/pages/data/college-search.json.ts from colleges.json (the 2,530 online colleges, nothing added) and loaded only
 * when the reader focuses the field.
 */
import * as E from './engine/degree';
import { degreeAtPace } from './pace';

/** [unitid, name, city, state, ctrl, lvl, fully online students, h2, h3, t2, t3, f2, f3, h6, h7, accreditor index, Scorecard slug: null = built from the name, 0 = no Scorecard page] */
export type SearchRow = [number, string, string, string, number, number, number, number | null, number | null, number | null, number | null, number | null, number | null, number | null, number | null, number, string | 0 | null];
export interface SearchData { acc: string[]; rows: SearchRow[] }

/** Lower case, accents dropped, punctuation turned into spaces: "Texas A&M–Commerce" → "texas a m commerce". */
export const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const SMALL = new Set(['of', 'the', 'and', 'at', 'in', 'for']);

interface Indexed { row: SearchRow; words: string[]; acro: string }
export function indexRows(rows: SearchRow[]): Indexed[] {
  return rows.map((row) => {
    const nameWords = norm(row[1]).split(' ');
    // Initials of the name before any campus suffix: SNHU, WGU, ASU.
    const acro = norm(row[1].split('-')[0]).split(' ').filter((w) => !SMALL.has(w)).map((w) => w[0]).join('');
    return { row, words: [...nameWords, ...norm(row[2]).split(' '), row[3].toLowerCase()], acro };
  });
}

/** Every word typed must start a word of the name, the city or the state code, or be the school's initials. Name-start matches first, then the largest. */
export function search(index: Indexed[], query: string, limit = 8): SearchRow[] {
  const q = norm(query).split(' ').filter(Boolean);
  if (!q.length) return [];
  const hits = index.filter((x) => q.every((t) => x.words.some((w) => w.startsWith(t)) || (t.length >= 2 && x.acro === t)));
  const first = q[0];
  const score = (x: Indexed) => (x.words[0].startsWith(first) || x.acro === first ? 0 : 1);
  return hits.sort((a, b) => score(a) - score(b) || b.row[6] - a.row[6]).slice(0, limit).map((x) => x.row);
}

export const SECTOR = ['public', 'private nonprofit', 'private for-profit'];

/** Name part of a Scorecard address, as its sitemap writes it: spaces → _, commas dropped, ' and & escaped. */
export const scorecardSlug = (name: string) => name.replace(/ /g, '_').replace(/,/g, '').replace(/'/g, '%27').replace(/&/g, '%26');
/** Official College Scorecard page (format of collegescorecard.ed.gov/sitemap.xml: /school/?UNITID-Name); null when Scorecard has none. */
export const scorecardUrl = (r: SearchRow) => (r[16] === 0 ? null : `https://collegescorecard.ed.gov/school/?${r[0]}-${r[16] ?? scorecardSlug(r[1])}`);
/** IPEDS profile on College Navigator (NCES), for the colleges Scorecard does not list (graduate-only or closed since). */
export const navigatorUrl = (r: SearchRow) => `https://nces.ed.gov/collegenavigator/?id=${r[0]}`;

export interface Price { perCredit: number; fees: number; annual: number | null }
/**
 * Price per credit for one residence: the per-credit charge, or a single yearly price spread over 30 credits (as on
 * every table of the site, lib/blocks.ts schoolCost). Graduate: graduate per-credit charge, fees not in the file.
 */
export function priceOf(r: SearchRow, graduate: boolean, outOfState: boolean): Price | null {
  const [, , , , , , , h2, h3, t2, t3, f2, f3, h6, h7] = r;
  if (graduate) { const p = outOfState ? h7 : h6; return p ? { perCredit: p, fees: 0, annual: null } : null; }
  const fees = (outOfState ? (f3 ?? f2) : f2) ?? 0;
  const h = outOfState ? h3 : h2;
  if (h2) return h ? { perCredit: h, fees, annual: null } : null;
  const t = outOfState ? t3 : t2;
  return t ? { perCredit: t / 30, fees, annual: t } : null;
}

/** Tuition and fees of the degree at the site's pace (15 credits a term, 2 terms), the same function as the calculator. */
export function costAt(p: Price, credits: number, transfer: number): E.CostOutput {
  return degreeAtPace(p.perCredit, p.fees, credits, transfer);
}
