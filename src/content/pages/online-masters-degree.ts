import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);

export default definePage({
  id: 'online-masters-degree',
  group: 'degree',
  order: 120,
  tool: { kind: 'mini:grad-cost' },
  related: ['cost-per-credit-hour', 'largest-online-universities', 'online-bachelors-degree', 'online-colleges-that-accept-fafsa', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_ic_ay_dict', 'ipeds_ef_dist', 'scorecard_data'],
  slug: 'online-masters-degree',
  nav: 'Online master’s degree',
  card: 'Graduate price per credit by type of university, and the cost of a 30 to 36 credit program.',
  title: 'Online Masters Degree 2026: Cost per Credit and the Total',
  description: 'Online masters degree cost from the graduate price per credit universities report to IPEDS: public, nonprofit and for-profit medians, and a program total.',
  h1: 'Online masters degree: the graduate price per credit and the total',
  intro: `An online masters degree usually takes 30 to 36 credits. Public universities charge state residents a median of ${$(NAT.medGradPub)} a graduate credit, so about ${$(NAT.medGradPub * 36)} for 36 credits. Pick a type of university or type your program’s price.`,
  resume: (h) => `Graduate credits are priced separately from undergraduate ones, and they nearly always cost more. In ${h.P.ipeds.chargesYear}, ${h.num(h.N.nH6)} colleges reported an in-state per-credit charge for part-time graduate students. The medians: ${h.m(h.N.medGradPub)} at public universities for state residents and ${h.m(h.D.NAT.medGradPubOut)} for students from other states, ${h.m(h.N.medGradNpf)} at private nonprofit universities and ${h.m(h.N.medGradFp)} at for-profit ones. Most master’s degrees ask for 30 to 36 credits, an MBA (Master of Business Administration) often more. Online graduate students mostly work full time and take two courses a term, so a program of 36 credits lasts about two years. Unlike undergraduates, graduate students cannot receive a Pell Grant; employer tuition help, scholarships from the university and federal loans are the usual ways to pay for the degree.`,
  faqs: (h) => [
    { q: 'How much does an online master’s degree cost?', a: `At the median public university, about ${h.m(h.N.medGradPub * 36)} for 36 credits for a state resident, ${h.m(h.D.NAT.medGradPubOut * 36)} from another state, before fees. Private nonprofit universities have a median of ${h.m(h.N.medGradNpf * 36)}. Programs in business, computing or health often cost more than the median of their university.` },
    { q: 'Is an online master’s cheaper than on campus?', a: 'The price per credit is often the same, and some universities charge their online master’s more. The saving is in keeping your job and not moving. Compare the program’s own tuition page with the median shown here, and ask whether fees differ for online students.' },
    { q: 'Can my employer pay for my online master’s?', a: 'Many employers offer tuition help, sometimes with a yearly cap and a commitment to stay. Type the yearly amount in the calculator: it comes off the total like a grant. Ask human resources whether the program must be accredited or related to your job.' },
  ],
  body: (h) => {
    const rows = h.D.FEATURED.filter((f) => f.h6).slice(0, 12).map((f) => [h.B.name(f.n), h.m(f.h6 ?? 0), h.m((f.h6 ?? 0) * 36), f.grExc ? h.num(f.grExc) : 'n/a']);
    return `
<h2>Online masters degree prices at large online universities</h2>
<p>Graduate price per credit and 36 credits at that price, for the largest online schools that report one, with the number of graduate students studying fully online there.</p>
${h.table(['University', 'Per graduate credit', '36 credits', 'Graduate students fully online'], rows, `In-state graduate charge for part-time students, ${h.P.ipeds.chargesYear}; enrollment ${h.P.ipeds.enrollmentTerm} (IPEDS).`, ['l', 'r', 'r', 'r'])}
<p>A flat-rate university reports no per-credit graduate charge and is missing here; its yearly price is on the ${h.a('largest-online-universities', 'largest online universities page')}.</p>
<h2>Graduate fees and the rest</h2>
<p>The federal file has no median graduate fee: universities report fees for undergraduates only. Read the program’s page for technology, program and graduation fees, and type them under “More details”. Some programs also charge for a residency week or a capstone project.</p>
<h2>Paying for it</h2>
<p>Graduate students can borrow federal loans after filing the FAFSA, but Pell Grants are for undergraduates. Employer help, assistantships and scholarships from the university are the main grants at this level. The ${h.a('online-colleges-that-accept-fafsa', 'federal aid page')} explains what every college counted here must accept.</p><h2>Online masters degree budgets compared</h2>
<p>The same 36 credits at the median graduate price of each type of university, before fees:</p>
<ul>
<li><strong>Public, state resident</strong>: ${h.m(36 * h.N.medGradPub)}.</li>
<li><strong>Public, from another state</strong>: ${h.m(36 * h.D.NAT.medGradPubOut)}.</li>
<li><strong>Private for-profit</strong>: ${h.m(36 * h.N.medGradFp)}.</li>
<li><strong>Private nonprofit</strong>: ${h.m(36 * h.N.medGradNpf)}.</li>
</ul>
<p>The order differs from the undergraduate one: for a master’s, a for-profit university’s median is below the nonprofit median, and a public university outside your state is often the dearest choice. Many public universities do give their online master’s a single price for all states, so the out-of-state line is the one most worth checking against the program’s page.</p>
<p>Length matters less than for a bachelor’s, since a master’s is short, but the number of credits does not: programs of the same name range from 30 to more than 45 credits. Count the credits on the program sheet, type them in the calculator, and compare totals, not prices per credit alone.</p>
<h2>Before you enroll in an online master’s</h2>
<p>Check four points on the program’s own pages. The admission rules: some programs ask for a minimum grade average, a test score or years of work. The format: fully online, or with a few days on campus. The pace: how many courses a term the program expects, and whether you may pause. And the outcome you need: for licensed work in counseling, teaching or nursing, the program must meet your state’s license rules, which a federal price file cannot tell you.</p>
<p>Then type the credits and the price per credit of each program you consider into the calculator above, and compare totals.</p>
`;
  },
});
