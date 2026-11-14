import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);

export default definePage({
  id: 'online-bachelors-degree',
  group: 'degree',
  order: 110,
  tool: { kind: 'mini:bachelor-pace' },
  related: ['cheapest-online-bachelors-degree', 'online-associates-degree', 'accredited-online-colleges', 'online-masters-degree', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_ic_ay_dict', 'ipeds_ef_dist', 'scorecard_data'],
  slug: 'online-bachelors-degree',
  nav: 'Online bachelor’s degree',
  card: '120 credits at your pace: how many years, how much tuition, and how many years of fees.',
  title: 'Online Bachelor’s Degree 2026: Credits, Years and Total Cost',
  description: 'Online bachelor’s degree cost and length: 120 credits at your pace and price, years of fees, transfer credits, and what the largest online universities charge.',
  h1: 'Online bachelor’s degree: 120 credits, your pace, your price',
  intro: `An online bachelor’s degree usually takes 120 credits. At ${$(NAT.medPub4)} a credit, the median public price for residents, that is ${$(NAT.medPub4 * 120)} of tuition; the number of years depends on how many courses you take a term. Set your pace below.`,
  resume: (h) => `Online bachelor’s programs are built for people who work: courses run in terms of 8 to 16 weeks, several start dates a year, and most students take one or two courses at a time. That changes the length, not the tuition: 120 credits at a given price cost the same whether they take four years or eight. What does change with the pace is the fees, charged per term or per year, and the time before the degree pays off. At two courses a term and three terms a year, 18 credits a year, a bachelor’s takes close to seven years; at five courses a term and two terms, the classic full-time load, four. Credits you already have shorten both. In ${h.P.ipeds.enrollmentTerm}, ${h.num(h.D.NAT.exc)} students took all their courses online, most of them at the undergraduate level.`,
  faqs: (h) => [
    { q: 'How long does an online bachelor’s degree take?', a: 'Four years at 30 credits a year, the full-time pace. Most online students go slower, 18 to 24 credits a year, which means five to seven years. Transfer credits, exams for credit and terms in summer shorten it; the calculator shows the years for any pace and any number of credits you already have.' },
    { q: 'Is a faster pace cheaper?', a: `The tuition is the same: 120 credits at the same price. The fees are not, since they are charged for each year enrolled. At the median public fee of ${h.m(h.N.medFeePub4)} a year, finishing in four years instead of seven saves about ${h.m(3 * h.N.medFeePub4)}. A faster pace also brings the degree, and the pay that may come with it, sooner.` },
    { q: 'Can I earn a bachelor’s degree fully online?', a: `Yes, at many colleges: ${h.num(h.N.nMostlyOnline)} colleges have at least half their students enrolled fully online, and many campus universities run online programs too. Some majors ask for in-person labs, clinical hours or student teaching, so check whether your program can be completed at a distance before enrolling.` },
  ],
  body: (h) => {
    const paces = [[6, 2], [6, 3], [9, 3], [12, 2], [12, 3], [15, 2]].map(([t, n]) => { const r = h.E.degreeCost({ perCredit: h.N.medPub4, credits: 120, transfer: 0, feesPerYear: h.N.medFeePub4, creditsPerTerm: t, termsPerYear: n, grantsPerYear: 0 }); return [`${t} credits × ${n} terms`, h.num(t * n), h.num1(r.yearsExact), h.m(r.fees), h.m(r.gross)]; });
    const big = h.D.FEATURED.filter((f) => f.lvl === 1 && (f.h2 || f.t2)).slice(0, 10).map((f) => [h.B.name(f.n), f.h2 ? h.m(f.h2) : `flat ${h.m(f.t2 ?? 0)} a year`, h.m(h.B.schoolCost(f, 120).total), f.om8 != null ? h.pc(f.om8, 0) : 'n/a']);
    const ex = h.E.degreeCost({ perCredit: h.N.medPub4, credits: 120, transfer: 45, feesPerYear: h.N.medFeePub4, creditsPerTerm: 6, termsPerYear: 3, grantsPerYear: 0 });
    const zero = h.E.degreeCost({ perCredit: h.N.medPub4, credits: 120, transfer: 0, feesPerYear: h.N.medFeePub4, creditsPerTerm: 6, termsPerYear: 3, grantsPerYear: 0 });
    return `
<h2>Online bachelor’s degree length and cost by pace</h2>
<p>The same 120 credits at the median public price for residents, ${h.m(h.N.medPub4)}, with median public fees of ${h.m(h.N.medFeePub4)} a year counted for each year started:</p>
${h.table(['Pace', 'Credits a year', 'Years', 'Fees', 'Total'], paces, `Median charges of public four-year colleges, ${h.P.ipeds.chargesYear} (IPEDS). Fees counted by the half year.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Tuition stays at ${h.m(h.N.medPub4 * 120)} on every line; only the fees and the years move.</p>
<h2>What the largest online universities charge for 120 credits</h2>
${h.table(['University', 'Price reported', '120 credits with fees', 'Finished within 8 years'], big, `Charges ${h.P.ipeds.chargesYear} (IPEDS). Flat-rate universities: yearly price at 30 credits a year. Award rate: entering class of ${h.P.scorecard.awardCohort} (College Scorecard).`, ['l', 'r', 'r', 'r'])}
<p>A flat-rate university charges one price per term however many courses you finish, so a fast student pays less per credit and a slow one more. Per-credit universities charge for each course, whatever the pace.</p>
<h2>Shortening the road</h2>
<p>Every credit you bring is one you do not pay for: earlier college courses, exams for credit, military training evaluated for credit. The ${h.a('accredited-online-colleges', 'accredited colleges page')} estimates what yours are worth at your new school, and the ${h.a('online-associates-degree', 'associate degree page')} prices a start at a community college. For the lowest 120-credit prices, see the ${h.a('cheapest-online-bachelors-degree', 'cheapest online bachelor’s degrees')}.</p><h2>A worked example: 45 credits already, two courses a term</h2>
<p>A student who left college with 45 credits needs 75 more. At two courses a term, 6 credits, and three terms a year, that is 18 credits a year, so a little over four years. At the median public price for residents the 75 credits cost ${h.m(ex.tuition)}, and ${h.num1(ex.years)} years of median fees add ${h.m(ex.fees)}, for ${h.m(ex.gross)} in all, about ${h.m(ex.perMonth)} a month. Starting from zero at the same pace would take close to seven years and cost ${h.m(zero.gross)}.</p>
<p>The lesson holds at any price: credits already earned are worth more than any discount. Before choosing a school, ask each one for a free review of your transcript and compare how many credits each accepts. A school that accepts 15 more credits than another saves you a full semester, and the price of 15 credits.</p>
<p>Online programs usually let you start in several months of the year, and many accept a pause between terms, so a working adult can match the pace to the year ahead.</p>
<p>One caution on speed: a heavier load than your week can carry leads to dropped or failed courses, which are paid again. A pace you can hold for every term is cheaper in the end than a fast start followed by a break.</p>
<p>Talk to an adviser at the start of each year to set the load for the months ahead.</p>
`;
  },
});
