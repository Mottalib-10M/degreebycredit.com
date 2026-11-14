import { definePage } from '../../lib/guide-types';
import { formatMoney, formatNumber } from '../../lib/format';
import { cheapestTable, statesTable, mostTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const M = lvl('healthadmin', 'mast');

export default definePage({
  id: 'masters-in-healthcare-administration',
  group: 'program',
  order: 25,
  tool: { kind: 'mini:prog-healthadmin' },
  related: ['online-mba-programs', 'online-nursing-programs', 'online-masters-degree', 'online-phd-programs', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'scorecard_data'],
  slug: 'masters-in-healthcare-administration',
  nav: 'Masters in healthcare administration',
  card: 'MHA and health care management master’s you can finish online: how many universities, their graduate price per credit and the lowest.',
  title: 'Masters in Healthcare Administration 2026: Online Cost',
  description: 'Masters in healthcare administration you can finish online, from federal IPEDS data: universities, graduate price per credit by type and state, lowest first.',
  h1: 'Masters in healthcare administration: the universities with an online MHA, and its graduate price',
  intro: `Masters in healthcare administration are mostly online already: ${formatNumber(M.nOnline, 0)} of the ${formatNumber(M.nOffer, 0)} universities that award one report a program completable at a distance. Public ones charge residents a median of ${$(M.med.pub)} a graduate credit. Choose your state and type of school.`,
  resume: (h) => `The master’s in health care administration, often called the MHA, prepares managers of hospitals, clinics and health systems. In the federal program file it sits under CIP codes 51.0701, health and health care administration and management, and 51.0702, hospital and health care facilities administration. For ${h.P.programs.completionsYear}, ${h.num(M.nOffer)} universities awarded a master’s in those fields and ${h.num(M.nOnline)} of them, ${h.pc(M.nOnline / M.nOffer, 0)}, reported a program that can be completed entirely online, one of the highest shares of any field on this site. Their graduate price per credit, as reported for ${h.P.ipeds.chargesYear}, has a median of ${h.m(M.med.pub ?? 0)} at public universities for residents, ${h.m(M.med.pubOut ?? 0)} for students from other states, ${h.m(M.med.npf ?? 0)} at private nonprofit universities and ${h.m(M.med.fp ?? 0)} at for-profit ones. Many working nurses and clinic staff take it part time: a program of 36 to 50 credits then lasts two to three years.`,
  faqs: (h) => [
    { q: 'How much does an online MHA cost?', a: `At the median graduate charge of public universities with an online program, ${h.m(M.med.pub ?? 0)} a credit for residents, a 42-credit MHA costs about ${h.m((M.med.pub ?? 0) * 42)} before fees. At the private nonprofit median it is about ${h.m((M.med.npf ?? 0) * 42)}. Type the program’s own credits and price in the calculator.` },
    { q: 'MHA or MBA in health care: which costs less?', a: 'The price per credit depends on the university, not on the name of the degree, but MBAs often ask for more credits. Compare the number of credits on each program sheet and type both into the calculator. The MBA page lists universities with an online business master’s.' },
    { q: 'Do I need health care experience for an MHA?', a: 'Some programs admit students straight from a bachelor’s; others, often called executive programs, ask for years of work in health care. The admission page says which. Experience can also shorten the program when it waives an internship or a practicum.' },
  ],
  body: (h) => {
    const Bh = lvl('healthadmin', 'bach'), Dh = lvl('healthadmin', 'docr');
    return `
<h2>Masters in healthcare administration at the lowest graduate price</h2>
<p>Graduate price per credit for state residents, lowest first, among universities whose master’s in health care administration can be completed fully online. Several are public health science centers in Texas and Oklahoma.</p>
${cheapestTable(h, 'healthadmin', 'mast', 15, `Master’s in health care administration or hospital administration (CIP 51.0701, 51.0702) completable entirely online, ${h.P.programs.completionsYear}; graduate charge ${h.P.ipeds.chargesYear}, the university’s general rate.`)}
<p>The general graduate rate is where the program price starts. Some health administration programs carry their own tuition, often higher, and executive formats with campus residencies add travel.</p>
<h2>Online MHA programs by state</h2>
${statesTable(h, 'healthadmin', 'mast', 15, 'Universities in each state with an online master’s in health care administration, and the lowest graduate price for residents at a public one.')}
<h2>Before and after the master’s</h2>
<p>A bachelor’s in health care administration can also be finished online at ${h.num(Bh.nOnline)} colleges, with a public median of ${h.m(Bh.med.pub ?? 0)} a credit for residents. Above the master’s, ${h.num(Dh.nOnline)} universities report a research doctorate in the field that can be completed at a distance.</p>
${mostTable(h, 'healthadmin', 'bach', 8, 'Colleges with a bachelor’s in health care administration completable entirely online, sorted by the number of such programs, then online enrollment. Price with fees spread over 30 credits.')}
<h2>The master’s priced three ways</h2>
<p>Take a 42-credit program. At the median graduate charge of public universities with an online master’s in the field, a resident pays about ${h.m(42 * (lvl('healthadmin', 'mast').med.pub ?? 0))} in tuition; a student from another state, at the out-of-state median, about ${h.m(42 * (lvl('healthadmin', 'mast').med.pubOut ?? 0))}; at the private nonprofit median, about ${h.m(42 * (lvl('healthadmin', 'mast').med.npf ?? 0))}. The gap between a public program at home and one elsewhere is often wider than the gap between public and private.</p>
<p>Employer help changes the picture for those already working in health care: hospitals and health systems often repay part of a management degree each year. Type the yearly amount in the calculator; it comes off the total.</p>
<p>Federal loans are open to graduate students who file the FAFSA, but Pell Grants are not. Scholarships from the university and from professional associations are the other common grants at this level. Ask each program for its scholarship deadline: many fall months before the term begins.</p>
<h2>How to compare two programs</h2>
<p><strong>Credits.</strong> Programs range from about 36 to more than 50 credits, so the cheaper price per credit is not always the cheaper degree.</p>
<p><strong>Accreditation.</strong> Every university here is accredited, since it takes federal aid. Some health administration programs also hold a program accreditation; the school names it.</p>
<p><strong>Practicum.</strong> Some programs require a supervised placement in a health organization. Working in health care may count toward it, which saves a term; ask before you enroll.</p>
<p>This page sorts by price and by number of programs, two rules anyone can check against the federal files. It does not rank programs or name one as the right choice for you.</p>
`;
  },
});
