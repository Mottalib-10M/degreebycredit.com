import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);

export default definePage({
  id: 'affordable-online-colleges',
  group: 'cost',
  order: 50,
  tool: { kind: 'mini:afford' },
  related: ['cheapest-online-colleges', 'online-colleges-that-accept-fafsa', 'cost-per-credit-hour', 'online-bachelors-degree', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_ef_dist', 'scorecard_data', 'scorecard_dict', 'studentaid_pell'],
  slug: 'affordable-online-colleges',
  nav: 'Affordable online colleges',
  card: 'Start from your monthly budget: the highest price per credit you can carry, and how many colleges charge that or less.',
  title: 'Affordable Online Colleges 2026: Start From Your Budget',
  description: 'Affordable online colleges start from what you can pay each month: turn your budget into a price per credit and see the share of colleges at or under it.',
  h1: 'Affordable online colleges: the price per credit your budget allows',
  intro: `Affordable online colleges are the ones whose price fits your budget. Half of all colleges with online students, public and private, charge residents ${$(NAT.q[50])} a credit or less. Type what you can pay each month to see your highest price per credit.`,
  resume: (h) => `“Affordable” has no federal definition, so this page turns the word around: what can you afford? A monthly budget becomes a yearly one, grants are added, required fees are taken off, and what is left, divided by the credits you take in a year, is the highest price per credit you can pay without borrowing. That figure is then placed among the ${h.num(h.N.nQ)} colleges with 50 or more fully online students that report a resident per-credit charge for ${h.P.ipeds.chargesYear}. A tenth of them charge ${h.m(h.N.q[10])} or less, a quarter ${h.m(h.N.q[25])} or less, half ${h.m(h.N.q[50])} and three quarters ${h.m(h.N.q[75])}. College Scorecard adds the average net price, what students with aid actually paid in a year after grants: a median of ${h.m(h.D.NAT.medNpOnline)} at the ${h.num(h.D.NAT.nNpOnline)} mostly online colleges that report one, a figure that covers living costs too.`,
  faqs: (h) => [
    { q: 'What is the most affordable way to earn an online degree?', a: `Usually: start at your district’s community college, where the median resident price is ${h.m(h.N.medPub2d)} a credit, transfer every credit you can, apply for federal aid every year, and finish at a public university of your own state. Each step is a page of this site, with its own calculator.` },
    { q: 'What does the average net price measure?', a: 'College Scorecard’s net price is the full yearly cost of attendance, tuition, fees, books and living costs, minus the average grant aid, for full-time first-time students who receive aid. It is useful to compare colleges, but an adult studying part time online will usually pay less in a year and more years.' },
    { q: 'How much should I budget each month for an online degree?', a: 'Work backwards from the price. Two courses a term at a median public university, three terms a year, is about 18 credits a year: multiply by the price per credit, add the fees and divide by 12. The calculator does the reverse, from the budget to the price, so both ways meet.' },
    { q: 'Do grants count in the budget?', a: 'Yes: a grant is money you do not repay, so it raises the price you can afford. Type the yearly grant from your aid offer. Loans are left out on purpose: they spread the cost over later years but do not reduce it.' },
  ],
  body: (h) => {
    const marks = [100, 150, 200, 300, 400, 500, 750, 1000];
    const cpy = 24; // same yearly load as the calculator above (naive tester 3, 2026-11-14: table at 18, calculator at 24)
    const rows = marks.map((x) => [`${h.m(x)} a credit`, h.pc(h.E.shareAtOrBelow(h.N.q, x), 0), h.m(x * cpy), h.m((x * cpy + h.N.medFeePub4) / 12)]);
    const budgets = [200, 400, 700];
    return `
<h2>How many affordable online colleges at each price</h2>
<p>For a few round prices: the share of colleges with online students that charge residents that much or less, what 24 credits a year cost at that price (the calculator’s starting value), and the monthly amount with median public fees.</p>
${h.table(['Price per credit', 'Colleges at or under', '24 credits a year', 'Per month, with fees'], rows, `Shares read on the per-credit charges of ${h.num(h.N.nQ)} colleges with 50 or more fully online students, ${h.P.ipeds.chargesYear} (IPEDS). Median public four-year fees: ${h.m(h.N.medFeePub4)} a year.`, ['l', 'r', 'r', 'r'])}
<p>The share climbs fast below ${h.m(h.N.q[50])}: most of those colleges are community colleges and public universities pricing for their own residents. Above ${h.m(h.N.q[90])} a credit, nearly all are private.</p>
<h2>Three things that make a college more affordable than its price</h2>
<p><strong>Accepted credits.</strong> Thirty credits accepted in transfer take a quarter off a bachelor’s. The ${h.a('accredited-online-colleges', 'transfer calculator')} shows what yours are worth.</p>
<p><strong>Grants.</strong> The federal Pell Grant goes to students with financial need, and every college counted here can pay it; the ${h.src('studentaid_pell', 'Pell Grant page')} on studentaid.gov sets out the rules. At the median mostly online college, ${h.pc(h.D.NAT.medPellOnline, 0)} of undergraduates receive one.</p>
<p><strong>Fewer fee years.</strong> Fees are charged per year enrolled, so a steady pace costs less than stopping and restarting.</p>
<h2>When a low price is not affordable</h2>
<p>A program you leave halfway is the costliest of all, since the credits rarely lead to a job. Check the share of students who finish on the ${h.a('online-college-graduation-rates', 'graduation rates page')} before you choose on price alone.</p><h2>Three budgets, three sets of colleges</h2>
<p>The same calculation for three monthly budgets, at 24 credits a year with median public fees and no grant:</p>
<ul>${budgets.map((b) => `<li><strong>${h.m(b)} a month</strong>: up to ${h.m(Math.floor(h.E.affordablePerCredit(b, 24, h.N.medFeePub4, 0)))} a credit, which ${h.pc(h.E.shareAtOrBelow(h.N.q, h.E.affordablePerCredit(b, 24, h.N.medFeePub4, 0)), 0)} of colleges with online students charge or undercut.</li>`).join('')}</ul>
<p>Taking fewer credits a year raises the price you can pay per credit, but stretches the degree over more years and more fees. Taking more lowers it. The calculator lets you try both and see where your budget lands among the ${h.num(h.N.nQ)} colleges.</p>
<p>The prices behind the shares are resident prices. If you plan to study at a public college outside your state, compare your figure with out-of-state prices instead, which are much higher.</p>
<p>Finally, keep a margin. Prices usually rise a little each year, and a course failed or dropped late is paid again.</p><p>A budget with a small cushion survives a bad term; one with none does not.</p>
`;
  },
});
