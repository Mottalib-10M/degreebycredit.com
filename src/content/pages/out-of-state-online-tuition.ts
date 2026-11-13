import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);

export default definePage({
  id: 'out-of-state-online-tuition',
  group: 'cost',
  order: 40,
  tool: { kind: 'mini:out-of-state' },
  related: ['online-colleges-by-state', 'cheapest-online-bachelors-degree', 'cost-per-credit-hour', 'largest-online-universities', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_ic_ay_dict', 'ipeds_ef_dist', 'ipeds_glossary'],
  slug: 'out-of-state-online-tuition',
  nav: 'Out-of-state online tuition',
  card: 'What studying online from another state adds per credit, and the public universities that charge everyone the same.',
  title: 'Out-of-State Online Tuition 2026: Premium and Who Waives It',
  description: 'Out-of-state online tuition at public universities: the median premium per credit, what it adds to a degree, and the schools that charge everyone the same.',
  h1: 'Out-of-state online tuition: what the premium costs and who skips it',
  intro: `Out-of-state online tuition at a public university has a median of ${$(NAT.medPub4out)} a credit, against ${$(NAT.medPub4)} for state residents. On 120 credits the gap tops ${$(Math.floor(((NAT.medPub4out - NAT.medPub4) * 120) / 1000) * 1000)}. Type the two prices of your school to see your own premium.`,
  resume: (h) => `Public universities are paid partly by their state’s taxpayers, so they charge residents less. For online study the rule usually stays: a student in Ohio taking online courses from a public university in Arizona pays the non-resident rate unless the program sets its own. In ${h.P.ipeds.chargesYear}, the ${h.num(h.N.nPub4Out)} public four-year colleges that report both charges asked a median of ${h.m(h.N.medPub4out)} a credit from non-residents and ${h.m(h.N.medPub4)} from residents. ${h.num(h.N.nSameOut)} of them charged both the same per-credit price. Private colleges, nonprofit or for-profit, almost always charge one price wherever the student lives, which is why many large online universities are private. Community colleges have the same two-tier pricing, with a median of ${h.m(h.N.medPub2out)} a credit from out of state against ${h.m(h.N.medPub2)} in state.`,
  faqs: (h) => [
    { q: 'Do online students pay out-of-state tuition?', a: `At most public colleges, yes, unless the online program has its own rate. Residence is decided by where you live, not where you study. ${h.num(h.N.nSameOut)} of the ${h.num(h.N.nPub4Out)} public four-year colleges in the federal file charge residents and non-residents the same per-credit price; the list below names the larger ones.` },
    { q: 'Can I get in-state tuition by moving for an online degree?', a: 'Each state sets its own residency rules, usually a year of living there for reasons other than school, with proof such as a lease, a driver’s license or a tax return. Moving only to study rarely qualifies. Ask the university’s residency office before you count on it.' },
    { q: 'Are there regional tuition discounts for online students?', a: 'Some groups of states run tuition exchanges that give a reduced rate to students from member states, and some apply to online programs. The terms change by program and by year, and the federal file does not record them, so ask the university whether your state takes part.' },
  ],
  body: (h) => {
    const same = h.D.COLLEGES.filter((c) => c.ctrl === 1 && c.lvl === 1 && c.h2 && c.h3 === c.h2 && (c.exc ?? 0) >= 500).slice(0, 15).map((c) => [h.B.name(c.n), c.st, h.m(c.h2 ?? 0), c.exc ?? 0]);
    const big = h.D.COLLEGES.filter((c) => c.ctrl === 1 && c.lvl === 1 && c.h2 && c.h3 && c.h3 > c.h2 && (c.exc ?? 0) >= 5000).slice(0, 10).map((c) => [h.B.name(c.n), c.st, h.m(c.h2 ?? 0), h.m(c.h3 ?? 0), h.m(((c.h3 ?? 0) - (c.h2 ?? 0)) * 120)]);
    return `
<h2>Public universities with no out-of-state online tuition premium</h2>
<p>Public four-year colleges with at least 500 fully online students that report the same per-credit charge for residents and non-residents, largest online enrollment first.</p>
${h.table(['University', 'State', 'Price per credit, everyone', 'Fully online students'], same, `Per-credit charges for part-time undergraduates, ${h.P.ipeds.chargesYear}; enrollment ${h.P.ipeds.enrollmentTerm} (IPEDS).`, ['l', 'l', 'r', 'r'])}
<p>A university that charges everyone the same is not always cheap: compare its price with your own state’s public universities, on the ${h.a('online-colleges-by-state', 'state page')}, before you choose.</p>
<h2>Where the premium is largest</h2>
<p>Among public universities teaching 5,000 or more students fully online, those with a higher out-of-state price, and what the gap adds to 120 credits:</p>
${h.table(['University', 'State', 'Resident', 'Non-resident', 'Gap on 120 credits'], big, `IPEDS ${h.P.ipeds.chargesYear}. Online programs may bill a separate rate: check the program’s tuition page.`, ['l', 'l', 'r', 'r', 'r'])}
<p>These figures are what the universities report for part-time undergraduates in general. Several large public online programs publish an e-rate that sits between the two, so a lower price may be on offer; the federal file has no field for it.</p>
<h2>Three ways to avoid paying it</h2>
<p>Study at a public college in your own state, which the ${h.a('cheapest-online-colleges', 'cheapest colleges page')} lists state by state. Choose a public university that charges everyone the same, from the first table. Or compare with private nonprofit universities, whose single price is sometimes below a public non-resident rate.</p><h2>A worked example: 90 credits left</h2>
<p>Take a student with 30 credits already, who needs 90 more for a bachelor’s at a public university in another state. At the median resident price, ${h.m(h.N.medPub4)}, the 90 credits would cost ${h.m(90 * h.N.medPub4)}; at the median out-of-state price, ${h.m(h.N.medPub4out)}, they cost ${h.m(90 * h.N.medPub4out)}. The premium is ${h.m(90 * (h.N.medPub4out - h.N.medPub4))}, before fees, for the same courses and the same diploma.</p>
<p>Community colleges work the same way on a smaller scale: ${h.m(h.N.medPub2out)} a credit from another state against ${h.m(h.N.medPub2)} in state, at the median.</p>
<h2>Who counts as a resident</h2>
<p>Residency is set by state law and by each university’s rules. The usual test is twelve months of living in the state before the term starts, with documents to prove it, and an intent to stay that is not only about school. Military families, some veterans and students in tuition exchange programs may qualify for the resident price under special rules. An online student who lives in another state is, in almost every case, a non-resident.</p>
<p>If you are unsure which status a university will give you, ask its admissions office before you apply: the answer decides more of your bill than any scholarship you are likely to receive.</p>
<p>Keep in mind that fees can follow residency too: some universities charge non-residents higher fees as well as higher tuition, which the federal file records separately for full-time students.</p>
`;
  },
});
