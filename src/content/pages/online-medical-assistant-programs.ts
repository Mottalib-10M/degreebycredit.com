import { definePage } from '../../lib/guide-types';
import { formatMoney, formatNumber } from '../../lib/format';
import { cheapestTable, mostTable, statesTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const C = lvl('medassist', 'cert');

export default definePage({
  id: 'online-medical-assistant-programs',
  group: 'program',
  order: 20,
  tool: { kind: 'mini:prog-medassist' },
  related: ['medical-billing-and-coding-online-programs', 'online-nursing-programs', 'online-associates-degree', 'cheapest-online-colleges', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'ipeds_hd'],
  slug: 'online-medical-assistant-programs',
  nav: 'Online medical assistant programs',
  card: 'The few colleges whose medical assistant certificate or associate degree can be finished online, and what a credit costs there.',
  title: 'Online Medical Assistant Programs 2026: Colleges and Costs',
  description: 'Online medical assistant programs in federal IPEDS data: colleges with a certificate or associate degree you can finish online, their price per credit by state.',
  h1: 'Online medical assistant programs: the colleges that report one completable online, and their price',
  intro: `Online medical assistant programs are rarer than their ads suggest: ${formatNumber(C.nOnline, 0)} of ${formatNumber(C.nOffer, 0)} degree-granting colleges with a medical assistant certificate report one completable fully online. At public colleges, residents pay a median of ${$(C.med.pub)} a credit. Choose your state below.`,
  resume: (h) => {
    const A = lvl('medassist', 'assoc');
    return `A medical assistant takes vital signs, prepares patients and handles the front office of a clinic, so programs teach hands-on skills that are hard to learn at a distance. The federal program file for ${h.P.programs.completionsYear} shows it: under CIP code 51.0801, medical and clinical assistant, ${h.num(C.nOffer)} degree-granting colleges that take federal aid award a certificate and only ${h.num(C.nOnline)} of them, ${h.pc(C.nOnline / C.nOffer, 0)}, report one that can be completed entirely online; for the associate degree, ${h.num(A.nOnline)} of ${h.num(A.nOffer)}. Programs labeled online elsewhere usually mix online classes with labs and an externship in a medical office near you. Among colleges with a fully online certificate, the median price for residents is ${h.m(C.med.pub ?? 0)} a credit at public ones, mostly community colleges, against ${h.m(C.med.fp ?? 0)} at for-profit schools. Schools that award only certificates and no degree are outside this count; College Navigator lists them.`;
  },
  faqs: (h) => [
    { q: 'Can you become a medical assistant fully online?', a: 'The classroom part can be online, but clinical skills such as drawing blood, giving injections or taking vital signs are practiced in a lab and during an externship. A program counted as fully online by the federal file may still ask for that externship near your home: ask how it is arranged.' },
    { q: 'How much does an online medical assistant certificate cost?', a: `At the median public college with one online, ${h.m(C.med.pub ?? 0)} a credit for residents, a 30-credit certificate costs about ${h.m((C.med.pub ?? 0) * 30)} in tuition. At the for-profit median it is about ${h.m((C.med.fp ?? 0) * 30)}. Add fees, scrubs, a background check and the certification exam fee from the program’s own list.` },
    { q: 'Do I need certification to work as a medical assistant?', a: 'Rules depend on the state and the employer: some ask for a national certification, others hire and train on the job. Certification bodies set their own eligibility rules, often tied to the accreditation of your program, so check the rule of the exam you aim for before you enroll.' },
  ],
  body: (h) => {
    const A = lvl('medassist', 'assoc');
    return `
<h2>Online medical assistant programs at the lowest resident price</h2>
<p>Price per credit plus the yearly required fees spread over 30 credits, lowest first, among colleges whose medical assistant certificate can be completed fully online. California’s community colleges lead the list because they report one low rate for every resident of the state.</p>
${cheapestTable(h, 'medassist', 'cert', 12, `Medical or clinical assistant certificate (CIP 51.0801) completable entirely online, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}); resident charges ${h.P.ipeds.chargesYear}.`)}
<p>A student from another state pays the second price column, often several times the first. A community college in your own state, even at a higher resident price, is usually the cheaper choice.</p>
<h2>States with an online medical assistant certificate</h2>
<p>Only ${h.num(C.nStates)} states have at least one degree-granting college offering it fully online. The table gives the states with the most, and the lowest public price there:</p>
${statesTable(h, 'medassist', 'cert', 12, 'Colleges with a medical assistant certificate completable entirely online, by state, and the lowest resident price at a public one, fees included.')}
<h2>Certificate or associate degree</h2>
<p>A certificate takes about a year and leads straight to work. The associate degree adds general education courses, takes about two years and can transfer later toward a bachelor’s in health care administration. Fully online, the associate degree is offered by ${h.num(A.nOnline)} colleges, ${h.num(A.nPub)} of them public, with a public median of ${h.m(A.med.pub ?? 0)} a credit for residents.</p>
${mostTable(h, 'medassist', 'assoc', 8, 'Colleges with a medical assistant associate degree completable entirely online. Sorted by the number of such programs, then online enrollment; price with fees spread over 30 credits.')}
<h2>What a program costs, worked through</h2>
<p>Take a certificate of 30 credits, a common length. At the median public college with one fully online, a resident pays about ${h.m(30 * (C.med.pub ?? 0))} in tuition; at the private nonprofit median, about ${h.m(30 * (C.med.npf ?? 0))}; at the for-profit median, about ${h.m(30 * (C.med.fp ?? 0))}. The spread between those numbers is larger than any fee, which is why the type of school matters more than the program’s name. Books, uniforms, a background check and the certification exam come on top at every type of school.</p>
<p>Federal aid can help: every college counted here takes part in the federal aid programs, and a certificate of enough length can qualify for a Pell Grant. The ${h.a('online-colleges-that-accept-fafsa', 'FAFSA page')} explains how to apply.</p>
<h2>Before you sign up</h2>
<p><strong>Ask where the externship happens.</strong> A program that cannot place you in a clinic near home is not really online for you.</p>
<p><strong>Ask about accreditation of the program.</strong> The college’s accreditor appears in College Scorecard; the medical assistant program may also hold its own, which some certification exams require.</p>
<p><strong>Compare totals, not monthly payments.</strong> Type the credits and the price of each program into the calculator above. Schools that sell through phone calls after a form often quote a monthly amount; the total tuition is what you will owe.</p>
`;
  },
});
