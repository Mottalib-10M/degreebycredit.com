import { definePage } from '../../lib/guide-types';
import { formatMoney, formatNumber } from '../../lib/format';
import { cheapestTable, statesTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const M = lvl('mba', 'mast');

export default definePage({
  id: 'online-mba-programs',
  group: 'program',
  order: 10,
  tool: { kind: 'mini:prog-mba' },
  related: ['online-masters-degree', 'online-accounting-degree', 'masters-in-healthcare-administration', 'cost-per-credit-hour', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'scorecard_data'],
  slug: 'online-mba-programs',
  nav: 'Online MBA programs',
  card: 'Universities that let you finish a business administration master’s online, their graduate price per credit and the lowest prices.',
  title: 'Online MBA Programs 2026: Price per Credit, State by State',
  description: 'Online MBA programs counted in federal IPEDS data: the universities offering a business master’s fully online, graduate price per credit and the lowest ones.',
  h1: 'Online MBA programs: who offers one fully online, at what price per credit',
  intro: `Online MBA programs are offered by ${formatNumber(M.nOnline, 0)} universities that report a business administration master’s completable at a distance. At the public ones, residents pay a median of ${$(M.med.pub)} a graduate credit, about ${$((M.med.pub ?? 0) * 36)} for 36 credits.`,
  resume: (h) => `The federal program file does not use the letters MBA: it groups master’s degrees by field, and the Master of Business Administration falls under CIP code 52.0201, business administration and management, general. In ${h.P.programs.completionsYear}, ${h.num(M.nOffer)} universities awarded a master’s in that field and ${h.num(M.nOnline)} of them, ${h.pc(M.nOnline / M.nOffer, 0)}, reported at least one program that can be completed entirely at a distance: ${h.num(M.nPub)} public, ${h.num(M.nNpf)} private nonprofit and ${h.num(M.nFp)} for-profit. Their graduate prices per credit, as reported to IPEDS for ${h.P.ipeds.chargesYear}, have a median of ${h.m(M.med.pub ?? 0)} at public universities for residents and ${h.m(M.med.pubOut ?? 0)} for students from other states, ${h.m(M.med.npf ?? 0)} at private nonprofit universities and ${h.m(M.med.fp ?? 0)} at for-profit ones. Those are the university’s general graduate charges: business schools often bill their MBA at a higher program rate, which only the school’s tuition page gives.`,
  faqs: (h) => [
    { q: 'How much does an online MBA cost?', a: `At the median graduate charge of public universities with an online MBA, ${h.m(M.med.pub ?? 0)} a credit, 36 credits cost about ${h.m((M.med.pub ?? 0) * 36)} for a state resident, before fees. Private nonprofit universities have a median of ${h.m((M.med.npf ?? 0) * 36)} for the same credits. Programs with a business school premium cost more.` },
    { q: 'How long does an online MBA take?', a: 'Most ask for 30 to 48 credits. Taking two courses in each of three terms, 18 credits a year, a 36-credit MBA takes two years; accelerated formats with eight-week terms can finish in about a year. The calculator shows the years at the pace you type under “More details”.' },
    { q: 'Does an online MBA say “online” on the diploma?', a: 'Universities usually award the same degree whatever the format, and the federal file counts a program as online only when it can be completed at a distance. Ask the admission office how the transcript and diploma read if it matters for your employer.' },
    { q: 'Can my employer pay for an online MBA?', a: 'Many employers repay part of graduate tuition each year, sometimes against a promise to stay. Type the yearly amount in the calculator under grants or employer help: it comes off the total. Ask human resources whether the program must hold a business accreditation.' },
  ],
  body: (h) => {
    const npfLow = lvl('mba', 'mast').cheapest.filter((c) => c.ctrl === 2)[0];
    return `
<h2>Online MBA programs at the lowest graduate price</h2>
<p>Sorted by the graduate price per credit for residents, among all universities with a business administration master’s that can be completed fully online. Public universities fill the top of the list; the first private nonprofit one is ${npfLow ? `${h.B.name(npfLow.n)}, at ${h.m(npfLow.p ?? 0)} a credit` : 'further down'}.</p>
${cheapestTable(h, 'mba', 'mast', 15, `Graduate per-credit charge for state residents, ${h.P.ipeds.chargesYear} (IPEDS); master’s in business administration (CIP 52.0201) completable entirely online, ${h.P.programs.completionsYear}.`)}
<p>The general graduate charge is a floor. Some universities price their MBA above the rest of their graduate school, and the out-of-state column applies when you live elsewhere, unless the university charges one online rate to everyone.</p>
<h2>Where the online MBA programs are</h2>
${statesTable(h, 'mba', 'mast', 15, 'Universities in each state with an online business administration master’s, and the lowest graduate charge for residents at a public one.')}
<p>Texas, Pennsylvania, California and New York have the most, but a student in any state can enroll elsewhere, as long as the university is authorized to teach students from that state. For a resident, though, the home state’s public universities are usually the price floor.</p>
<h2>Three costs the price per credit leaves out</h2>
<p><strong>Program fees.</strong> Business schools often add a fee per term, a technology fee or a residency week on campus. They do not appear in the federal file and can add a few thousand dollars.</p>
<p><strong>Prerequisite courses.</strong> Without a business bachelor’s you may need foundation courses in accounting, finance or statistics before the core. They add credits, hence cost.</p>
<p><strong>Time.</strong> A slower pace lowers each year’s bill but not the total tuition. It does lengthen the years of fees, which the calculator counts when you add them under “More details”.</p>
<h2>An example with the medians</h2>
<p>A resident of Texas taking 36 credits at the median graduate charge of public universities with an online MBA pays about ${h.m(36 * (lvl('mba', 'mast').med.pub ?? 0))} in tuition. The same student at a public university in another state, at the out-of-state median, pays about ${h.m(36 * (lvl('mba', 'mast').med.pubOut ?? 0))}; at the private nonprofit median, about ${h.m(36 * (lvl('mba', 'mast').med.npf ?? 0))}. Employer help of a few thousand dollars a year over two years can take a large share off the public price. The calculator above runs the same sums with your state, your credits and your help.</p>
<h2>Reading the federal figures</h2>
<p>The program count comes from the ${h.P.programs.file} file of IPEDS, which reports, for each university and field, how many master’s programs can be completed entirely through distance education. It does not say whether the program holds a business accreditation such as AACSB, ACBSP or IACBE; each school lists its own. Nor does it rank programs: this page sorts by price, a rule anyone can check, and names no school as better than another.</p>
`;
  },
});
