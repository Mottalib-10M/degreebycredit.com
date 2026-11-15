/** "Find your college" (naive testers, 2026-11-14, tour 5): search, namesakes, yearly prices, Scorecard links. */
import { describe, it, expect } from 'vitest';
import { GET } from '../src/pages/data/college-search.json';
import { indexRows, search, priceOf, costAt, scorecardUrl, navigatorUrl, type SearchData } from '../src/lib/college-search';
import { schoolCost, ONLINE } from '../src/lib/blocks';
import { FEATURED, NAT } from '../src/lib/data';

const data = (await (await (GET as any)()).json()) as SearchData;
const idx = indexRows(data.rows);
const first = (q: string) => search(idx, q)[0]?.[1];

describe('college-search.json', () => {
  it('holds exactly the online colleges of the site, nothing else', () => {
    expect(data.rows.length).toBe(NAT.nOnline);
    expect(new Set(data.rows.map((r) => r[0]))).toEqual(new Set(ONLINE.map((c) => c.u)));
  });
});

describe('search', () => {
  it('case, accents and partial words', () => {
    expect(first('western gov')).toBe('Western Governors University');
    expect(first('WESTERN GOVERNORS')).toBe('Western Governors University');
    expect(first('south new hamp')).toBe('Southern New Hampshire University');
    expect(first('Béthel')).toMatch(/^Bethel/);
    expect(first('texas woman')).toBe("Texas Woman's University");
  });
  it('initials', () => {
    expect(first('snhu')).toBe('Southern New Hampshire University');
    expect(first('wgu')).toBe('Western Governors University');
  });
  it('namesakes are all offered, told apart by town and state', () => {
    const hits = search(idx, 'columbia college', 20).filter((r) => r[1] === 'Columbia College');
    expect(hits.length).toBe(3);
    expect(new Set(hits.map((r) => `${r[2]}, ${r[3]}`)).size).toBe(3);
    expect(search(idx, 'columbia college mo', 20).every((r) => r[3] === 'MO' || /\bmo/i.test(r[1] + r[2]))).toBe(true);
  });
  it('nothing for nonsense or an empty field', () => {
    expect(search(idx, 'zzqx')).toEqual([]);
    expect(search(idx, '   ')).toEqual([]);
  });
});

describe('price and cost', () => {
  it('yearly price: spread over 30 credits, and said so', () => {
    const r = data.rows.find((x) => x[1] === 'California State University-Channel Islands')!;
    const p = priceOf(r, false, false)!;
    expect(p.annual).toBe(5742);
    expect(p.perCredit).toBeCloseTo(5742 / 30, 9);
    expect(costAt(p, 120, 0).net).toBeCloseTo(4 * 5742 + 4 * (r[11] ?? 0), 6);
    expect(priceOf(r, false, true)!.annual).toBe(r[10]);
  });
  it('same totals as the tables of the site (schoolCost) for the featured schools, 120 credits', () => {
    for (const f of FEATURED.filter((x) => x.h2 || x.t2)) {
      const r = data.rows.find((x) => x[0] === f.u);
      if (!r) continue;
      expect(costAt(priceOf(r, false, false)!, 120, 0).net).toBeCloseTo(schoolCost(f, 120).total, 6);
    }
  });
  it('transfer credits come off, graduate uses the graduate charge without fees', () => {
    const r = data.rows.find((x) => x[0] === 183026)!; // SNHU
    const p = priceOf(r, false, false)!;
    expect(costAt(p, 120, 30).tuition).toBe(90 * (r[7] as number));
    const g = priceOf(r, true, false)!;
    expect(g).toEqual({ perCredit: r[13], fees: 0, annual: null });
  });
});

describe('Scorecard link', () => {
  it('official format, from the UNITID', () => {
    expect(scorecardUrl(data.rows.find((x) => x[0] === 433387)!)).toBe('https://collegescorecard.ed.gov/school/?433387-Western_Governors_University');
    expect(scorecardUrl(data.rows.find((x) => x[1] === "Texas Woman's University")!)).toMatch(/\?\d+-Texas_Woman%27s_University$/);
  });
  it('a renamed college keeps the Scorecard address; one absent from Scorecard goes to College Navigator', () => {
    const ashford = data.rows.find((x) => x[1] === 'Ashford University');
    if (ashford) expect(scorecardUrl(ashford)).toMatch(/The_University_of_Arizona_Global_Campus$/);
    const none = data.rows.find((x) => x[16] === 0)!;
    expect(scorecardUrl(none)).toBeNull();
    expect(navigatorUrl(none)).toBe(`https://nces.ed.gov/collegenavigator/?id=${none[0]}`);
  });
});
