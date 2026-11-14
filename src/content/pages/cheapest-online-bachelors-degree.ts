import { definePage } from '../../lib/guide-types';
import { CHEAPEST4, CHEAPEST_OUT } from '../../lib/data';
import { formatMoney } from '../../lib/format';
import { degreeAtPace } from '../../lib/pace';

const $ = (n: number) => formatMoney(Math.round(n), 0);
const a = CHEAPEST4[0];
const o = CHEAPEST_OUT[0];

export default definePage({
  id: 'cheapest-online-bachelors-degree',
  group: 'cost',
  order: 30,
  tool: { kind: 'mini:cheap-bachelor' },
  related: ['cheapest-online-colleges', 'out-of-state-online-tuition', 'online-bachelors-degree', 'online-college-graduation-rates', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_hd', 'ipeds_ef_dist', 'scorecard_data'],
  slug: 'cheapest-online-bachelors-degree',
  nav: 'Cheapest online bachelor’s degrees',
  card: 'Universities with the lowest 120-credit price, for state residents and for students from anywhere.',
  title: 'Cheapest Online Bachelor’s Degree 2026: 120-Credit Prices',
  description: 'Cheapest online bachelor’s degree prices at US universities, for state residents and for out-of-state students, with fees, from the federal IPEDS charges file.',
  h1: 'Cheapest online bachelor’s degree for residents and for all',
  intro: `The cheapest online bachelor’s degree depends on where you live. For state residents, ${a ? `${a.n} comes to ${$((a.eff ?? 0) * 120)} for 120 credits with fees` : ''}; for a student from any state, ${o ? `${o.n} comes to ${$((o.effo ?? 0) * 120)}` : ''}. Pick a university below and say where you live.`,
  resume: (h) => `A bachelor’s degree asks for about 120 credits, so every dollar on the price per credit becomes 120 dollars on the degree. This page ranks universities that mainly award bachelor’s degrees or higher, report a per-credit charge to IPEDS and had at least 500 students studying fully online in ${h.P.ipeds.enrollmentTerm}. The first list uses the resident price plus a thirtieth of the yearly fees; the second uses the out-of-state price, which is what a student from another state pays, and puts first the universities that charge the same to everyone. The two lists hardly overlap: a public university that is cheap for its own residents often charges outsiders two or three times more. The median public university charges residents ${h.m(h.N.medPub4)} a credit, about ${h.m(h.N.medPub4 * 120)} for the degree before fees. Charges are those of ${h.P.ipeds.chargesYear}.`,
  faqs: (h) => [
    { q: 'What is the cheapest online bachelor’s degree for an out-of-state student?', a: `On the ${h.P.ipeds.chargesYear} charges, ${o ? `${h.B.name(o.n)}, at ${h.m(o.effo ?? 0)} a credit with fees, or about ${h.m((o.effo ?? 0) * 120)} for 120 credits` : 'see the second table'}. The second table ranks universities on the price a student from another state pays. Several of them charge the same price to residents and non-residents, which is common for programs built for online students.` },
    { q: 'Does a cheap bachelor’s degree cost less in total?', a: 'Not always. A degree you finish costs less than one you start twice. Compare the share of students who earn an award within eight years, given in both tables, and check how many of your existing credits the university accepts: transferred credits are not paid again, which can matter more than the price per credit.' },
    { q: 'Why are some well-known low-cost universities missing?', a: 'Universities that charge one flat price per term, whatever the number of credits, report no per-credit charge and cannot be ranked here. Western Governors University is the best known; the largest online universities page shows its flat yearly price next to the per-credit schools.' },
  ],
  body: (h) => {
    const res = h.D.CHEAPEST4.slice(0, 15).map((c) => [h.B.name(c.n), c.st, h.m(c.h2 ?? 0), h.m(c.eff ?? 0), h.m((c.eff ?? 0) * 120), c.om8 != null ? h.pc(c.om8, 0) : 'n/a']);
    const out = h.D.CHEAPEST_OUT.slice(0, 12).map((c) => [h.B.name(c.n), c.st, h.m(c.h3 ?? 0), c.h3 === c.h2 ? 'yes' : 'no', h.m((c.effo ?? 0) * 120), c.om8 != null ? h.pc(c.om8, 0) : 'n/a']);
    const c4 = h.D.CHEAPEST4[0], co = h.D.CHEAPEST_OUT[0];
    return `
<h2>Cheapest online bachelor’s degree for state residents</h2>
<p>Fifteen universities, ranked on the resident price per credit with fees. The 120-credit column multiplies that price by 120 and assumes no transfer credit.</p>
${h.table(['University', 'State', 'Tuition per credit', 'With fees', '120 credits', 'Finished within 8 years'], res, `Resident charges ${h.P.ipeds.chargesYear} (IPEDS). Award rate: students who entered in ${h.P.scorecard.awardCohort}, College Scorecard.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>Public universities of North Carolina, Georgia and Florida fill most of the list, the first two at ${h.m(h.D.CHEAPEST4[0]?.h2 ?? 0)} a credit of tuition for residents. If you live in one of those states, start there. If not, the next list is yours.</p>
<h2>Cheapest for students from any state</h2>
<p>Ranked on the 120-credit total, out-of-state tuition plus fees: a low price per credit can come with high yearly fees, so the order does not always follow the price column. “Same price” says whether residents and non-residents pay the same tuition.</p>
${h.table(['University', 'State', 'Out-of-state per credit', 'Same price', '120 credits', 'Finished within 8 years'], out, `Out-of-state charges ${h.P.ipeds.chargesYear} (IPEDS), out-of-state fees where reported.`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>Public universities in Nebraska and Wisconsin appear here because they report the same per-credit price for residents and non-residents. Private universities appear too: they charge everyone the same, wherever the student lives.</p>
<h2>What a 120-credit price leaves out</h2>
<p>Books, software and proctored exams; any program fee for nursing, education or engineering majors; and the price change since ${h.P.ipeds.chargesYear}, since most colleges raise tuition a little each year. Credits you already have lower the total; ${h.a('accredited-online-colleges', 'the transfer calculator')} shows by how much. To see how your pace changes the bill, use the ${h.a('online-bachelors-degree', 'online bachelor’s degree page')}.</p><h2>A 120-credit bachelor’s in four budgets</h2>
<p>Put side by side, the four ways of paying for 120 credits give very different totals, all with fees spread over the credits:</p>
<ul>
<li><strong>Cheapest for a resident</strong>: ${h.B.name(c4.n)}, about ${h.m((c4.eff ?? 0) * 120)}.</li>
<li><strong>Cheapest from any state</strong>: ${h.B.name(co.n)}, about ${h.m((co.effo ?? 0) * 120)}.</li>
<li><strong>Median public university, resident</strong>: about ${h.m(degreeAtPace(h.N.medPub4, h.N.medFeePub4, h.P.credits.bachelor).net)}.</li>
<li><strong>Median private nonprofit university</strong>: about ${h.m(degreeAtPace(h.N.medNpf4, h.N.medFeeNpf4, h.P.credits.bachelor).net)}.</li>
</ul>
<p>The first two lines are real universities with real online enrollment, not a theory. Before choosing one, check three things on its site: that your major is offered fully online, that it accepts students from your state, and that the online program is billed at the rate the federal file shows. A university can only report one undergraduate rate per residency to IPEDS, while its online programs sometimes have their own price list.</p>
<p>One last check is the calendar. Many of the universities in the first table run online courses on the same semester calendar as their campus, with two starts a year; others offer eight-week terms and six starts. The price per credit is the same either way, but a shorter term lets you take one course at a time and keep a full-time job.</p>
`;
  },
});
