import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatNumber } from '../../lib/format';

export default definePage({
  id: 'accredited-online-colleges',
  group: 'choose',
  order: 200,
  tool: { kind: 'mini:transfer' },
  lookup: true,
  related: ['online-colleges-that-accept-fafsa', 'online-bachelors-degree', 'largest-online-universities', 'online-college-graduation-rates', 'home'],
  sources: ['scorecard_data', 'scorecard_dict', 'ipeds_hd', 'studentaid_school'],
  slug: 'accredited-online-colleges',
  nav: 'Accredited online colleges',
  card: 'Which agencies accredit the colleges with online students, how to check one, and what your transfer credits are worth.',
  title: 'Accredited Online Colleges 2026: Accreditors and Transfer',
  description: 'Accredited online colleges: which agencies accredit the colleges with online students, how to check a school, and what your earlier credits save once accepted.',
  h1: 'Accredited online colleges: the accreditors and your credits',
  intro: `Accredited online colleges are the rule: ${formatNumber(NAT.nAcc, 0)} of the ${formatNumber(NAT.nOnline, 0)} online colleges have an accreditor on file. Type a school’s name below to see its accreditor and its federal College Scorecard page; the calculator shows what your earlier credits save.`,
  resume: (h) => `Accreditation is a review of a college by an independent agency, renewed every few years. The Department of Education recognizes the agencies whose decisions count, and a college must hold accreditation from one of them to take part in federal student aid. Every college counted on this site takes part, so every one has been accredited; College Scorecard names the agency, as recorded on ${h.date(h.P.scorecard.accreditorAsOf)}. Among the ${h.num(h.N.nOnline)} colleges with at least 50 fully online students, ${h.num(h.D.NAT.nAcc)} have an accreditor on file. For the other ${h.num(h.D.NAT.nNoAcc)} the file is empty, usually a branch campus whose accreditation is recorded under its main campus, or a college that closed after the file was drawn. Accreditation does not rank colleges. It matters for one practical thing above all: whether another college will accept your credits.`,
  faqs: (h) => [
    { q: 'How do I check that an online college is accredited?', a: 'Look up the college on College Scorecard, which shows its accreditor, then check that the agency is recognized by the Department of Education or by the Council for Higher Education Accreditation. A college’s own page names its accreditor; be wary of one that names an agency you cannot find in either list.' },
    { q: 'Will another college accept my credits from an accredited school?', a: 'Often, but it is never automatic. The receiving college decides course by course, looking at the accreditor, the course content and your grade. Credits move most easily between public colleges of the same state and between colleges accredited by the same kind of agency.' },
    { q: 'What is a diploma mill?', a: 'A business that sells degrees with little or no study, often with an accreditor that is not recognized or that does not exist. Signs: a degree in weeks, credit for “life experience” alone, no federal aid. None of the colleges counted on this site is one: all are approved for federal aid.' },
  ],
  body: (h) => {
    const acc = h.D.NAT.accreditors.filter(([n]) => n !== 'NA').slice(0, 12).map(([n, c]) => [n, c]);
    // Full agency names, never the codes (naive testers, 2026-11-14: « NCACHE » for the Higher Learning Commission).
    const big = h.D.FEATURED.slice(0, 10).map((f) => [h.B.name(f.n), f.acc ?? 'not on file', f.st]);
    return `
<h2>Accredited online colleges by accrediting agency</h2>
<p>The agencies that accredit the most colleges with at least 50 fully online students. The first seven are the institutional accreditors once called “regional”; the others are national agencies for career schools, distance education or religious colleges, or agencies for a single field.</p>
${h.table(['Accrediting agency', 'Colleges with online students'], acc, `College Scorecard accreditor field, as of ${h.date(h.P.scorecard.accreditorAsOf)}; colleges with 50 or more fully online students in ${h.P.ipeds.enrollmentTerm}.`, ['l', 'r'])}
<h2>Who accredits the largest online schools</h2>
${h.table(['School', 'Accreditor', 'State'], big, `Accrediting agency as named by College Scorecard, ${h.date(h.P.scorecard.accreditorAsOf)}.`, ['l', 'l', 'l'])}
<p>Online universities are accredited by the same agencies as campus universities, often the agency of the state where they are based.</p>
<h2>What your transfer credits are worth</h2>
<p>The calculator above multiplies the credits a college accepts by its price per credit. Thirty accepted credits at the median public price, ${h.m(h.N.medPub4)}, are worth ${h.m(30 * h.N.medPub4)} and a term or two less of study. Ask the new college for an unofficial transcript review before you enroll: many do it at no cost. Then compare the result with the ${h.a('online-bachelors-degree', 'pace calculator')} to see how many years are left.</p><h2>A worked example: 45 credits from an earlier college</h2>
<p>Say you earned 45 credits at an accredited college years ago. If your new school accepts all of them, a 120-credit bachelor’s has 75 credits left; at the median public price, ${h.m(h.N.medPub4)}, that saves ${h.m(45 * h.N.medPub4)}. If it accepts three in four, 34 credits, the saving falls to ${h.m(34 * h.N.medPub4)} and you take 11 more credits, close to four more courses. Asking two or three schools for a credit review before you choose is therefore worth more than most discounts.</p>
<h2>What accreditation does and does not tell you</h2>
<p>It tells you that an agency recognized by the federal government has reviewed the college’s finances, teaching and student support, and found them sufficient. It lets students receive federal aid there. It makes employers and other colleges more willing to accept the degree and the credits. It does not rank programs, guarantee a job, or say anything about price. Some fields add their own program accreditation, in nursing, engineering, business or teaching, which matters for licenses in those fields; the college’s program page names it when there is one.</p>
<p>To check a college yourself, start from its College Scorecard page, which names the accreditor, and then look the agency up in the lists kept by the Department of Education and by the Council for Higher Education Accreditation.</p>
<p>A college that hesitates to name its accreditor, or names one you cannot find, is a reason to stop and ask more questions before paying anything.</p>
`;
  },
});
