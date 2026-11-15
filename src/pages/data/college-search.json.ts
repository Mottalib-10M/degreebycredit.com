/**
 * Rows of the "Find your college" field (lib/college-search.ts): the 2,530 online colleges of the site (50 or more fully
 * online students), with only the fields the card shows, from colleges.json. Fetched by the browser on first focus.
 * Scorecard addresses: src/data/scorecard-slugs.json (scripts/build-scorecard-slugs.py, from collegescorecard.ed.gov/sitemap.xml
 * read 2026-11-15); the slug is stored only when it differs from the name (renamed colleges); a college absent from it has no Scorecard page and gets its College Navigator page instead.
 */
import type { APIRoute } from 'astro';
import slugsRaw from '../../data/scorecard-slugs.json';
import { ONLINE } from '../../lib/blocks';
import { type SearchRow, type SearchData } from '../../lib/college-search';

export const GET: APIRoute = () => {
  const none = new Set(slugsRaw.none);
  const renamed = slugsRaw.renamed as Record<string, string>;
  const acc: string[] = [];
  const rows: SearchRow[] = ONLINE.map((c) => {
    const a = c.acc && c.acc !== 'NA' ? c.acc : null;
    if (a && !acc.includes(a)) acc.push(a);
    return [c.u, c.n, c.city, c.st, c.ctrl, c.lvl, c.exc ?? 0, c.h2, c.h3, c.t2, c.t3, c.f2, c.f3, c.h6, c.h7, a ? acc.indexOf(a) : -1, none.has(c.u) ? 0 : renamed[c.u] ?? null];
  });
  const data: SearchData = { acc, rows };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
