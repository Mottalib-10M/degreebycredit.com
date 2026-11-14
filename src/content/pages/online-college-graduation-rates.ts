import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatPercent } from '../../lib/format';

export default definePage({
  id: 'online-college-graduation-rates',
  group: 'choose',
  order: 230,
  tool: { kind: 'mini:grad-rate' },
  related: ['largest-online-universities', 'online-colleges-by-state', 'accredited-online-colleges', 'cheapest-online-bachelors-degree', 'home'],
  sources: ['scorecard_data', 'scorecard_dict', 'scorecard_doc', 'ipeds_ef_dist'],
  slug: 'online-college-graduation-rates',
  nav: 'Online college graduation rates',
  card: 'Out of 100 students who start, how many hold a degree eight years later, online school by online school.',
  title: 'Online College Graduation Rates 2026: Awards in Eight Years',
  description: 'Online college graduation rates from College Scorecard: the share of entering students with an award within eight years, school by school, online and campus.',
  h1: 'Online college graduation rates: who finishes within eight years',
  intro: `Online college graduation rates are lower than campus ones: at the median college where most students study online, ${formatPercent(NAT.medOm8Online, 0)} of entering students held a degree or certificate eight years later, against ${formatPercent(NAT.medOm8Campus, 0)} at mostly campus colleges. Pick a school below to see its own figure.`,
  resume: (h) => `The graduation rate most often quoted follows only students who start college for the first time and full time, which leaves out most online students. This site uses a wider measure from College Scorecard: the share of all students who entered a college in ${h.P.scorecard.awardCohort}, first-time or transfer, full-time or part-time, who received a degree or certificate from that college within eight years. On that measure, the median is ${h.pc(h.N.medOm8Online, 0)} at the ${h.num(h.D.NAT.nOm8Online)} colleges where at least half the students studied fully online in ${h.P.ipeds.enrollmentTerm}, and ${h.pc(h.N.medOm8Campus, 0)} at the ${h.num(h.D.NAT.nOm8Campus)} where fewer than a quarter did. Online students are older, more often part time and more often working, so part of the gap comes from who enrolls, not from how they are taught. Students who leave and finish at another college count as non-completers for the first one.`,
  faqs: (h) => [
    { q: 'What is a good graduation rate for an online college?', a: `There is no official threshold. As a reference, the median college where most students study online sits at ${h.pc(h.N.medOm8Online, 0)} on the eight-year award measure. A school well above that, for students like you, is doing better than most; compare full-time and part-time figures where the table gives both.` },
    { q: 'Why are online graduation rates lower?', a: 'Online students are more often older, working and studying part time, and part-time students take longer and stop more often whatever the format. Some online schools also admit nearly every applicant. The rate measures who finishes at that college; it does not separate the effect of the school from that of its students.' },
    { q: 'Does the rate count students who transfer out?', a: 'No. A student who leaves and earns a degree elsewhere counts as not having an award from the first college. College Scorecard also reports the share still enrolled or transferred, but this site shows only the award share, the figure that says how often the school itself delivers a credential.' },
  ],
  body: (h) => {
    const rows = h.D.FEATURED.slice(0, 15).map((f) => [h.B.name(f.n), f.om8 != null ? h.pc(f.om8, 0) : 'n/a', f.om8ft != null ? h.pc(f.om8ft, 0) : 'n/a', f.om8pt != null ? h.pc(f.om8pt, 0) : 'n/a', f.ug25 != null ? h.pc(f.ug25, 0) : 'n/a']);
    const mo = h.D.COLLEGES.filter((c) => (c.share ?? 0) >= 0.5 && (c.exc ?? 0) >= 50);
    const ft = h.B.med(mo.map((c) => c.om8ft)), pt = h.B.med(mo.map((c) => c.om8pt));
    return `
<h2>Online college graduation rates at the largest online schools</h2>
<p>Share of entering students with an award within eight years: all students, first-time full-time students, and part-time students who had studied elsewhere before. The last column gives the share of undergraduates aged 25 or older.</p>
${h.table(['School', 'All students', 'First-time full-time', 'Part-time, not first-time', 'Undergraduates 25+'], rows, `College Scorecard, released ${h.date(h.P.scorecard.release)}: entering class of ${h.P.scorecard.awardCohort}, followed eight years; age share fall 2023.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The spread is wide, from about one student in four to more than four in five. Programs aimed at working nurses or at graduate students, who have already finished one degree, tend to show high rates; several schools that admit nearly every applicant sit near one student in four.</p>
<h2>What finishing changes in the price</h2>
<p>A school’s price per credit is what you pay; its completion rate is the chance the credits turn into a degree. Two schools at the same price are not the same deal if one sees twice as many students through. The calculator above shows what a student who stops after one or two years has spent.</p>
<h2>Before you enroll</h2>
<p>Ask the school three things: its completion rate for part-time adults, how many credits it will accept from you, and what support it gives students who fall behind. Then compare prices on the ${h.a('largest-online-universities', 'largest online universities page')}.</p><h2>Full-time and part-time students do not finish alike</h2>
<p>At colleges where at least half the students study fully online, the median share who finished is ${h.pc(ft, 0)} for students who started for the first time and full time, and ${h.pc(pt, 0)} for part-time students who had already studied elsewhere. The first group is the one older graduation rates followed; the second is closer to many online students, who come back to college while working.</p>
<p>So read a school’s figure for the group that looks like you. A working adult with earlier credits, studying part time, should look at the part-time column first; a recent high school graduate studying full time online, at the first-time full-time column.</p>
<p>No rate predicts one person’s result. Students who finish tend to have a plan for each term, take a steady load, and use the tutoring and advising the school offers. Asking a school what support it gives part-time online students is a fair question before you enroll.</p>
<p>The figures follow students who entered in ${h.P.scorecard.awardCohort}; schools may have changed since, for better or worse.</p><p>Read them as the record of a recent past, not a promise.</p>
`;
  },
});
