import { definePage } from '../../lib/guide-types';
import { PROGRAMS } from '../../lib/data';
import { formatMoney, formatNumber } from '../../lib/format';
import { cheapestTable, mostTable, statesTable, lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const R = lvl('phd', 'docr');
// Titles of the two-digit series of the Classification of Instructional Programs (CIP 2020, NCES).
const CIP2: Record<string, string> = {
  '13': 'Education', '51': 'Health professions', '52': 'Business and management', '42': 'Psychology', '39': 'Theology and religious vocations',
  '14': 'Engineering', '11': 'Computer and information sciences', '44': 'Public administration and social service', '30': 'Multi/interdisciplinary studies',
  '26': 'Biological and biomedical sciences', '45': 'Social sciences', '43': 'Homeland security, law enforcement, firefighting', '40': 'Physical sciences', '38': 'Philosophy and religious studies',
};

export default definePage({
  id: 'online-phd-programs',
  group: 'program',
  order: 35,
  tool: { kind: 'mini:prog-phd' },
  related: ['online-masters-degree', 'masters-in-healthcare-administration', 'online-law-school', 'cost-per-credit-hour', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'nces_cip', 'scorecard_data'],
  slug: 'online-phd-programs',
  nav: 'Online PhD programs',
  card: 'Research doctorates universities report as completable online, by field, with the graduate price per credit and the lowest ones.',
  title: 'Online PhD Programs 2026: Fields, Universities and Cost',
  description: 'Online PhD programs in federal IPEDS data: universities with a research doctorate you can finish at a distance, the fields, and the graduate price per credit.',
  h1: 'Online PhD programs: doctorates you can finish at a distance, by field and price',
  intro: `Online PhD programs are offered by ${formatNumber(R.nOnline, 0)} universities that report a research doctorate completable at a distance, ${formatNumber(PROGRAMS.phd.families.find((f) => f[0] === '13')?.[1] ?? 0, 0)} of them in education. Public ones charge residents a median of ${$(R.med.pub)} a graduate credit.`,
  resume: (h) => `IPEDS calls the PhD and similar degrees, such as the EdD when a university classes it that way, the doctor’s degree for research or scholarship. In ${h.P.programs.completionsYear}, ${h.num(R.nOffer)} universities awarded one and ${h.num(R.nOnline)} of them reported at least one program that can be completed entirely through distance education, ${h.num(R.nPrograms)} programs in all. The online doctorate is concentrated: education comes first by far, then the health professions, business, psychology and theology, fields where many students are working professionals. Laboratory sciences are rare. The graduate price per credit those universities reported for ${h.P.ipeds.chargesYear} has a median of ${h.m(R.med.pub ?? 0)} at public universities for residents, ${h.m(R.med.pubOut ?? 0)} for students from other states, ${h.m(R.med.npf ?? 0)} at private nonprofit universities and ${h.m(R.med.fp ?? 0)} at for-profit ones. Campus PhD students in research fields are often funded by assistantships; online doctoral students usually pay their own way.`,
  faqs: (h) => [
    { q: 'How much does an online PhD cost?', a: `At the median graduate charge of public universities with an online doctorate, ${h.m(R.med.pub ?? 0)} a credit for residents, 60 credits come to about ${h.m((R.med.pub ?? 0) * 60)} before fees. The private nonprofit median gives about ${h.m((R.med.npf ?? 0) * 60)}. Extra terms spent on the dissertation add to the bill.` },
    { q: 'How long does an online doctorate take?', a: 'Coursework often takes two to three years part time, then the dissertation or final project takes one to several more. Many programs charge a fee or a minimum of credits each term until you defend, so the time to finish matters as much as the price per credit.' },
    { q: 'Is an online PhD the same degree as a campus PhD?', a: 'Universities usually award the same degree whatever the format. What differs is the program: some online doctorates are designed for practitioners and end with an applied project, while research PhDs end with a dissertation. Read the program’s outcomes and ask about residencies on campus.' },
  ],
  body: (h) => {
    const fam = PROGRAMS.phd.families.slice(0, 12).map(([k, n]) => [CIP2[k] ?? `CIP series ${k}`, h.num(n)]);
    return `
<h2>Online PhD programs by field</h2>
<p>Number of universities with at least one research doctorate in the field that can be completed fully online. A university with doctorates in several fields counts once in each.</p>
${h.table(['Field (CIP series)', 'Universities'], fam, `Research or scholarship doctorates completable entirely via distance education, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}), grouped by two-digit CIP 2020 series.`, ['l', 'r'])}
<h2>Lowest graduate prices for an online doctorate</h2>
<p>Graduate price per credit for state residents, lowest first, among universities offering any research doctorate fully online. The charge is the university’s general graduate rate; a doctoral program can be billed differently.</p>
${cheapestTable(h, 'phd', 'docr', 12, `Graduate per-credit charge, ${h.P.ipeds.chargesYear} (IPEDS ${h.P.ipeds.chargesFile}). Universities with a research doctorate completable entirely online.`)}
<h2>Universities with the most online doctorates</h2>
<p>Sorted by the number of research doctorate programs the university reports as completable at a distance, then by online enrollment. Size of the catalog is not a measure of quality.</p>
${mostTable(h, 'phd', 'docr', 10, 'Research doctorate programs completable entirely online, by university, as reported to IPEDS. Award rate: all entering students of the university, not doctoral students.')}
<h2>Where the online doctoral programs are</h2>
${statesTable(h, 'phd', 'docr', 12, 'Universities in each state with a research doctorate completable entirely online, and the lowest graduate price for residents at a public one.')}
<h2>What 60 credits cost, by type of university</h2>
<p>Sixty credits is a round starting value; programs range from about 45 credits after a master’s to more than 90 from a bachelor’s. At the medians above, 60 graduate credits cost a resident about ${h.m(60 * (R.med.pub ?? 0))} at a public university, about ${h.m(60 * (R.med.pubOut ?? 0))} at a public university in another state, ${h.m(60 * (R.med.npf ?? 0))} at a private nonprofit one and ${h.m(60 * (R.med.fp ?? 0))} at a for-profit one.</p>
<p>The total depends on time as much as on credits. A student who needs two extra terms for the dissertation pays continuing enrollment for both, and some programs charge a minimum number of credits each term until the defense. Ask for the median time to degree of recent graduates and multiply.</p>
<h2>Online doctorates for practitioners</h2>
<p>A large share of the programs counted here are aimed at people who keep working: doctorates in education for school and college leaders, in nursing practice, in business administration or in psychology. Their final project often answers a problem of the student’s own workplace. Research PhDs that prepare for academic careers are rarer online, since they rely on labs, teaching assistantships and daily contact with a research group.</p>
<p>The professional doctorates in nursing and law have their own pages: the ${h.a('online-nursing-programs', 'nursing page')} covers the DNP and the ${h.a('online-law-school', 'law school page')} the JD.</p>
<h2>Questions to ask before you apply</h2>
<p><strong>Who supervises the dissertation?</strong> Ask how advisors are assigned and how often you meet. <strong>Are there residencies?</strong> Many online doctorates hold a few days on campus each year. <strong>What does a term cost after coursework?</strong> Continuing enrollment fees during the dissertation are often missing from the advertised total. <strong>Is there funding?</strong> A few online programs offer assistantships or tuition discounts for employees of partner organizations.</p>
`;
  },
});
