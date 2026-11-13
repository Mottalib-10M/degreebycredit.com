import { definePage } from '../../lib/guide-types';
import { CHEAPEST, STATES } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);
const first = CHEAPEST[0];

export default definePage({
  id: 'cheapest-online-colleges',
  group: 'cost',
  order: 20,
  tool: { kind: 'mini:cheap-pick' },
  related: ['cheapest-online-bachelors-degree', 'online-colleges-by-state', 'cost-per-credit-hour', 'online-associates-degree', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_ef_dist', 'ipeds_hd', 'scorecard_data'],
  slug: 'cheapest-online-colleges',
  nav: 'Cheapest online colleges',
  card: 'The lowest price per credit, fees included, in every state, and why California’s community colleges top the national list.',
  title: 'Cheapest Online Colleges 2026: Lowest Price in Each State',
  description: 'Cheapest online colleges by state: the lowest public price per credit with fees, from federal IPEDS charges, and what 60 or 120 credits cost residents there.',
  h1: 'Cheapest online colleges: the lowest public price in every state',
  intro: `The cheapest online colleges are public community colleges billing their own residents: ${first ? `${first.n} in ${first.st} comes to ${$(first.eff ?? 0)} a credit with fees` : ''}. Pick your state to see its lowest price, fees included, and what your credits would cost there.`,
  resume: (h) => {
    const caList = h.D.CHEAPEST.filter((c) => c.st === 'CA');
    const counts = new Map<number, number>();
    for (const c of caList) counts.set(c.h2 ?? 0, (counts.get(c.h2 ?? 0) ?? 0) + 1);
    const mode = [...counts.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? 0;
    const st = Object.values(h.D.STATES).filter((s) => s.cheapest);
    const under = st.filter((s) => (s.cheapest!.eff ?? 0) < h.N.medPub4).length;
    return `Ranked on the price per credit plus a thirtieth of the yearly fees, the ${h.num(h.D.CHEAPEST.length)} cheapest colleges with at least 500 fully online students include ${h.num(caList.length)} in California, where most community colleges report ${h.m(mode)} a credit for residents. Outside California the lowest prices are spread out: in ${h.num(under)} of the ${h.num(st.length)} states with a public college reporting a price, the cheapest one comes in under ${h.m(h.N.medPub4)}, the median resident price of public universities, fees included, and the table below names it. These are resident prices. A student from another state pays the out-of-state charge, often several times higher, so the cheapest college for you is usually the cheapest one in your own state. Low price and good results do not always go together: the last column gives the share of entering students who earned a degree or certificate within eight years, from College Scorecard. Charges are those of ${h.P.ipeds.chargesYear}, reported to IPEDS.`;
  },
  faqs: (h) => [
    { q: 'Can I take the cheapest online courses from another state?', a: `Usually only at the out-of-state price. California community colleges, for example, charge non-residents far more than the resident rate. A few public colleges charge one price to every online student wherever they live; the out-of-state page lists the four-year ones. Check residency rules before you enroll, since proof of residence is often asked.` },
    { q: 'Why is the price shown higher than the tuition on the school’s site?', a: `Because fees are added. Tuition per credit is the advertised figure, but most colleges also charge yearly fees for technology, registration or student services. This page spreads the year’s required fees over 30 credits so that a college with low tuition and high fees does not look cheaper than it is.` },
    { q: 'Are cheap online colleges accredited?', a: `Every college in these tables takes federal student aid, which requires accreditation by an agency the Department of Education recognizes; College Scorecard names the accreditor of each one. The accredited colleges page explains what that means for transferring credits later and how to check a school yourself.` },
    { q: 'Do community colleges offer full degrees online?', a: `Many offer associate degrees and certificates fully online, and a growing number offer a few bachelor’s programs. The federal enrollment file counts students who take all their courses at a distance; the college’s catalog says which programs can be completed without coming to campus.` },
  ],
  body: (h) => {
    const rows = Object.values(STATES).filter((s) => s.cheapest).sort((a, b) => (a.cheapest!.eff ?? 0) - (b.cheapest!.eff ?? 0)).map((s) => [s.name, h.B.name(s.cheapest!.n), h.m(s.cheapest!.h2 ?? 0), h.m(s.cheapest!.f2 ?? 0), h.m(s.cheapest!.eff ?? 0)]);
    const top = h.D.CHEAPEST.slice(0, 10).map((c) => [h.B.name(c.n), c.st, h.m(c.eff ?? 0), h.m(c.h3 ?? 0), c.exc ?? 0, c.om8 != null ? h.pc(c.om8, 0) : 'n/a']);
    const none = Object.values(STATES).filter((s) => !s.cheapest).map((s) => s.name);
    const big5 = Object.values(STATES).filter((s) => s.cheapest).sort((a, b) => b.exc - a.exc).slice(0, 5);
    return `
<h2>Cheapest online colleges in each state</h2>
<p>One line per state: the public college with at least 50 fully online students and the lowest resident price per credit, fees included. Most are community colleges, which award associate degrees and certificates; the ${h.a('cheapest-online-bachelors-degree', 'bachelor’s page')} does the same for four-year universities.</p>
${h.table(['State', 'College', 'Tuition per credit', 'Fees per year', 'Per credit with fees'], rows, `Resident prices, ${h.P.ipeds.chargesYear} (IPEDS). Per credit with fees = tuition per credit + yearly fees ÷ 30.`, ['l', 'l', 'r', 'r', 'r'])}
${none.length ? `<p>${none.join(', ')}: no public college with 50 or more fully online students reports a per-credit charge.</p>` : ''}
<h2>The national list: one state dominates</h2>
<p>Across the country, the ten lowest prices among colleges with 500 or more fully online students are below. The out-of-state column shows why the list helps residents only.</p>
${h.table(['College', 'State', 'Resident, with fees', 'Out-of-state tuition', 'Fully online students', 'Award in 8 years'], top, `Charges ${h.P.ipeds.chargesYear} (IPEDS); fully online students, ${h.P.ipeds.enrollmentTerm}; award rate of students who entered in ${h.P.scorecard.awardCohort} (College Scorecard).`, ['l', 'l', 'r', 'r', 'r', 'r'])}
<h2>Before you pick the lowest price</h2>
<p>Three checks cost nothing. First, residency: the price is for residents of the state, and sometimes only of the college’s district. Second, the program: a low price helps only if the college offers your subject fully online. Third, the finish line: a share of students who never earn the award pay for credits that lead nowhere, which the ${h.a('online-college-graduation-rates', 'graduation rates page')} measures school by school.</p>
<p>If the cheapest college near you is a community college, starting there and transferring later can cut the cost of a bachelor’s; the ${h.a('online-associates-degree', 'associate degree page')} works out the saving.</p><h2>Sixty credits at the lowest price in five large states</h2>
<p>An associate degree of 60 credits, priced at the lowest public price with fees in the states with the most online students:</p>
<ul>${big5.map((s) => `<li><strong>${s.name}</strong>: ${h.B.name(s.cheapest!.n)}, ${h.m(s.cheapest!.eff ?? 0)} a credit with fees, so about ${h.m((s.cheapest!.eff ?? 0) * 60)} for 60 credits.</li>`).join('')}</ul>
<p>The same 60 credits at the national median public university price for residents, ${h.m(h.N.medPub4)} a credit before fees, would cost ${h.m(60 * h.N.medPub4)}. Starting at the cheapest college of your state and moving later to a university is the most common way to lower the price of a degree.</p>
<p>One more detail matters at community colleges: many charge less to residents of their own district, the area whose property taxes fund them. The table uses the state resident price, so a student who lives in the district may pay less still. The calculator above uses the same state price; the district price, where the college has one, is on its tuition page.</p>
`;
  },
});
