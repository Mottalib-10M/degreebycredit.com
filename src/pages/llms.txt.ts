/** llms.txt (RECETTE §21): what the site is, where its figures come from, its main pages. Built from the data. */
import type { APIRoute } from 'astro';
import { PAGES } from '../lib/guides';
import { route } from '../i18n/routes';
import { SITE_URL, LAST_UPDATED } from '../data/site-config';
import { P } from '../lib/engine/params';
import { NAT } from '../lib/data';
import { formatMoney, formatNumber } from '../lib/format';
export const GET: APIRoute = () => {
  const m = (n: number) => formatMoney(Math.round(n), 0);
  const lines = [
    '# Degree by Credit',
    '',
    `> Online degree cost from the per-credit charges US colleges report to IPEDS (${P.ipeds.chargesYear}): median ${m(NAT.medPub4)} a credit at public universities for state residents, ${m(NAT.medPub4out)} from another state, ${m(NAT.medNpf4)} at private nonprofit and ${m(NAT.medFp4)} at for-profit universities. ${formatNumber(NAT.exc, 0)} students studied fully online in ${P.ipeds.enrollmentTerm} at ${formatNumber(NAT.n, 0)} Title IV degree-granting colleges. Award rates (8 years, entering ${P.scorecard.awardCohort}), Pell shares, debt and accreditors from College Scorecard (released ${P.scorecard.release}, CC BY 4.0). Files read on ${LAST_UPDATED}. Published by Radif Partners, independent, not a college or a lead seller.`,
    '',
    '## Calculators',
    `- [Online degree cost calculator](${SITE_URL}${route('home', 'en')}): tuition and fees of an associate, bachelor’s or master’s degree from the price per credit, transfer credits, pace and grants.`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`),
    '',
    '## Method',
    `- [Files, variables and rules](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
