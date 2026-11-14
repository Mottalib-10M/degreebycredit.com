import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatNumber } from '../../lib/format';

export default definePage({
  id: 'online-colleges-by-state',
  group: 'choose',
  order: 220,
  tool: { kind: 'mini:state' },
  related: ['cheapest-online-colleges', 'out-of-state-online-tuition', 'online-associates-degree', 'online-college-graduation-rates', 'home'],
  sources: ['ipeds_hd', 'ipeds_ic_ay', 'ipeds_ef_dist', 'scorecard_data'],
  slug: 'online-colleges-by-state',
  nav: 'Online colleges by state',
  card: 'All 50 states and DC: how many colleges teach online, the median public price, the share of students fully online.',
  title: 'Online Colleges by State 2026: Prices, Counts and Completion',
  description: 'Online colleges by state: how many colleges teach fully online students, the median public price per credit with fees, and award rates, all 50 states and DC.',
  h1: 'Online colleges by state: price, number of colleges and results',
  intro: `Online colleges by state differ more than any national list shows: ${formatNumber(NAT.nOnline, 0)} colleges across the 50 states and DC teach 50 or more students fully online, at resident prices that vary several times over. Pick your state for its median, its lowest price and its results.`,
  resume: (h) => {
    const S = Object.values(h.D.STATES).filter((s) => s.medEffPub);
    const lo = S.slice().sort((a, b) => (a.medEffPub ?? 0) - (b.medEffPub ?? 0))[0];
    const hi = S.slice().sort((a, b) => (b.medEffPub ?? 0) - (a.medEffPub ?? 0))[0];
    return `Because public colleges charge their own residents far less, the best price for most online students is in their home state. The table on this page gives, for each state, the number of colleges with 50 or more fully online students, the number of students enrolled fully online at the state’s colleges in ${h.P.ipeds.enrollmentTerm}, the median resident price per credit at its public colleges with fees spread over 30 credits, and the median share of students who finished within eight years. The median price runs from ${h.m(lo.medEffPub ?? 0)} in ${lo.name} to ${h.m(hi.medEffPub ?? 0)} in ${hi.name}. Students are counted where the college is, not where they live: Utah and New Hampshire carry the hundreds of thousands of online students of Western Governors University and Southern New Hampshire University, who live in every state. Charges are those of ${h.P.ipeds.chargesYear}.`;
  },
  faqs: (h) => [
    { q: 'Which state has the cheapest online colleges?', a: 'For residents, the states with the lowest median public price with fees are at the top when the table is sorted by price; California’s community colleges are the cheapest single group in the country. For a student from another state the answer changes, since out-of-state prices apply: see the out-of-state page.' },
    { q: 'Can I attend an online college in another state?', a: 'Yes, though the college must be authorized to enroll students where you live. Most states take part in an agreement that handles this for online study, and colleges say on their pages which states they accept. Expect the out-of-state price at public colleges.' },
    { q: 'Why does my state show few online colleges?', a: `The count includes only colleges with at least 50 students taking all their courses online, so a state with small colleges can show few. Its residents can still study online at a public university of the state that offers online programs, or at a private college elsewhere.` },
  ],
  body: (h) => {
    const rows = Object.values(h.D.STATES).sort((a, b) => a.name.localeCompare(b.name)).map((s) => [s.name, s.nOnline, s.exc, s.medEffPub ? h.m(s.medEffPub) : 'n/a', s.medOm8 != null ? h.pc(s.medOm8, 0) : 'n/a']);
    const five = Object.values(h.D.STATES).sort((a, b) => b.exc - a.exc).slice(0, 5);
    return `
<h2>Online colleges by state: the full table</h2>
${h.table(['State', 'Colleges with 50+ online students', 'Fully online students', 'Median public price with fees', 'Median award in 8 years'], rows, `IPEDS: enrollment ${h.P.ipeds.enrollmentTerm}, charges ${h.P.ipeds.chargesYear}; price with fees = resident charge per credit + yearly fees ÷ 30, median of public colleges with online students. College Scorecard: share who finished within 8 years, among the ${h.P.scorecard.awardCohort} entering class.`, ['l', 'r', 'r', 'r', 'r'])}
<h2>Reading the table</h2>
<p>The price column is a median of public colleges, community colleges included, so states with many low-cost community colleges show a low figure even if their universities are dear. For the lowest price and the lowest four-year price in a state, use the calculator above or the ${h.a('cheapest-online-colleges', 'cheapest colleges page')}.</p>
<p>The award column mixes community colleges and universities, part-time and full-time students: it is the share of all entering students who earned an award from the same college within eight years. Students who transferred and finished elsewhere count as non-completers here, which lowers the figure for states where many start at a community college.</p>
<p>Studying in a state where you do not live? The ${h.a('out-of-state-online-tuition', 'out-of-state page')} prices the difference.</p><h2>Five states up close</h2>
<p>The states whose colleges enroll the most fully online students, with their lowest public price and their largest online school:</p>
<ul>${five.map((s) => `<li><strong>${s.name}</strong>: ${h.num(s.nOnline)} colleges with 50 or more online students; ${h.pc(s.share ?? 0, 0)} of students at the state’s colleges were fully online; lowest public price with fees ${s.cheapest ? `${h.m2(s.cheapest.eff ?? 0)} at ${h.B.name(s.cheapest.n)}` : 'not reported'}; largest online school ${s.largest ? `${h.B.name(s.largest.n)}, ${h.num(s.largest.exc ?? 0)} students` : 'not reported'}.</li>`).join('')}</ul>
<p>California’s place comes from the size of its community college system, the cheapest in the country for residents. Arizona, Utah and New Hampshire owe theirs mostly to one or two very large online universities based there.</p>
<p>A student in a small state is not at a disadvantage on price: the public colleges of every state teach online, and the calculator above finds the lowest one.</p>
`;
  },
});
