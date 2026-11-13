import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);

export default definePage({
  id: 'online-associates-degree',
  group: 'degree',
  order: 100,
  tool: { kind: 'mini:two-plus-two' },
  related: ['cheapest-online-colleges', 'online-bachelors-degree', 'accredited-online-colleges', 'online-colleges-by-state', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_hd', 'ipeds_ef_dist', 'scorecard_data'],
  slug: 'online-associates-degree',
  nav: 'Online associate degree',
  card: 'Sixty credits at a community college, and what starting there saves on a bachelor’s.',
  title: 'Online Associates Degree 2026: Community College Cost',
  description: 'Online associates degree cost at community colleges: price per credit for district, state and out-of-state students, fees, and the saving on a bachelor’s.',
  h1: 'Online associates degree: 60 credits at community college prices',
  intro: `An online associates degree takes about 60 credits, and community colleges charge district residents a median of ${$(NAT.medPub2d)} a credit, about ${$(NAT.medPub2d * 60)} before fees. Taken as the first half of a bachelor’s, it can save thousands: type your two prices below.`,
  resume: (h) => `Community colleges are the cheapest door to higher education, online as on campus. In ${h.P.ipeds.chargesYear} the ${h.num(h.N.nPub2)} public two-year colleges that report a per-credit charge asked a median of ${h.m(h.N.medPub2d)} from residents of their district, ${h.m(h.N.medPub2)} from the rest of the state and ${h.m(h.N.medPub2out)} from other states, with median fees of ${h.m(h.N.medFeePub2)} a year. An associate degree of about 60 credits therefore costs a resident well under the price of one year at many universities. It can lead straight to work, or be the first half of a bachelor’s: the credits of an associate degree designed for transfer are usually accepted by the public universities of the same state. The catch is completion. Community colleges enroll many part-time and working students, and at the median public two-year college, ${h.pc(h.B.med(h.D.COLLEGES.filter((c) => c.ctrl === 1 && c.lvl === 2).map((c) => c.om8)), 0)} of entering students earned an award there within eight years.`,
  faqs: (h) => [
    { q: 'Can I take community college classes online from another district?', a: `Usually yes, at the in-state price if you live in the same state. The district price, a median of ${h.m(h.N.medPub2d)} a credit, is for residents of the area that funds the college; other residents of the state pay the state rate, ${h.m(h.N.medPub2)} at the median. Students from other states pay more.` },
    { q: 'Will my associate degree credits transfer to a university?', a: 'An associate degree built for transfer, often called an associate of arts or associate of science, is usually accepted in full by the public universities of the same state. Applied degrees, built for a trade, transfer less well. Ask the university you have in mind which courses it accepts before you choose them.' },
    { q: 'How long does an online associate degree take?', a: 'Two years at 30 credits a year, the full-time pace. Part-time students taking two courses a term need three to four years. Many community colleges run eight-week terms, which let you take one course at a time and still move forward through the year.' },
  ],
  body: (h) => {
    const cc = h.D.COLLEGES.filter((c) => c.ctrl === 1 && c.lvl === 2 && c.h2 && (c.exc ?? 0) >= 4000).slice(0, 12).map((c) => [h.B.name(c.n), c.st, c.h1 ? h.m(c.h1) : 'n/a', h.m(c.h2 ?? 0), h.m(c.f2 ?? 0), c.exc ?? 0]);
    const route = h.E.twoPlusTwo(h.N.medPub2d, h.N.medPub4, 60, 120);
    return `
<h2>Online associates degree prices at the largest community colleges</h2>
<p>Public two-year colleges with at least 4,000 fully online students, largest first. District and state prices differ only where the college has a district.</p>
${h.table(['College', 'State', 'District resident', 'State resident', 'Fees per year', 'Fully online students'], cc, `Per-credit charges ${h.P.ipeds.chargesYear}; enrollment ${h.P.ipeds.enrollmentTerm} (IPEDS).`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<p>For the lowest community college price in each state, see the ${h.a('cheapest-online-colleges', 'cheapest online colleges')}.</p>
<h2>The associate-then-bachelor route</h2>
<p>Sixty credits at the median district price and sixty at the median public university price come to ${h.m(route.route)} of tuition, against ${h.m(route.direct)} for all 120 credits at the university: ${h.m(route.saved)} less, before fees and grants. The calculator above uses your own two prices and lets you move fewer credits if not all of them will transfer.</p>
<p>The saving depends on one thing the federal files do not record: how many of your credits the university accepts. Ask for its transfer agreement with your community college, often called an articulation agreement, and keep to the courses it lists.</p>
<h2>Is an associate degree worth it on its own?</h2>
<p>For some jobs, yes: many technical and health support roles ask for one. For others it is a step. Either way, finishing matters: a completed associate degree is a credential, sixty unfinished credits are not. To plan the second half, use the ${h.a('online-bachelors-degree', 'online bachelor’s degree page')}.</p><h2>An associate degree budget, line by line</h2>
<p>Sixty credits at the median district price, ${h.m(h.N.medPub2d)}, come to ${h.m(60 * h.N.medPub2d)} of tuition. Two years of median community college fees add ${h.m(2 * h.N.medFeePub2)}, for ${h.m(60 * h.N.medPub2d + 2 * h.N.medFeePub2)} in all. A part-time student taking 15 credits a year needs four years and pays four years of fees, ${h.m(4 * h.N.medFeePub2)}, so the same degree costs ${h.m(60 * h.N.medPub2d + 4 * h.N.medFeePub2)}.</p>
<p>A student from another state pays the out-of-state rate, ${h.m(h.N.medPub2out)} at the median, or ${h.m(60 * h.N.medPub2out)} of tuition for the degree: still less than many universities charge their own residents, but no longer the bargain it is at home.</p>
<p>Grants change the picture most. A Pell Grant often covers much or all of the tuition of a community college for a full-time student, which is why filing the FAFSA matters even at low prices.</p>
<p>Community colleges also sell single courses to students of other schools. A university student can take a general education course online at a community college for a fraction of the price, if the university agrees in advance to accept it.</p>
<p>Check with the university, in writing, before you register for such a course.</p>
`;
  },
});
