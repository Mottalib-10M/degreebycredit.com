import { definePage } from '../../lib/guide-types';
import { FEATURED } from '../../lib/data';
import { formatNumber } from '../../lib/format';

const top = FEATURED[0];

export default definePage({
  id: 'largest-online-universities',
  group: 'choose',
  order: 240,
  tool: { kind: 'mini:school-compare' },
  related: ['online-college-graduation-rates', 'online-colleges-that-accept-fafsa', 'online-bachelors-degree', 'accredited-online-colleges', 'home'],
  sources: ['ipeds_ef_dist', 'ipeds_ic_ay', 'scorecard_data', 'ipeds_navigator'],
  slug: 'largest-online-universities',
  nav: 'Largest online universities',
  card: 'The twenty schools with the most fully online students: price, sector, results, and any two compared.',
  title: 'Largest Online Universities 2026: Price and Results Compared',
  description: 'Largest online universities by fully online students in the federal enrollment file: price per credit or flat rate, sector, share who finish and a calculator.',
  h1: 'Largest online universities: twenty schools, their prices and their results',
  intro: `The largest online universities teach tens of thousands of students each at a distance: ${top ? `${top.n} alone reported ${formatNumber(top.exc ?? 0, 0)} fully online students` : ''} in fall 2023. Pick any two of the twenty largest below to compare their price for your credits.`,
  resume: (h) => {
    const sum = h.D.FEATURED.reduce((a, f) => a + (f.exc ?? 0), 0);
    const fp = h.D.FEATURED.filter((f) => f.ctrl === 3).length, np = h.D.FEATURED.filter((f) => f.ctrl === 2).length, pub = h.D.FEATURED.filter((f) => f.ctrl === 1).length;
    return `Online study is concentrated. The twenty institutions with the most students enrolled exclusively in distance education in ${h.P.ipeds.enrollmentTerm} taught ${h.num(sum)} of them, about ${h.pc(sum / h.N.exc, 0)} of all fully online students in the country. ${pub} are public, ${np} private nonprofit and ${fp} private for-profit. They price their degrees in two ways: most charge per credit, while a few charge one flat price per term, whatever the number of courses. They also differ in results: the share of entering students who earned an award within eight years runs from ${h.pc(Math.min(...h.D.FEATURED.map((f) => f.om8 ?? 1)), 0)} to ${h.pc(Math.max(...h.D.FEATURED.map((f) => f.om8 ?? 0)), 0)} among them. Size is a sign of a well-oiled admissions and support machine, not of price or quality; the table and the calculator let you judge them on their figures.`;
  },
  faqs: (h) => [
    { q: 'What is the largest online university in the United States?', a: `By students enrolled exclusively online in ${h.P.ipeds.enrollmentTerm}, ${h.B.name(h.D.FEATURED[0].n)}, with ${h.num(h.D.FEATURED[0].exc ?? 0)}, followed by ${h.B.name(h.D.FEATURED[1].n)} with ${h.num(h.D.FEATURED[1].exc ?? 0)}. Counts come from the IPEDS fall enrollment survey and include both undergraduate and graduate students taking every course at a distance.` },
    { q: 'Are the largest online universities for-profit?', a: 'Some are, many are not. The list mixes private nonprofit universities, public universities with large online arms, a few community college systems and for-profit companies. The sector of each school is in the table; it changes how the school is governed, not whether it takes federal aid.' },
    { q: 'How does a flat-rate online university compare with per-credit ones?', a: 'A flat-rate school charges one price per term for as many courses as you complete, so its cost per credit falls the faster you go. The calculator counts it at 30 credits a year. If you expect to take fewer, its real cost per credit will be higher than the table suggests.' },
  ],
  body: (h) => {
    const rows = h.D.FEATURED.map((f) => [`${h.B.name(f.n)}<br><span class="text-xs text-navy-600">${f.st}, ${h.E.SECTOR_LABEL[f.ctrl] ?? ''}</span>`, f.exc ?? 0, f.share != null ? h.pc(f.share, 0) : 'n/a', f.h2 ? `${h.m(f.h2)} a credit` : `${h.m(f.t2 ?? 0)} a year, same price whatever the credits`, f.om8 != null ? h.pc(f.om8, 0) : 'n/a']);
    const a = h.D.FEATURED[0], b = h.D.FEATURED[1];
    const pubs = h.D.FEATURED.filter((f) => f.ctrl === 1 && f.lvl === 1).slice(0, 6);
    return `
<h2>The twenty largest online universities</h2>
${h.table(['School', 'Fully online students', 'Share of its students', 'Price reported', 'Finished within 8 years'], rows, `IPEDS: enrollment ${h.P.ipeds.enrollmentTerm}, charges ${h.P.ipeds.chargesYear} (in-state per-credit charge, or full-time yearly tuition when none is reported). College Scorecard: share who finished within 8 years, ${h.P.scorecard.awardCohort} entering class. Names as listed in the federal directory.`, ['l', 'r', 'r', 'r', 'r'])}
<p>A few names need a word. Several schools are listed under the campus that reports for the whole online operation, which is why a city appears in their name. Two Texas community college systems appear because their online enrollment is very large, though most of their students are not fully online, as the share column shows. A university that teaches many graduate students online, such as a technology institute, shows a high share of finishers partly because graduate students finish more often.</p>
<h2>Price and results, read together</h2>
<p>Use the calculator to set two schools side by side for your number of credits: it adds a year of fees for each 30 credits, and gives each school’s share of students who finished within 8 years. Then check the ${h.a('online-college-graduation-rates', 'graduation rates page')} for full-time and part-time figures, and the ${h.a('online-colleges-that-accept-fafsa', 'federal aid page')} for Pell shares and debt.</p>
<p>Each school’s own figures, programs and address are on the federal ${h.src('ipeds_navigator', 'College Navigator')}.</p><h2>Flat rate or per credit: a worked comparison</h2>
<p>For 120 credits at 30 credits a year, ${h.B.name(a.n)} comes to about ${h.m(h.B.schoolCost(a, 120).total)} with fees, ${a.h2 ? `at ${h.m(a.h2)} a credit` : `at its flat ${h.m(a.t2 ?? 0)} a year`}, and ${h.B.name(b.n)} to about ${h.m(h.B.schoolCost(b, 120).total)}, ${b.h2 ? `at ${h.m(b.h2)} a credit` : `at its flat ${h.m(b.t2 ?? 0)} a year`}. A student who completes more than 30 credits a year at a flat-rate school pays less than shown; one who completes fewer pays more, since each term costs the same.</p>
<h2>Public universities with large online arms</h2>
<p>Several states run online universities or online campuses of their public systems. They price credits for residents and non-residents, sometimes with one rate for both:</p>
<ul>${pubs.map((f) => `<li><strong>${h.B.name(f.n)}</strong> (${f.st}): ${f.h2 ? `${h.m(f.h2)} a credit for residents, ${h.m(f.h3 ?? f.h2)} from another state` : 'flat price, no per-credit charge reported'}.</li>`).join('')}</ul>
<p>For a resident of the state, a public online university is often the lowest price among the large schools. For everyone else, compare its out-of-state rate with the private universities in the table.</p>
<p>Whatever the school, ask for its price for your residence and your program in writing before you enroll, along with the fees per term and the number of credits it will accept from you. Those three answers turn the figures on this page into your own budget.</p>
`;
  },
});
