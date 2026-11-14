import { definePage } from '../../lib/guide-types';
import { PROGRAMS } from '../../lib/data';
import { formatMoney, formatNumber } from '../../lib/format';
import { levelTable, cheapestTable, mostTable, statesTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const B = lvl('nursing', 'bach');

export default definePage({
  id: 'online-nursing-programs',
  group: 'program',
  order: 5,
  tool: { kind: 'mini:prog-nursing' },
  related: ['masters-in-healthcare-administration', 'online-medical-assistant-programs', 'online-masters-degree', 'online-colleges-that-accept-fafsa', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'scorecard_data'],
  slug: 'online-nursing-programs',
  nav: 'Online nursing programs',
  card: 'RN to BSN, MSN and DNP programs a college reports as completable online, with its price per credit, state by state.',
  title: 'Online Nursing Programs 2026: RN to BSN, MSN, DNP Prices',
  description: 'Online nursing programs counted from the federal IPEDS file: which colleges let you finish a BSN, MSN or DNP online, and their price per credit by state.',
  h1: 'Online nursing programs: where to finish a BSN, MSN or DNP online, and the price',
  intro: `Online nursing programs are mostly for nurses who already hold a license: ${formatNumber(B.nOnline, 0)} colleges report a nursing bachelor’s that can be completed fully online, most of them RN to BSN. Public ones charge residents a median of ${$(B.med.pub)} a credit.`,
  resume: (h) => {
    const A = lvl('nursing', 'assoc'), M = lvl('nursing', 'mast'), D = lvl('nursing', 'docp');
    return `Every college that takes federal student aid tells the Department of Education, field by field and level by level, how many of its programs can be completed entirely through distance education. In the ${h.P.programs.completionsYear} file, ${h.num(B.nOnline)} of the ${h.num(B.nOffer)} colleges with a bachelor’s in nursing (CIP series 51.38) offered at least one that can be finished online, ${h.num(M.nOnline)} of ${h.num(M.nOffer)} did so for the master’s and ${h.num(D.nOnline)} of ${h.num(D.nOffer)} for the professional doctorate, the DNP. The associate degree is the exception: only ${h.num(A.nOnline)} of ${h.num(A.nOffer)} colleges report one completable at a distance, because a first nursing degree leads to the NCLEX licensing exam and requires supervised clinical hours. So the online route is for nurses who already hold a license: RN to BSN, then MSN and DNP. At the colleges offering the bachelor’s online, the median public price for residents is ${h.m(B.med.pub ?? 0)} a credit and the private nonprofit median ${h.m(B.med.npf ?? 0)}.`;
  },
  faqs: (h) => [
    { q: 'Can I become a registered nurse entirely online?', a: `No. A first nursing degree must include clinical hours in a hospital or clinic under supervision, and the state board of nursing approves the program before graduates sit the NCLEX. An associate program reported as online can move the classroom part to a distance, but the clinical hours stay in person.` },
    { q: 'How much does an online RN to BSN cost?', a: `It depends on how many credits the school accepts from your nursing diploma or associate degree. At the median public price of ${h.m(B.med.pub ?? 0)} a credit for residents, 30 nursing credits cost about ${h.m((B.med.pub ?? 0) * 30)} and 60 credits about ${h.m((B.med.pub ?? 0) * 60)}, before fees. Type your own credits in the calculator.` },
    { q: 'Is the price per credit shown the nursing program’s price?', a: 'It is the college’s general undergraduate or graduate charge reported to IPEDS. Many nursing schools add a program fee, a clinical fee or a separate online rate. Read the nursing program’s tuition page and type its price in the calculator with “I know my school’s price”.' },
    { q: 'Do online nursing programs accept students from every state?', a: 'Not always. A college must be authorized to enroll students from your state, and programs with clinical work must also meet your state board of nursing’s rules. Many programs list the states they cannot accept on their admission page: check it before you apply.' },
  ],
  body: (h) => {
    const M = lvl('nursing', 'mast');
    return `
<h2>Online nursing programs at each level</h2>
<p>The first column counts the colleges that offer the level fully online against all colleges offering the level in nursing; the next four give the median price per credit at those online colleges, by type.</p>
${levelTable(h, 'nursing', `Colleges with a nursing program (CIP 51.38) that can be completed entirely via distance education, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}); per-credit charges ${h.P.ipeds.chargesYear} (IPEDS ${h.P.ipeds.chargesFile}). Fees not included.`, { assoc: 'Associate (ADN)', bach: 'Bachelor’s (BSN)', mast: 'Master’s (MSN)', docp: 'Doctorate (DNP)' })}
<p>Graduate nursing is where online study is most common: ${h.pc(lvl('nursing', 'mast').nOnline / lvl('nursing', 'mast').nOffer, 0)} of the colleges with an MSN let you finish one at a distance. Clinical practice hours for nurse practitioner tracks are still done in person, often near home with a preceptor you help find.</p>
<h2>Lowest prices for an online BSN</h2>
<p>Sorted by the price per credit plus the yearly required fees spread over 30 credits, for state residents, among public colleges offering the nursing bachelor’s fully online. Many are Florida state colleges and community colleges allowed to grant a bachelor’s to working nurses.</p>
${cheapestTable(h, 'nursing', 'bach', 12, 'Public colleges offering a nursing bachelor’s that can be completed fully online, lowest resident price first. The college’s general undergraduate charge, not a nursing fee.', true)}
<p>Residents pay these prices; students from another state pay the second column, which can be twice as much. An RN to BSN counts much of your earlier nursing degree, so the credits left to pay for, which the school sets when it reviews your transcript, matter as much as the price per credit.</p>
<h2>States with the most online BSN programs</h2>
${statesTable(h, 'nursing', 'bach', 15, 'Colleges in each state with a nursing bachelor’s that can be completed fully online, and the lowest public resident price there, fees included.')}
<h2>Online MSN and DNP: the colleges with the most tracks</h2>
<p>A college can offer several nursing master’s programs online (education, leadership, family nurse practitioner). Sorted by the number of programs the college reports as completable online, then by its online enrollment:</p>
${mostTable(h, 'nursing', 'mast', 10, `Master’s programs in nursing (CIP 51.38) completable entirely online, by college, ${h.P.programs.completionsYear}. Graduate per-credit charge for residents; award rate from College Scorecard.`)}
<p>At the ${h.num(M.nOnline)} colleges with an online MSN, the median graduate charge is ${h.m(M.med.pub ?? 0)} a credit at public universities for residents and ${h.m(M.med.npf ?? 0)} at private nonprofit ones. An MSN asks for 30 to 50 credits depending on the track; the calculator above takes your number.</p>
<p>For a nurse already working, the total also depends on the employer: many hospitals repay part of a BSN or MSN each year. Type that amount in the calculator under grants or employer help; it comes off the tuition before anything else.</p>
<h2>What the federal file does not say</h2>
<p>IPEDS counts programs, not their accreditation by a nursing accreditor, their NCLEX pass rates or the clinical placements they arrange. Your state board of nursing lists the approved pre-licensure programs, and the nursing school’s own pages give the accreditor of each degree. The file also counts a program as online when it can be completed at a distance, even if some students choose campus classes. Read every figure here as a starting point for your own checks, not a ranking.</p>
`;
  },
});
