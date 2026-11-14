import { definePage } from '../../lib/guide-types';
import { formatMoney, formatNumber } from '../../lib/format';
import { levelTable, cheapestTable, mostTable, statesTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const C = lvl('coding', 'cert');

export default definePage({
  id: 'medical-billing-and-coding-online-programs',
  group: 'program',
  order: 22,
  tool: { kind: 'mini:prog-coding' },
  related: ['online-medical-assistant-programs', 'masters-in-healthcare-administration', 'online-associates-degree', 'cheapest-online-colleges', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'scorecard_data'],
  slug: 'medical-billing-and-coding-online-programs',
  nav: 'Medical billing and coding online',
  card: 'Certificates and associate degrees in coding, billing and health information you can finish online, with the lowest prices per credit.',
  title: 'Medical Billing and Coding Online Programs 2026: Cost',
  description: 'Medical billing and coding online programs in federal IPEDS data: colleges with a certificate or associate degree to finish online, price a credit by state.',
  h1: 'Medical billing and coding online programs: colleges with a certificate or degree you can finish online',
  intro: `Medical billing and coding online programs suit distance study well: ${formatNumber(C.nOnline, 0)} colleges report a certificate completable fully online, most of them public. Residents pay a median of ${$(C.med.pub)} a credit there. Pick a certificate or an associate degree and your state below.`,
  resume: (h) => {
    const A = lvl('coding', 'assoc');
    return `Coding turns a patient record into the standard codes insurers pay on, and billing follows the claim until it is paid; health information technology covers both and the records themselves. The federal program file has three codes for this work: 51.0713, medical insurance coding specialist, 51.0714, medical insurance specialist or biller, and 51.0707, health information and medical records technology. For ${h.P.programs.completionsYear}, ${h.num(C.nOnline)} of the ${h.num(C.nOffer)} degree-granting colleges with a certificate in one of them offered it fully online, and ${h.num(A.nOnline)} of ${h.num(A.nOffer)} did so for the associate degree in those fields. Since the work is done at a screen, few programs need a lab; a practicum may still be asked. At the public colleges with a fully online certificate, mostly community colleges, the median price for residents is ${h.m(C.med.pub ?? 0)} a credit, against ${h.m(C.med.fp ?? 0)} at for-profit schools.`;
  },
  faqs: (h) => [
    { q: 'How much does a medical coding certificate cost online?', a: `At the median public college with one online, ${h.m(C.med.pub ?? 0)} a credit for residents, a 30-credit certificate comes to about ${h.m((C.med.pub ?? 0) * 30)} in tuition. At the for-profit median, about ${h.m((C.med.fp ?? 0) * 30)}. Add books, coding manuals or software access and the certification exam fee.` },
    { q: 'Certificate or associate degree for billing and coding?', a: 'A certificate prepares for entry-level coding or billing jobs and the most common coding exams. The associate degree in health information technology is longer, adds general education and covers records management; some credential exams ask for an accredited program of that kind. Both can be completed fully online at many colleges.' },
    { q: 'Can I do medical billing and coding from home after the program?', a: 'Many coders work remotely, but employers often ask for a credential and some experience first. A program with a practicum or an employer partnership can help with that first job. Ask the college for its placement figures rather than relying on general job ads.' },
  ],
  body: (h) => `
<h2>Medical billing and coding online programs at each level</h2>
${levelTable(h, 'coding', `Colleges with a program in medical coding, medical billing or health information technology (CIP 51.0713, 51.0714, 51.0707) completable entirely online, against all colleges offering it, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}); median per-credit charge of ${h.P.ipeds.chargesYear} at those colleges, fees not included.`)}
<p>Bachelor’s programs in the field are few in the federal count; health information management at the bachelor’s level is classed under another code (51.0706) and is not included here.</p>
<h2>Lowest prices for an online coding certificate</h2>
<p>Price per credit plus the yearly required fees spread over 30 credits, for state residents, lowest first:</p>
${cheapestTable(h, 'coding', 'cert', 12, 'Coding, billing or health information certificate completable entirely online; the college’s general undergraduate charge.')}
<p>A resident of another state pays the out-of-state column. Most of these colleges are community colleges; the cheapest one for you is usually in your own state.</p>
<h2>States with the most online coding programs</h2>
${statesTable(h, 'coding', 'cert', 15, 'Colleges with a coding, billing or health information certificate completable entirely online, by state, and the lowest resident price at a public one, fees included.')}
<h2>Colleges with several online options</h2>
<p>Some colleges offer separate certificates in coding, billing and health information, all online. Sorted by the number of such programs, then by online enrollment:</p>
${mostTable(h, 'coding', 'cert', 8, 'Certificates in the three codes completable entirely online, counted per college.')}
<h2>Certificate or associate degree, priced</h2>
<p>With the medians of the colleges offering them fully online: a 30-credit coding certificate at a public college costs a resident about ${h.m(30 * (lvl('coding', 'cert').med.pub ?? 0))} in tuition, and a 60-credit associate degree in health information about ${h.m(60 * (lvl('coding', 'assoc').med.pub ?? 0))}. At for-profit schools, the same credits come to about ${h.m(30 * (lvl('coding', 'cert').med.fp ?? 0))} and ${h.m(60 * (lvl('coding', 'assoc').med.fp ?? 0))}. Credits from a certificate often count toward the associate degree at the same college, so starting short does not waste them.</p>
<p>Online students in this field are often adults changing careers while working. Taking two courses a term, a certificate takes about a year and an associate degree two to three years; the calculator shows the time at the pace you type under “More details”.</p>
<h2>Where the federal count stops</h2>
<p>The count covers degree-granting colleges that take federal student aid. Short coding courses sold by training companies, professional associations or schools that award no degree are outside it, and so are programs that changed after ${h.P.programs.completionsYear}. Those courses can be cheaper, but they rarely carry college credit and are not eligible for federal grants. Check what a course leads to, and whether a college will accept it for credit later, before comparing its price with a college certificate.</p>
<h2>What to check in a coding program</h2>
<p><strong>Program accreditation.</strong> Health information technology associate programs can hold their own accreditation, which some credential exams ask for; the college names it. <strong>Which exam it prepares for.</strong> Coding credentials come from private certification bodies with their own rules and fees. <strong>The total.</strong> Type the program’s credits and price into the calculator above; ads quoting a low monthly payment hide the total.</p>
`,
});
