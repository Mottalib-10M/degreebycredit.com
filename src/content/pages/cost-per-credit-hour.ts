import { definePage } from '../../lib/guide-types';
import { NAT } from '../../lib/data';
import { formatMoney } from '../../lib/format';

const $ = (n: number) => formatMoney(Math.round(n), 0);

export default definePage({
  id: 'cost-per-credit-hour',
  group: 'cost',
  order: 10,
  tool: { kind: 'mini:credit-hour' },
  related: ['cheapest-online-colleges', 'out-of-state-online-tuition', 'affordable-online-colleges', 'online-bachelors-degree', 'home'],
  sources: ['ipeds_ic_ay', 'ipeds_ic_ay_dict', 'ipeds_glossary', 'ipeds_navigator'],
  slug: 'cost-per-credit-hour',
  nav: 'Cost per credit hour',
  card: 'The median price per credit by type of college, the fees on top, and what one term costs at your price.',
  title: 'Cost per Credit Hour 2026: What Online Colleges Charge',
  description: 'Cost per credit hour at US colleges with online students: medians by type of school from the federal IPEDS file, fees added in, and one term at your price.',
  h1: 'Cost per credit hour at online colleges: medians, fees and your term',
  intro: `The cost per credit hour is the unit price of an online degree. Public four-year colleges charge their own residents a median of ${$(NAT.medPub4)} a credit, private nonprofits ${$(NAT.medNpf4)} and for-profits ${$(NAT.medFp4)}. Type your school’s price below to see a course, a term and a year.`,
  resume: (h) => `A credit hour, in the federal definition used by IPEDS (the Integrated Postsecondary Education Data System), is about 50 minutes of instruction a week over a 15-week semester, or a 10-week quarter. A standard course carries 3 credits, an associate degree about 60 and a bachelor’s about 120. Every college that takes federal student aid reports its per-credit charge for part-time undergraduates to IPEDS, with one price for state residents and one for students from other states. Among the ${h.num(h.N.nQ)} colleges with 50 or more students studying fully online that report it, the price runs from ${h.m(h.N.q[10])} at the 10th percentile to ${h.m(h.N.q[90])} at the 90th, with a median of ${h.m(h.N.q[50])}. Required fees come on top: the median public four-year college adds ${h.m(h.N.medFeePub4)} a year for a full-time student. Figures are the ${h.P.ipeds.chargesYear} charges, the latest IPEDS has published.`,
  faqs: (h) => [
    { q: 'Is the cost per credit hour the same for online and campus students?', a: `Often, but not always. IPEDS asks each college for one per-credit charge for part-time undergraduates, not a separate online rate. Some universities bill online programs at their own “e-rate”, sometimes the same for every state. The median here, ${h.m(h.N.medPub4)} at public four-year colleges for residents, is a starting point; the program’s own tuition page gives the rate you will be billed.` },
    { q: 'Why do fees matter as much as the price per credit?', a: `Because some colleges keep tuition low and charge the rest as fees. Spread over 30 credits, a full-time year, the median public four-year fee of ${h.m(h.N.medFeePub4)} adds ${h.m(h.N.medFeePub4 / 30)} to each credit. The calculator shows this “real price per credit, fees included”, so two schools can be compared on the same footing.` },
    { q: 'How many credits does a full-time student take?', a: 'Twelve credits a term is the usual full-time floor, so 24 credits over two semesters; 15 a term gets a bachelor’s done in four years. Many online students work and take 6 credits a term, two courses, which doubles the time to finish and the years of fees paid.' },
    { q: 'Which colleges report no price per credit?', a: `Colleges that charge one flat price per term, whatever the number of courses, often leave the per-credit field empty. Of the ${h.num(h.N.nOnline)} colleges with 50 or more fully online students, ${h.num(h.N.nOnline - h.N.nQ)} report no in-state per-credit charge. For them, divide the term price by the credits you plan to take.` },
  ],
  body: (h) => {
    const rows = [
      ['Community college, district resident', h.m(h.N.medPub2d), h.num(h.N.nPub2)],
      ['Community college, state resident', h.m(h.N.medPub2), h.num(h.N.nPub2)],
      ['Community college, from another state', h.m(h.N.medPub2out), h.num(h.N.nPub2)],
      ['Public university, state resident', h.m(h.N.medPub4), h.num(h.N.nPub4)],
      ['Public university, from another state', h.m(h.N.medPub4out), h.num(h.N.nPub4)],
      ['Private nonprofit university', h.m(h.N.medNpf4), h.num(h.N.nNpf4)],
      ['Private for-profit university', h.m(h.N.medFp4), h.num(h.N.nFp4)],
    ];
    const grad = [
      ['Public university, state resident', h.m(h.N.medGradPub)],
      ['Public university, from another state', h.m(h.N.medGradPubOut)],
      ['Private nonprofit university', h.m(h.N.medGradNpf)],
      ['Private for-profit university', h.m(h.N.medGradFp)],
    ];
    const bristol = h.D.byId(165033);
    const bEff = bristol && bristol.h2 ? h.E.effPerCredit(bristol.h2, bristol.f2 ?? 0) : 0;
    return `
<h2>Cost per credit hour by type of college</h2>
<p>The table gives the median per-credit charge for undergraduates, and the number of colleges in each group that report one. A median means half the colleges charge less and half charge more: it says what is common, not what your school charges.</p>
${h.table(['Type of college', 'Median per credit', 'Colleges'], rows, `Per-credit charge for part-time undergraduates, ${h.P.ipeds.chargesYear}, from the IPEDS institutional characteristics file. Two-year and four-year as classified by IPEDS.`, ['l', 'r', 'r'])}
<p>The gap between the two public lines is the price of residence. A public university charges a student from another state a median of ${h.m(h.N.medPub4out)} a credit, more than twice the resident price; the ${h.a('out-of-state-online-tuition', 'out-of-state page')} lists the public universities that charge every online student the same.</p>
<h2>Graduate credits cost more</h2>
<p>Master’s programs are billed per graduate credit, at a higher price. ${h.num(h.N.nH6)} colleges report an in-state graduate charge.</p>
${h.table(['Type of college', 'Median per graduate credit'], grad, `Per-credit charge for part-time graduate students, ${h.P.ipeds.chargesYear}.`, ['l', 'r'])}
<p>The ${h.a('online-masters-degree', 'master’s degree page')} turns these prices into the cost of a 30 to 36 credit program.</p>
<h2>Fees: the second price per credit</h2>
<p>Required fees are charged per year, not per credit, and IPEDS records them for a full-time student. Spread over 30 credits they can change the ranking. ${bristol && bristol.h2 ? `${h.B.name(bristol.n)} in Massachusetts reports ${h.m(bristol.h2)} a credit of tuition for residents but ${h.m(bristol.f2 ?? 0)} of fees a year, about ${h.m(bEff)} a credit in all.` : ''} This site ranks colleges on that combined figure, tuition plus a thirtieth of the yearly fees, and says so wherever it does.</p>
<p>Books, a laptop and proctored exam fees are not in either number. Ask the school for its “cost of attendance” for online students, which adds them in.</p>
<h2>Reading a school’s tuition page</h2>
<p>Look for three numbers: the price per credit for your residence, the fees per term or per year, and whether the online program has its own rate. Type the first in the calculator above and the fees under “More details”. The federal ${h.src('ipeds_navigator', 'College Navigator')} shows the same IPEDS figures for any single college, with its address and programs.</p><h2>One year at three prices</h2>
<p>To see what the spread means, take a working adult’s pace of 18 credits a year, two courses in each of three terms, and the median public fee of ${h.m(h.N.medFeePub4)}. At the price a quarter of colleges stay under, ${h.m(h.N.q[25])} a credit, the year costs ${h.m(18 * h.N.q[25] + h.N.medFeePub4)}. At the middle price, ${h.m(h.N.q[50])}, it costs ${h.m(18 * h.N.q[50] + h.N.medFeePub4)}. At the price only a quarter of colleges exceed, ${h.m(h.N.q[75])}, it costs ${h.m(18 * h.N.q[75] + h.N.medFeePub4)}. Over the seven years such a pace takes for a bachelor’s, the gap between the first and the last line grows to about ${h.m(7 * 18 * (h.N.q[75] - h.N.q[25]))}.</p>
<p>That is why the price per credit deserves more attention than the yearly price a school puts in its ads: it is the number that gets multiplied, term after term, by every course you take.</p>
`;
  },
});
