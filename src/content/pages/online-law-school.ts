import { definePage } from '../../lib/guide-types';
import { PROGRAMS } from '../../lib/data';
import { formatMoney, formatNumber } from '../../lib/format';
import { lvl } from '../../lib/prog-tables';

const $ = (n: number | null) => formatMoney(Math.round(n ?? 0), 0);
const J = lvl('law', 'docp');
const T = PROGRAMS.law.tuition;
/** A yearly JD tuition under $5,000 is almost certainly a per-unit charge typed in the yearly field: shown, not used. */
const ODD = 5000;
const ONL = PROGRAMS.law.online;
const med = (xs: number[]) => { const v = [...xs].sort((a, b) => a - b); const k = Math.floor(v.length / 2); return v.length ? (v.length % 2 ? v[k] : (v[k - 1] + v[k]) / 2) : 0; };
const medOnline = med(ONL.filter((r) => (r.t ?? 0) >= ODD).map((r) => r.t ?? 0));

export default definePage({
  id: 'online-law-school',
  group: 'program',
  order: 30,
  tool: { kind: 'mini:law-jd' },
  related: ['online-phd-programs', 'online-masters-degree', 'accredited-online-colleges', 'online-colleges-that-accept-fafsa', 'home'],
  sources: ['ipeds_c_dep', 'ipeds_c_dep_dict', 'ipeds_ic_ay', 'ipeds_ic_ay_dict', 'calbar_directory', 'nces_cip'],
  slug: 'online-law-school',
  nav: 'Online law school',
  card: 'The few law schools whose JD can be completed online, what they charge a year, and the bar admission question to ask first.',
  title: 'Online Law School 2026: Every Online JD and What It Costs',
  description: 'Online law school in federal IPEDS data: the colleges with a JD you can complete at a distance, yearly tuition and fees, and why bar admission comes first.',
  h1: 'Online law school: the JD programs you can complete at a distance, and their yearly tuition',
  intro: `An online law school is still rare: ${formatNumber(J.nOnline, 0)} of the ${formatNumber(J.nOffer, 0)} colleges awarding a law degree report a JD that can be completed at a distance. Their median tuition is ${$(medOnline)} a year. Pick a school or a median below to see the whole degree.`,
  resume: (h) => `The Juris Doctor is a professional doctorate in the federal files, under CIP code 22.0101. In ${h.P.programs.completionsYear}, ${h.num(J.nOffer)} colleges that take federal aid awarded one, and ${h.num(J.nOnline)} reported a JD program that can be completed entirely through distance education. They fall into two groups. Some are law schools approved by the American Bar Association that run a distance or hybrid JD. Others, many of them in California, are law schools that the State Bar of California accredits or registers, a route aimed at that state’s bar exam. IPEDS does not say which is which. For tuition, IPEDS has a dedicated law line: for ${h.P.ipeds.chargesYear}, the ${h.num(T.n)} law schools reporting it had a median of ${h.m(T.medPub)} a year at public schools for residents, ${h.m(T.medPubOut)} for students from other states and ${h.m(T.medNpf)} at private nonprofit schools, plus a median of ${h.m(T.medFee)} of required fees.`,
  faqs: (h) => [
    { q: 'Can you take the bar exam with an online JD?', a: 'It depends on the school and the state. Each state’s bar sets its own education rule, and many look for a JD from a law school approved by the American Bar Association. California also lets graduates of law schools its State Bar accredits or registers, some of them distance-learning schools, sit its exam. Read your state’s rule before you apply.' },
    { q: 'How much does an online JD cost in total?', a: `At the median yearly tuition of law schools with an online JD, ${h.m(medOnline)}, three years cost about ${h.m(medOnline * 3)} before fees; four part-time years, ${h.m(medOnline * 4)}. The cheapest schools on the list charge far less, but check their bar eligibility first. Scholarships offered at admission can lower the price a lot.` },
    { q: 'Is an online JD cheaper than a campus JD?', a: `Not by itself: the median for law schools with an online JD, ${h.m(medOnline)} a year, is close to the overall medians. The saving is that you can keep your job and avoid moving. Hybrid programs with campus weekends add travel costs to the tuition.` },
  ],
  body: (h) => {
    const rows = ONL.map((r) => [h.B.name(r.n), r.st, ['public', 'nonprofit', 'for-profit'][r.ctrl - 1] ?? '', r.t == null ? 'not reported' : r.t < ODD ? `${h.m(r.t)} reported, likely per unit` : h.m(r.t), r.f != null && r.t != null && r.t >= ODD ? h.m(r.f) : 'n/a', r.t != null && r.t >= ODD ? h.m(3 * (r.t + (r.f ?? 0))) : 'ask the school']);
    const ca = ONL.filter((r) => r.st === 'CA').length;
    return `
<h2>Every online law school in the federal file</h2>
<p>All colleges reporting a JD that can be completed entirely at a distance, sorted by yearly law tuition for residents. The last column is three years of tuition and fees at that price; part-time programs take longer.</p>
${h.table(['Law school', 'State', 'Type', 'JD tuition per year', 'Fees per year', 'Three years'], rows, `JD completable entirely via distance education, ${h.P.programs.completionsYear} (IPEDS ${h.P.programs.file}, CIP 22.0101); law tuition and fees for residents, ${h.P.ipeds.chargesYear} (IPEDS ${h.P.ipeds.chargesFile}, law line). A figure under ${h.m(ODD)} a year is almost certainly a per-unit price typed in the yearly field.`, ['l', 'l', 'l', 'r', 'r', 'r'])}
<p>${h.num(ca)} of the ${h.num(ONL.length)} schools are in California, where the State Bar keeps a ${h.src('calbar_directory', 'directory of law schools')}: those approved by the ABA, those accredited by the State Bar itself, and unaccredited schools registered with it, including distance-learning and correspondence schools. Students of the unaccredited ones take the First-Year Law Students’ Examination before their study counts toward the California bar.</p>
<h2>Online law school or ABA-approved program: the first question</h2>
<p>Before price, ask whether the JD lets you sit the bar where you want to practice. Ask the school for its approval status and its graduates’ bar passage results, and read your state bar’s admission rules. A cheap JD that leads to no bar in your state is an expensive one.</p>
<p>The list also holds universities with ABA-approved law schools that run a distance or hybrid JD. Ask each one how many sessions, if any, take place on campus: travel to a few weekends a year is part of the price.</p>
<h2>What a JD costs anywhere</h2>
<p>For comparison, the yearly law tuition reported by all ${h.num(T.n)} law schools in the file, ${h.num(T.nPub)} public and ${h.num(T.nNpf)} private nonprofit:</p>
<ul>
<li><strong>Public, state resident</strong>: median ${h.m(T.medPub)} a year, ${h.m(3 * T.medPub)} for three years.</li>
<li><strong>Public, from another state</strong>: median ${h.m(T.medPubOut)} a year.</li>
<li><strong>Private nonprofit</strong>: median ${h.m(T.medNpf)} a year, ${h.m(3 * T.medNpf)} for three years.</li>
<li><strong>Required fees</strong>: median ${h.m(T.medFee)} a year on top.</li>
</ul>
<p>These are sticker prices. Law schools give large scholarships at admission, so the price paid is often lower. The calculator above takes your scholarship per year.</p>
<p>Compare the median of the online JD schools, ${h.m(medOnline)} a year, with these: an online JD is not a discount JD. The very low prices on the list come from a few California schools whose degree aims at the California bar only.</p>
<h2>Shorter law degrees online</h2>
<p>Many universities offer online master’s degrees about law for people who do not want to practice, such as a Master of Legal Studies, and online LLMs for lawyers. They do not lead to the bar. The ${h.a('online-masters-degree', 'master’s degree page')} gives the graduate price per credit those programs usually follow.</p>
`;
  },
});
