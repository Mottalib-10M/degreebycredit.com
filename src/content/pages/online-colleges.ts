import { definePage } from '../../lib/guide-types';
import { PROGRAMS, stateName } from '../../lib/data';
import { formatNumber } from '../../lib/format';
import { levelTable } from '../../lib/prog-tables';

const A = PROGRAMS.all;

export default definePage({
  id: 'online-colleges',
  group: 'program',
  order: 1,
  tool: { kind: 'mini:prog-all' },
  related: ['online-colleges-by-state', 'largest-online-universities', 'online-nursing-programs', 'online-mba-programs', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'ipeds_hd', 'scorecard_data'],
  slug: 'online-colleges',
  nav: 'Online colleges',
  card: 'The colleges where at least one program can be finished online, the ones with the most online programs, and their prices.',
  title: 'Online Colleges 2026: Who Offers Programs Fully Online',
  description: 'Online colleges counted from federal IPEDS data: how many let you finish a program online, the colleges with the most online programs and their price a credit.',
  h1: 'Online colleges: the schools where a whole program can be finished online, and what they charge',
  intro: `Online colleges are most colleges now: ${formatNumber(A.nAnyOnline, 0)} of the ${formatNumber(A.nAny, 0)} degree-granting colleges that take federal aid report at least one program you can complete fully online. Pick a level, your state and a type of school to price a program at the colleges that offer it.`,
  resume: (h) => `A college counts here when it told the Department of Education that at least one of its programs can be completed entirely through distance education. In the ${h.P.programs.completionsYear} program file, that is ${h.num(A.nAnyOnline)} of the ${h.num(A.nAny)} degree-granting colleges in this site’s federal list, ${h.pc(A.nAnyOnline / A.nAny, 0)}. Together they report ${h.num(A.programsOnline)} programs completable online, ${h.pc(A.programsOnline / A.programs, 0)} of the ${h.num(A.programs)} programs counted across all fields and levels. The online offer is wide but uneven: master’s degrees are the most often online, while first degrees that need labs or clinical hours, such as a first nursing degree, mostly stay on campus. A handful of colleges put hundreds of programs online; most offer a few. Price follows the college, not the format: public colleges charge their own residents much less than everyone else, so the first place to look is a public college in your state.`,
  faqs: (h) => [
    { q: 'How many colleges offer online programs?', a: `${h.num(A.nAnyOnline)} of the ${h.num(A.nAny)} degree-granting colleges that take federal aid reported at least one program completable entirely online for ${h.P.programs.completionsYear}. Many more teach some online courses: the figure here counts only programs a student can finish without coming to campus.` },
    { q: 'Are online colleges cheaper than campus colleges?', a: 'Usually not per credit: most colleges charge one price whatever the format, and some add an online fee. The saving is in housing, moving and keeping a job. A public college in your own state is generally the lowest price, online or not.' },
    { q: 'How do I know a program is really fully online?', a: 'Ask the college whether every course, exam and requirement can be done at a distance, and whether there are residencies, labs or placements. The federal file counts a program as online when it can be completed at a distance; your own constraints decide whether that fits.' },
  ],
  body: (h) => {
    const top = A.top.slice(0, 15).map((c) => [h.B.name(c.n), c.st, ['public', 'nonprofit', 'for-profit'][c.ctrl - 1] ?? '', `${h.num(c.k)} of ${h.num(c.p)}`, c.h2 ? h.m(c.h2) : 'n/a', c.h6 ? h.m(c.h6) : 'n/a']);
    const st = Object.entries(A.byState).sort((a, b) => b[1][0] - a[1][0]).slice(0, 15).map(([s, [n, k]]) => [stateName(s), h.num(n), h.num(k)]);
    return `
<h2>Online colleges by level of program</h2>
<p>For each level, the number of colleges with at least one program completable fully online against all colleges awarding that level, and the median price per credit at those online colleges.</p>
${levelTable(h, 'all', `All fields, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}); undergraduate per-credit charge for certificates, associate and bachelor’s degrees, graduate charge for master’s and doctorates, ${h.P.ipeds.chargesYear}. Fees not included.`)}
<h2>The colleges with the most programs online</h2>
<p>Sorted by the number of programs the college reports as completable entirely at a distance. The count is per field and level, as reported, so a college with many specialties counts each one. It measures the size of the online catalog, not its quality.</p>
${h.table(['College', 'State', 'Type', 'Programs online, of all', 'Undergraduate per credit', 'Graduate per credit'], top, `Programs completable entirely via distance education, ${h.P.programs.completionsYear}; resident per-credit charges, ${h.P.ipeds.chargesYear} (IPEDS).`, ['l', 'l', 'l', 'r', 'r', 'r'])}
<p>The list mixes large online universities with public universities that moved much of their catalog online. Students in any state can enroll at most of them, at the out-of-state price unless the college has one online rate for all.</p>
<h2>States with the most online colleges</h2>
${h.table(['State', 'Colleges with a program online', 'Programs online'], st, 'Colleges located in the state; their online students may live anywhere.', ['l', 'r', 'r'])}
<p>The ${h.a('online-colleges-by-state', 'state page')} adds the price per credit, enrollment and results for all fifty states and the District of Columbia.</p>
<h2>Three ways to read the count</h2>
<p><strong>A program, not a course.</strong> Nearly every college now teaches some courses online. The count on this page is stricter: the college must report that a student can complete the whole program at a distance. A college with hundreds of online courses but no program finishable online is not counted.</p>
<p><strong>Per field and level.</strong> The federal file reports programs by field code and award level. A college with an online bachelor’s in business and an online master’s in business counts two programs; a college with three business specialties under one code may count one or three, depending on how it reports.</p>
<p><strong>What the college declared.</strong> The figures are those each college reported for ${h.P.programs.completionsYear}, a provisional release. Programs open or close every year, and some colleges in the file have since merged or closed. The college’s catalog for the current year is the final word.</p>
<h2>Price at the colleges with online programs</h2>
<p>The table at the top gives the median price per credit, level by level, at the colleges with an online program of that level. Two numbers stand out. A public college charges its own residents roughly half what it charges students from other states. And for-profit colleges, often seen as the expensive choice, have a lower median per credit than private nonprofit ones at every level; their award rates, on the ${h.a('online-college-graduation-rates', 'graduation rates page')}, belong in the same comparison.</p>
<h2>Find the online program you need</h2>
<p>The field pages count the colleges that let you finish a given program online and give their prices: ${h.a('online-nursing-programs', 'nursing')}, ${h.a('online-mba-programs', 'MBA')}, ${h.a('online-accounting-degree', 'accounting')}, ${h.a('masters-in-healthcare-administration', 'healthcare administration')}, ${h.a('online-phd-programs', 'doctorates')}, ${h.a('online-law-school', 'law')}, ${h.a('online-medical-assistant-programs', 'medical assistant')} and ${h.a('medical-billing-and-coding-online-programs', 'medical billing and coding')}. For price alone, the ${h.a('cheapest-online-colleges', 'cheapest online colleges')} page lists the lowest resident prices in each state.</p>
`;
  },
});
