import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatNumber } from '../../lib/format';

export default definePage({
  id: 'online-colleges-that-accept-fafsa',
  group: 'choose',
  order: 210,
  tool: { kind: 'mini:fafsa-grant' },
  related: ['affordable-online-colleges', 'accredited-online-colleges', 'largest-online-universities', 'online-masters-degree', 'home'],
  sources: ['studentaid_fafsa', 'studentaid_pell', 'studentaid_school', 'scorecard_data', 'ipeds_hd'],
  slug: 'online-colleges-that-accept-fafsa',
  nav: 'Online colleges that accept FAFSA',
  card: 'Federal aid at online colleges: which ones take it, how many students get a Pell Grant, what is left to pay.',
  title: 'Online Colleges That Accept FAFSA 2026: Pell, Price, Debt',
  description: 'Online colleges that accept FAFSA: every college here takes federal aid. See the Pell Grant share, the net price and median debt at the largest online schools.',
  h1: 'Online colleges that accept FAFSA: aid, Pell Grants and what is left',
  intro: `Online colleges that accept FAFSA are all the ${formatNumber(NAT.nOnline, 0)} online colleges on this site: each takes part in the federal student aid programs. Pick a large online school and type your grant to see what a year leaves you to pay.`,
  resume: (h) => `The FAFSA, the Free Application for Federal Student Aid, is the form that opens federal grants, loans and work-study, and most state and college aid too. A college can pay that aid only if the Department of Education has approved it for the federal programs, known as Title IV. The federal directory flags those that are: ${h.num(h.N.n)} degree-granting colleges in the states and the District of Columbia, online or not. This site covers the ${h.num(h.N.nOnline)} of them with 50 or more fully online students. Online students qualify on the same terms as campus students if they are in an eligible program and take enough credits; part-time study lowers a Pell Grant in proportion. At the median college where most students study online, ${h.pc(h.D.NAT.medPellOnline, 0)} of undergraduates received a Pell Grant in ${h.P.scorecard.pellYear}, and the median federal debt of students when they left was ${h.m(h.D.NAT.medDebtOnline)}.`,
  faqs: (h) => [
    { q: 'Can I get a Pell Grant for an online degree?', a: 'Yes, if the college takes part in federal aid, the program is eligible and you have financial need on the FAFSA. The grant is set for a full-time year and reduced if you study part time. The maximum changes each year: studentaid.gov publishes it. A Pell Grant does not have to be repaid.' },
    { q: 'How do I know whether an online college accepts FAFSA?', a: 'Search for it on the FAFSA itself, which only lists colleges that take part, or on College Scorecard. Every college shown on this site does. A school that tells you it does not take federal aid but is “just as good” deserves a second look at its accreditation.' },
    { q: 'What does median debt mean here?', a: `College Scorecard’s median debt is the amount half of borrowers owed in federal loans when they left the college, graduates and non-graduates together, for ${h.P.scorecard.debtYears}. It counts only federal loans, not private ones, and only students who borrowed.` },
  ],
  body: (h) => {
    const rows = h.D.FEATURED.slice(0, 15).map((f) => [h.B.name(f.n), f.pell != null ? h.pc(f.pell, 0) : 'n/a', f.np ? h.m(f.np) : 'n/a', f.debt ? h.m(f.debt) : 'n/a']);
    const hcm = h.B.ONLINE.filter((c) => c.hcm2).length;
    const lower = h.D.FEATURED.slice(0, 15).filter((f) => f.np && f.t2 && f.np < f.t2 + (f.f2 ?? 0)).length;
    return `
<h2>Online colleges that accept FAFSA: aid at the largest ones</h2>
<p>For the fifteen schools with the most fully online students: the share of undergraduates with a Pell Grant, the average net price after grants, and the median federal debt when leaving.</p>
${h.table(['School', 'Undergraduates with Pell', 'Average net price', 'Median debt'], rows, `College Scorecard, released ${h.date(h.P.scorecard.release)}: Pell share and net price ${h.P.scorecard.pellYear}; debt ${h.P.scorecard.debtYears}. Net price is for full-time first-time students with aid and includes living costs.`, ['l', 'r', 'r', 'r'])}
<p>A high Pell share means the school enrolls many students with low incomes; it says nothing on its own about price or quality. The net price, a full-time yearly figure with living costs, is best used to compare schools, not as your bill.</p>
<h2>Federal aid step by step</h2>
<p>File the ${h.src('studentaid_fafsa', 'FAFSA')} for each school year, list the colleges you consider, and read each aid offer for three lines: grants, loans and what is left. Type the grants in the calculator above; loans stay out of it on purpose, since they are paid back later with interest. The ${h.src('studentaid_school', 'eligibility rules')} on studentaid.gov say which students and programs qualify.</p>
<h2>A warning sign in the files</h2>
<p>The Department of Education places some colleges under heightened cash monitoring when it has concerns about their finances or how they handle aid. ${h.num(hcm)} of the colleges with 50 or more fully online students were on the stricter level of that list when the College Scorecard file was drawn. It does not stop aid, but it is worth asking the college about.</p><h2>Sticker price and net price at the largest online schools</h2>
<p>Of the fifteen schools in the table, ${h.num(lower)} show an average net price below their published tuition and fees for a full-time year, even though the net price also includes books and living costs. That is the effect of grants: the published price is what a student without aid would pay, and few students at these schools pay it in full.</p>
<p>For a part-time online student, the arithmetic changes. A Pell Grant is set for a full-time year and reduced for part-time enrollment, so a student taking two courses a term receives a smaller grant, spread over more years. The calculator above takes the grant you expect each year and shows what is left of a year’s tuition and fees at the school you pick.</p>
<p>Federal loans come on top of grants and are offered to most students who file the FAFSA. They are not counted in the calculator: they change when you pay, not how much.</p>
`;
  },
});
