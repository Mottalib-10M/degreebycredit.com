import { definePage } from '../../lib/guide-types';
import { formatMoney, formatNumber } from '../../lib/format';
import { levelTable, cheapestTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const B = lvl('accounting', 'bach');

export default definePage({
  id: 'online-accounting-degree',
  group: 'program',
  order: 15,
  tool: { kind: 'mini:prog-accounting' },
  related: ['online-mba-programs', 'online-bachelors-degree', 'online-associates-degree', 'cheapest-online-bachelors-degree', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'scorecard_data'],
  slug: 'online-accounting-degree',
  nav: 'Online accounting degree',
  card: 'Accounting certificates, associate, bachelor’s and master’s degrees you can finish online, with the lowest prices per credit.',
  title: 'Online Accounting Degree 2026: Cost by Level and by School',
  description: 'Online accounting degree prices from federal IPEDS data: colleges with an accounting certificate, associate, bachelor’s or master’s fully online, per credit.',
  h1: 'Online accounting degree: the colleges that offer one fully online, from certificate to master’s',
  intro: `An online accounting degree is easy to find at every level: ${formatNumber(B.nOnline, 0)} colleges report an accounting bachelor’s that can be completed fully online. Public ones charge residents a median of ${$(B.med.pub)} a credit with fees left out. Pick your level and state to see the total.`,
  resume: (h) => {
    const C = lvl('accounting', 'cert'), A = lvl('accounting', 'assoc'), M = lvl('accounting', 'mast');
    return `Accounting is one of the fields most often taught at a distance, from the short bookkeeping certificate to the master’s. The federal program file for ${h.P.programs.completionsYear} counts, under the accounting codes of CIP series 52.03, ${h.num(C.nOnline)} colleges with an undergraduate certificate that can be completed fully online, ${h.num(A.nOnline)} with an associate degree, ${h.num(B.nOnline)} with a bachelor’s and ${h.num(M.nOnline)} with a master’s. The cheaper levels sit mostly at public community colleges: their median price for residents is ${h.m(A.med.pub ?? 0)} a credit for the associate degree, against ${h.m(B.med.pub ?? 0)} at the public universities with an online bachelor’s and ${h.m(B.med.npf ?? 0)} at private nonprofit ones. A common route is therefore an associate degree first, then a transfer to a bachelor’s, as long as the university accepts the credits. Those planning the CPA exam should read their state board of accountancy’s rules before choosing.`;
  },
  faqs: (h) => [
    { q: 'How much does an online accounting bachelor’s cost?', a: `At the median public university with one online, ${h.m(B.med.pub ?? 0)} a credit for residents, 120 credits come to about ${h.m((B.med.pub ?? 0) * 120)} in tuition before fees and transfer credits. The same credits at the private nonprofit median cost about ${h.m((B.med.npf ?? 0) * 120)}. Starting with an associate degree lowers the total.` },
    { q: 'Can I sit the CPA exam with an online accounting degree?', a: 'State boards of accountancy set the education rules for the CPA exam and license, and they look at the credits and the courses, not at the format. Check that the college is accredited by an agency the Department of Education recognizes and that your courses match your board’s list.' },
    { q: 'Is a bookkeeping certificate worth starting with?', a: 'A certificate is short and usually priced at the community college rate. Its credits may count later toward an associate degree at the same college; transfer to a university is decided course by course. Ask the college whether the certificate “stacks” into its associate degree.' },
  ],
  body: (h) => {
    const A = lvl('accounting', 'assoc');
    return `
<h2>Online accounting degree by level</h2>
${levelTable(h, 'accounting', `Colleges with an accounting program (CIP 52.0301, 52.0302, 52.0304, 52.0305) that can be completed entirely online, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}), and the median per-credit charge of ${h.P.ipeds.chargesYear} at those colleges: undergraduate for the first three rows, graduate for the master’s.`, { cert: 'Certificate (bookkeeping, accounting)' })}
<p>The bachelor’s has the lowest share of online programs: ${h.num(B.nOnline)} of ${h.num(B.nOffer)} colleges, ${h.pc(B.nOnline / B.nOffer, 0)}, against ${h.pc(lvl('accounting', 'mast').nOnline / lvl('accounting', 'mast').nOffer, 0)} for the master’s. Many universities keep their accounting bachelor’s on campus while putting the master’s online.</p>
<h2>Lowest prices for an online accounting bachelor’s</h2>
<p>Price per credit plus the yearly required fees spread over 30 credits, for state residents, lowest first, among colleges offering the bachelor’s in accounting fully online.</p>
${cheapestTable(h, 'accounting', 'bach', 12, 'Accounting bachelor’s completable entirely online; general undergraduate charge of the college, not a program fee.')}
<h2>Starting at a community college</h2>
<p>The associate degree in accounting is offered fully online by ${h.num(A.nOnline)} colleges, ${h.num(A.nPub)} of them public. The lowest prices are at California’s community colleges, which report the same low rate for every resident of the state:</p>
${cheapestTable(h, 'accounting', 'assoc', 8, 'Accounting associate degree completable entirely online, resident price per credit with fees, lowest first.')}
<p>Sixty credits at a community college, then sixty at a university, is the route the ${h.a('online-associates-degree', 'associate degree page')} prices in detail. The saving holds only if the university accepts the credits: ask for a transfer agreement before you start.</p>
<h2>Two routes to an accounting bachelor’s, priced</h2>
<p>With the medians in the table: 120 credits at a public university with an online accounting bachelor’s cost a state resident about ${h.m(120 * (B.med.pub ?? 0))} in tuition. Taking the first 60 at the median community college offering the associate degree online, then 60 at the university, comes to about ${h.m(60 * (A.med.pub ?? 0) + 60 * (B.med.pub ?? 0))}, a saving of about ${h.m(60 * ((B.med.pub ?? 0) - (A.med.pub ?? 0)))} if every credit transfers. At the private nonprofit median, the full bachelor’s comes to about ${h.m(120 * (B.med.npf ?? 0))}.</p>
<p>Fees come on top in every case, and a university may refuse some community college courses, in particular upper-level accounting. Ask the university to review your transcript before you count on the saving.</p>
<h2>An accounting master’s online</h2>
<p>A master’s in accounting or taxation can be finished online at ${h.num(lvl('accounting', 'mast').nOnline)} universities, with a median graduate charge of ${h.m(lvl('accounting', 'mast').med.pub ?? 0)} a credit at public ones for residents. Programs usually ask for 30 credits, often less for students with an accounting bachelor’s.</p>
<h2>What to check before you enroll</h2>
<p><strong>The credits your goal needs.</strong> A bookkeeping job may need only a certificate. For the CPA, your state board of accountancy publishes the credit hours and courses it asks for, and some students reach them with a master’s.</p>
<p><strong>The format.</strong> The federal file counts a program as online when it can be completed at a distance. Ask whether exams are proctored online or in a testing center.</p>
<p><strong>The real price.</strong> The figures here are the college’s general charges for ${h.P.ipeds.chargesYear}. Type the program’s current price in the calculator with “I know my school’s price”.</p>
`;
  },
});
