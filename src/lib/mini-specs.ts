/**
 * Calculators, one per subject (RECETTE §9.3). Every figure is computed by the tested engine of
 * `lib/engine/degree.ts`; the starting values are medians and rows of the federal files (IPEDS 2023-24 charges,
 * College Scorecard award rates), read through `lib/browser-data.ts`. Nothing is fetched while the reader types.
 */
import type { MiniSpec, MiniInput } from './mini-types';
import { P } from './engine/params';
import * as E from './engine/degree';
import { NATB as N, FEATURED_B, CHEAP_B, CHEAP4_B, STATES_B, PROG_B, shortName, sector } from './browser-data';
import metaRaw from '../data/data-meta.json';
import { formatMoney as fm, formatNumber } from './format';
import { pct } from './pct';
import { degreeAtPace, PACE } from './pace';

const m = (n: number) => fm(Math.round(n), 0);
const m2 = (n: number) => fm(n, 2);
const num = (n: number) => formatNumber(n, 0);
const yrs = (y: number) => (y === 1 ? '1 year' : `${formatNumber(y, y % 1 ? 1 : 0)} years`);
const NX = (metaRaw as any).national as { nPub2: number; nPub4: number; nSameOut: number; nPub4Out: number; medGradPubOut: number; medPellOnline: number };
const money = (id: string, label: string, def: number, help?: string, avance = false): MiniInput => ({ id, label, def, unit: '$', max: 1_000_000, help, ...(avance ? { avance } : {}) });
const count = (id: string, label: string, def: number, max: number, help?: string, avance = false): MiniInput => ({ id, label, def, max, help, ...(avance ? { avance } : {}) });
const opt = (labels: string[]) => labels.map((label, i) => ({ value: String(i), label }));
const IPEDS = `the Department of Education’s yearly college survey, ${P.ipeds.chargesYear}`;
/** One pace for every calculator (naive testers, 2026-11-14, tour 3: 15, 12 and 6 credits a term, 24 or 30 a year). */
const PACE_YEAR = PACE.creditsPerTerm * PACE.termsPerYear;
const PACE_HELP = `${PACE.creditsPerTerm} credits a term, ${PACE.termsPerYear} terms a year (${PACE_YEAR} a year, a bachelor’s in 4 years) is the pace every calculator of this site starts from.`;
const RATE_NOTE = `Charges reported by each college to the Department of Education’s yearly college survey (IPEDS) for ${P.ipeds.chargesYear}. Some colleges bill online students a separate rate: the school’s own tuition page is the one that counts.`;

const LEVELS = [
  { name: 'associate degree', credits: P.credits.associate },
  { name: 'bachelor’s degree', credits: P.credits.bachelor },
  { name: 'master’s degree', credits: P.credits.master },
  { name: 'certificate', credits: P.credits.certificate },
];
/** Median per-credit charge and yearly fees of a type of school, by level (graduate charges for the master’s). */
function median(level: number, s: number): { rate: number; fees: number; what: string; n: string } {
  const grad = level === 2;
  const two = level === 0 || level === 3;
  if (s === 0) return grad ? { rate: N.medGradPub, fees: 0, what: 'public universities for their own state’s residents (national median)', n: 'graduate rate of public universities' } : two ? { rate: N.medPub2, fees: N.medFeePub2, what: 'community colleges for their own state’s residents (national median)', n: `${num(NX.nPub2)} public two-year colleges` } : { rate: N.medPub4, fees: N.medFeePub4, what: 'public universities for their own state’s residents (national median)', n: `${num(NX.nPub4)} public four-year colleges` };
  if (s === 1) return grad ? { rate: NX.medGradPubOut, fees: 0, what: 'a public university in another state', n: 'out-of-state graduate rate of public universities' } : two ? { rate: N.medPub2out, fees: N.medFeePub2, what: 'a public community college in another state', n: 'out-of-state rate of public two-year colleges' } : { rate: N.medPub4out, fees: N.medFeePub4, what: 'a public university in another state', n: 'out-of-state rate of public four-year colleges' };
  if (s === 2) return { rate: grad ? N.medGradNpf : N.medNpf4, fees: grad ? 0 : N.medFeeNpf4, what: 'a private nonprofit college', n: grad ? 'graduate rate of private nonprofit colleges' : 'private nonprofit four-year colleges' };
  return { rate: grad ? N.medGradFp : N.medFp4, fees: grad ? 0 : N.medFeeFp4, what: 'a for-profit college', n: grad ? 'graduate rate of for-profit colleges' : 'for-profit four-year colleges' };
}
const SECTOR_OPTS = opt(['Public, in-state price', 'Public, out-of-state price', 'Private nonprofit', 'Private for-profit', 'I know my school’s price']);
const TERMS = [{ value: '2', label: '2 terms (semesters)' }, { value: '3', label: '3 terms (trimesters)' }, { value: '4', label: '4 terms (quarters)' }, { value: '6', label: '6 terms (8-week terms)' }];
const pickFeatured = opt(FEATURED_B.map((f) => shortName(f.n)));
/** Tuition of `credits` at a featured school: per credit, or its flat yearly price at 30 credits a year. */
function featuredTuition(f: (typeof FEATURED_B)[number], credits: number): { tuition: number; years: number; how: string } {
  const years = Math.ceil((credits / 30) * 2 - 1e-9) / 2;
  if (f.h2) return { tuition: credits * f.h2, years, how: `${m(f.h2)} a credit` };
  const t = E.flatRateTuition(f.t2 ?? 0, credits, 30);
  return { tuition: t.tuition, years: t.years, how: `flat ${m(f.t2 ?? 0)} a year, at 30 credits a year` };
}
const TX = Math.max(0, STATES_B.findIndex((s) => s.code === 'TX'));
/** State of the cheapest college of the national list, the one the cheapest-colleges page names first. */
const CHEAPEST_ST = Math.max(0, STATES_B.findIndex((s) => s.code === CHEAP_B[0]?.st));

const SPECS: Record<string, MiniSpec> = {
  'degree-cost': {
    title: 'What will your online degree cost?',
    exemple: 'Example: bachelor’s degree at the typical in-state price of public universities (national median), 4 years',
    cta: 'Price per credit, college by college', ctaPage: 'cost-per-credit-hour',
    inputs: [
      { id: 'level', label: 'Degree', def: 1, options: opt(LEVELS.map((l) => `${l.name.charAt(0).toUpperCase()}${l.name.slice(1)} (${l.credits} credits)`)) },
      { id: 'sector', label: 'Type of school', def: 0, options: SECTOR_OPTS, help: 'Not sure? Keep “Public, in-state price”: the typical price US public colleges charge residents of their own state (national median: half charge less, half more).' },
      { ...money('rate', 'Your school’s price per credit', N.medPub4, 'On the school’s tuition page, “per credit hour”.'), showIf: (v) => v.sector === 4 },
      { ...money('fees', 'Required fees per year', N.medFeePub4, 'Technology, online or student fees. Not sure? Leave the median shown.'), showIf: (v) => v.sector === 4 },
      count('transfer', 'Credits you already have (transfer)', 0, 200, 'Credits from an earlier college, an exam or the military that the school accepts. Not sure? Leave 0.'),
      money('grants', 'Grants per year (Pell, state, employer)', 0, 'Money you do not repay. Not sure? Leave 0: the total is then the full price.', true),
      count('perTerm', 'Credits per term', PACE.creditsPerTerm, 30, '15 a term finishes a bachelor’s in 4 years; 12 is the full-time minimum; 6 (two courses) is half time.', true),
      { id: 'terms', label: 'Terms per year', def: PACE.termsPerYear, options: TERMS, avance: true },
    ],
    run: (v, touched = {}) => {
      const L = LEVELS[v.level] ?? LEVELS[1];
      const md = median(v.level, v.sector);
      const own = v.sector === 4;
      const rate = own ? v.rate : md.rate;
      const fees = own ? v.fees : md.fees;
      const r = E.degreeCost({ perCredit: rate, credits: L.credits, transfer: v.transfer, feesPerYear: fees, creditsPerTerm: v.perTerm, termsPerYear: v.terms, grantsPerYear: v.grants });
      const rows: Array<[string, string]> = [
        [`${num(r.remaining)} credits × ${m(rate)}`, m(r.tuition)],
        [`Required fees, ${yrs(r.years)}`, fees > 0 ? m(r.fees) : 'not counted'],
      ];
      if (r.grants > 0) rows.push(['Your grants', `− ${m(r.grants)}`]);
      rows.push(['Time to finish at your pace', yrs(Math.round(r.yearsExact * 10) / 10)], ['Per month while you study', m(r.perMonth)]);
      return {
        head: [`Online ${L.name}: tuition and fees${r.grants > 0 ? ' after grants' : ''}`, m(r.net)],
        hyp: own ? `Assumes your price, ${num(v.perTerm)} credits a term and ${num(v.terms)} terms a year.` : `Assumes ${m(rate)} a credit, the median charge of ${md.what.replace(' (national median)', '')} among the ${num(N.nOnline)} colleges with online students (${IPEDS}), and ${num(v.perTerm)} credits a term, ${num(v.terms)} terms a year.`,
        alert: v.level === 2 && !own ? 'Graduate fees are not in the federal file: add them with “I know my school’s price”.' : undefined,
        rows, note: RATE_NOTE,
      };
    },
  },
  'credit-hour': {
    title: 'One price per credit: what a term and a year cost',
    exemple: `Example: the median public university price for residents, ${PACE.creditsPerTerm} credits a term`,
    cta: 'Cheapest online colleges', ctaPage: 'cheapest-online-colleges',
    inputs: [
      money('rate', 'Price per credit hour', N.medPub4, `Not sure? The median of public four-year colleges with online students, for their residents, is shown (${IPEDS}).`),
      count('perTerm', 'Credits you take per term', PACE.creditsPerTerm, 30, `One course is usually 3 credits. ${PACE_HELP}`),
      money('fees', 'Required fees per year', N.medFeePub4, 'Not sure? Leave the median shown.', true),
      { id: 'terms', label: 'Terms per year', def: PACE.termsPerYear, options: TERMS, avance: true },
    ],
    run: (v, touched = {}) => {
      const term = v.rate * v.perTerm + (v.terms > 0 ? v.fees / v.terms : 0);
      const year = term * v.terms;
      const eff = E.effPerCredit(v.rate, v.fees, v.perTerm * v.terms);
      const share = E.shareAtOrBelow(N.q, v.rate);
      return {
        head: [`One term at ${m(v.rate)} a credit, ${num(v.perTerm)} credits`, m(term)],
        hyp: `Fees of ${m(v.fees)} a year spread over ${num(v.terms)} terms.`,
        // The share is read on tuition per credit, so it is labelled with that price, never next to the fees-included one
        // (naive tester 3, 2026-11-14: « 46% of 2,343 » under $379 fees included, against 49% at $300 on another page).
        rows: [['One 3-credit course', m(3 * v.rate)], ['One year at this pace', m(year)], ['Real price per credit, fees included', m(eff)], [`Colleges charging ${m(v.rate)} a credit or less, before fees`, `${pct(share, 0)} of ${num(N.nQ)}`]],
        note: RATE_NOTE,
      };
    },
  },
  'cheap-pick': {
    title: 'The lowest public price for online study in your state',
    exemple: (v) => `Example: ${(STATES_B[v.st] ?? STATES_B[CHEAPEST_ST]).name}, the state of the cheapest college named above`,
    cta: 'Cheapest online bachelor’s degrees', ctaPage: 'cheapest-online-bachelors-degree',
    inputs: [
      // Opens on the state of the college the page's intro names (naive tester 2, 2026-11-14: intro on Lake Tahoe, tool on Texas).
      { id: 'st', label: 'Your state', def: CHEAPEST_ST, options: opt(STATES_B.map((s) => s.name)) },
      count('credits', 'Credits you need', P.credits.associate, 200, 'An associate degree is about 60 credits, a bachelor’s about 120.'),
    ],
    run: (v, touched = {}) => {
      const s = STATES_B[v.st] ?? STATES_B[CHEAPEST_ST];
      const a = s.cheapest, b = s.cheapest4;
      if (!a) return { head: [`${s.name}: no public college reports a price per credit`, '—'], rows: [], note: 'Some colleges charge a flat price per term and report no per-credit charge.' };
      return {
        head: [`${s.name}: ${num(v.credits)} credits at ${shortName(a.n)}, fees included`, m(a.eff * v.credits)],
        hyp: `Assumes ${m(a.h2)} a credit for state residents plus ${m(a.f2 ?? 0)} of fees a year spread over 30 credits: ${m2(a.eff)} a credit.`,
        alert: a.lvl === 2 && v.credits > 70 ? 'A community college stops at the associate degree: the four-year line below is the one for a bachelor’s.' : undefined,
        rows: [
          // Cents kept: $157 × 60 read as $9,420 against $9,392 printed (naive tester 2, 2026-11-14); $156.53 × 60 = $9,392.
          ['Lowest price per credit with fees', m2(a.eff)],
          [`Finished within 8 years at ${shortName(a.n)}`, a.om8 != null ? pct(a.om8, 0) : 'not reported'],
          ['Lowest four-year university', b ? `${shortName(b.n)}, ${m2(b.eff)} a credit` : 'none reports a per-credit charge'],
          ['Same credits there', b ? m(b.eff * v.credits) : '—'],
        ],
        note: `Public colleges with 50 or more fully online students, prices for state residents. ${RATE_NOTE}`,
      };
    },
  },
  'cheap-bachelor': {
    title: 'A 120-credit bachelor’s at a low-cost university',
    exemple: 'Example: a resident of the state',
    cta: 'In-state or out-of-state: the gap', ctaPage: 'out-of-state-online-tuition',
    inputs: [
      { id: 'school', label: 'University', def: 0, options: opt(CHEAP4_B.slice(0, 15).map((c) => `${shortName(c.n)} (${c.st})`)) },
      { id: 'res', label: 'You live', def: 0, options: opt(['In the same state', 'In another state']) },
      count('transfer', 'Credits you already have', 0, 120, 'Not sure? Leave 0.', true),
    ],
    run: (v, touched = {}) => {
      const c = CHEAP4_B[v.school] ?? CHEAP4_B[0];
      const out = v.res === 1;
      const rate = out ? (c.h3 ?? c.h2 ?? 0) : (c.h2 ?? 0);
      const r = degreeAtPace(rate, c.f2 ?? 0, P.credits.bachelor, v.transfer);
      return {
        head: [`${shortName(c.n)}, ${out ? 'from another state' : 'state resident'}`, m(r.net)],
        hyp: `Assumes ${m(rate)} a credit, ${m(c.f2 ?? 0)} of fees a year and 30 credits a year.`,
        rows: [[`${num(r.remaining)} credits × ${m(rate)}`, m(r.tuition)], [`Fees, ${yrs(r.years)}`, m(r.fees)], ['Students studying fully online', c.exc ? num(c.exc) : 'not reported'], ['Finished within 8 years of starting', c.om8 != null ? pct(c.om8, 0) : 'not reported']],
        note: RATE_NOTE,
      };
    },
  },
  'out-of-state': {
    title: 'The out-of-state premium on your degree',
    exemple: 'Example: the two public medians',
    cta: 'Online colleges by state', ctaPage: 'online-colleges-by-state',
    inputs: [
      money('inRate', 'Price per credit for residents', N.medPub4, 'Not sure? The public four-year median is shown.'),
      money('outRate', 'Price per credit from another state', N.medPub4out, 'On the same tuition page, “non-resident” or “out-of-state”.'),
      count('credits', 'Credits you still need', P.credits.bachelor, 200),
    ],
    run: (v, touched = {}) => {
      const g = E.creditGap(v.inRate, v.outRate, v.credits);
      return {
        head: [`Extra cost of studying from another state, ${num(v.credits)} credits`, m(Math.max(0, g.total))],
        hyp: `Assumes ${m(v.inRate)} against ${m(v.outRate)} a credit, fees left out.`,
        rows: [['Extra per credit', m(Math.max(0, g.perCredit))], ['Out-of-state price ÷ resident price', `${formatNumber(g.ratio, 1)} times`], ['Public four-year colleges charging everyone the same', `${num(NX.nSameOut)} of ${num(NX.nPub4Out)}`]],
        note: RATE_NOTE,
      };
    },
  },
  afford: {
    title: 'The price per credit your budget can carry',
    exemple: 'Example: $400 a month',
    cta: 'Cheapest online colleges', ctaPage: 'cheapest-online-colleges',
    inputs: [
      money('budget', 'What you can pay each month', 400, 'Your own figure: what is left each month after rent and bills.'),
      count('credits', 'Credits per year', PACE_YEAR, 60, PACE_HELP),
      money('grants', 'Grants per year', 0, 'Pell, state or employer money you do not repay. Not sure? Leave 0.'),
      money('fees', 'Required fees per year', N.medFeePub4, 'Not sure? Leave the median shown.', true),
    ],
    run: (v, touched = {}) => {
      const x = E.affordablePerCredit(v.budget, v.credits, v.fees, v.grants);
      const share = E.shareAtOrBelow(N.q, x);
      return {
        head: ['Highest price per credit you can pay', m(Math.floor(x))],
        hyp: `Assumes ${m(v.budget)} a month for 12 months, ${num(v.credits)} credits a year and ${m(v.fees)} of fees.`,
        alert: x <= 0 ? 'The fees alone take the whole budget: lower the credits per year or add a grant.' : undefined,
        rows: [['Your year of study', m(12 * v.budget + v.grants)], [`Colleges charging ${m(Math.floor(Math.max(0, x)))} a credit or less, before fees`, `${pct(share, 0)} of ${num(N.nQ)}`], ['Median public university price for residents', m(N.medPub4)]],
        note: `Share read on the per-credit charges of colleges with 50 or more fully online students (${IPEDS}).`,
      };
    },
  },
  'fafsa-grant': {
    title: 'A year at a large online school, after your grants',
    exemple: 'Example: no grant counted',
    cta: 'How to read the federal figures', ctaPage: 'method',
    inputs: [
      { id: 'school', label: 'School', def: 1, options: pickFeatured },
      count('credits', 'Credits per year', PACE_YEAR, 60, PACE_HELP),
      money('grant', 'Grants you expect per year', 0, 'Your Pell Grant and any state grant, from your aid offer. Not sure? Leave 0.'),
    ],
    run: (v, touched = {}) => {
      const f = FEATURED_B[v.school] ?? FEATURED_B[0];
      const t = featuredTuition(f, v.credits);
      const year = (f.h2 ? f.h2 * v.credits : f.t2 ?? 0) + (f.f2 ?? 0);
      const c = E.coverage(year, v.grant);
      return {
        head: [`${shortName(f.n)}: one year, ${num(v.credits)} credits${v.grant ? ', after grants' : ''}`, m(c.left)],
        hyp: `Assumes ${t.how} and ${m(f.f2 ?? 0)} of fees a year.`,
        rows: [['Grants cover', pct(c.share, 0)], ['Students who receive a Pell Grant here', f.pell != null ? pct(f.pell, 0) : 'not reported'], ['Median federal debt when leaving', f.debt ? m(f.debt) : 'not reported']],
        note: `Pell share and debt: College Scorecard, released ${P.scorecard.release}. Charges: ${IPEDS}.`,
      };
    },
  },
  transfer: {
    title: 'What your earlier credits save you',
    exemple: 'Example: 30 credits, all accepted',
    cta: 'Online bachelor’s degree: pace and cost', ctaPage: 'online-bachelors-degree',
    inputs: [
      count('earned', 'Credits you earned elsewhere', 30, 200, 'From your transcript: a community college, an earlier university, an exam.'),
      { id: 'accepted', label: 'Share the new school accepts', def: 100, unit: '%', max: 100, help: 'Not sure? Try 100, then 50: schools decide credit by credit.' },
      money('rate', 'Price per credit at the new school', N.medPub4, 'Not sure? The median of public universities for their residents is shown.'),
      count('program', 'Credits the degree requires', P.credits.bachelor, 200, undefined, true),
    ],
    run: (v, touched = {}) => {
      const acc = Math.min(v.program, Math.round((v.earned * Math.min(100, v.accepted)) / 100));
      const s = E.transferSavings(acc, v.rate, PACE.creditsPerTerm);
      return {
        head: [`Saved with ${num(acc)} credits accepted`, m(s.dollars)],
        hyp: `Assumes ${m(v.rate)} a credit and terms of ${num(PACE.creditsPerTerm)} credits, the pace every calculator of this site starts from.`,
        rows: [['Credits left to take', num(Math.max(0, v.program - acc))], ['Terms saved', formatNumber(s.terms, 1)], ['Credits not accepted', num(Math.max(0, v.earned - acc))]],
        note: 'Each school decides which credits it accepts; the federal files say nothing about transfer policies.',
      };
    },
  },
  'grad-rate': {
    title: 'Out of 100 students who start: who finishes?',
    exemple: 'Example: the median of mostly online colleges',
    cta: 'Largest online universities compared', ctaPage: 'largest-online-universities',
    inputs: [
      { id: 'school', label: 'School', def: -1, options: [{ value: '-1', label: 'Median of mostly online colleges' }, ...pickFeatured] },
      money('year', 'What one year costs you', N.medPub4 * PACE_YEAR + N.medFeePub4, `Not sure? ${PACE_YEAR} credits at the median public university price for residents, with fees.`),
    ],
    run: (v, touched = {}) => {
      const f = v.school >= 0 ? FEATURED_B[v.school] : null;
      const rate = f ? f.om8 : N.medOm8Online;
      const who = f ? shortName(f.n) : 'Mostly online colleges, median';
      if (rate == null) return { head: [who, 'not reported'], rows: [], note: 'College Scorecard has no 8-year award rate for this school.' };
      const fin = E.finishers(100, rate);
      return {
        head: [`${who}: students with a degree or certificate 8 years after starting`, `${num(fin)} of 100`],
        hyp: `Finished within 8 years: ${pct(rate, 0)} of all entering students, College Scorecard.`,
        rows: [['Colleges with mostly on-campus students, median', `${num(E.finishers(100, N.medOm8Campus))} of 100`], ['Spent by a student who leaves after one year', m(v.year)], ['After two years', m(2 * v.year)]],
        note: `Students who entered in 2017-18, followed for eight years (College Scorecard, released ${P.scorecard.release}).`,
      };
    },
  },
  'grad-cost': {
    title: 'Online master’s degree: tuition by type of school',
    exemple: 'Example: 36 credits at the public median',
    cta: 'Price per credit, by college', ctaPage: 'cost-per-credit-hour',
    inputs: [
      { id: 'sector', label: 'Type of school', def: 0, options: SECTOR_OPTS },
      { ...money('rate', 'Your program’s price per credit', N.medGradPub), showIf: (v) => v.sector === 4 },
      count('credits', 'Credits in the program', P.credits.master, 90, 'Most master’s degrees ask for 30 to 36 credits; MBAs and some others more.'),
      money('employer', 'Employer tuition help per year', 0, 'Not sure? Leave 0.'),
      count('perYear', 'Credits per year', 18, 40, 'Master’s pages start at 18 credits a year, two courses in each of three terms, a common pace for working students; it changes the time, not the tuition.', true),
      money('fees', 'Required fees per year', 0, 'From the school’s tuition page; the federal file has no graduate fee.', true),
    ],
    run: (v, touched = {}) => {
      const md = median(2, v.sector);
      const rate = v.sector === 4 ? v.rate : md.rate;
      const r = E.degreeCost({ perCredit: rate, credits: v.credits, transfer: 0, feesPerYear: v.fees, creditsPerTerm: v.perYear, termsPerYear: 1, grantsPerYear: v.employer });
      return {
        head: [`Master’s degree, ${num(v.credits)} credits${r.grants ? ', after employer help' : ''}`, m(r.net)],
        hyp: v.sector === 4 ? `Assumes your price of ${m(rate)} a credit, ${num(v.perYear)} credits a year.` : `Assumes the median graduate charge of ${md.what}, ${m(rate)} a credit (${IPEDS}), ${num(v.perYear)} credits a year.`,
        alert: v.fees > 0 ? undefined : 'Fees not counted: add them under “More about your case”.',
        rows: [['Tuition', m(r.tuition)], ['Time to finish', yrs(r.years)], ['Employer help', r.grants ? `− ${m(r.grants)}` : 'none typed']],
        note: RATE_NOTE,
      };
    },
  },
  'two-plus-two': {
    title: 'Associate first, then a bachelor’s: what the route saves',
    exemple: 'Example: the two public medians',
    cta: 'Online bachelor’s degree: pace and cost', ctaPage: 'online-bachelors-degree',
    inputs: [
      money('cc', 'Community college price per credit', N.medPub2d, 'Not sure? The median for residents of the college’s district is shown.'),
      money('uni', 'University price per credit', N.medPub4, 'Not sure? The public median for state residents is shown.'),
      count('ccCredits', 'Credits taken at the community college', P.credits.associate, 120, 'An associate degree is about 60 credits.'),
    ],
    run: (v, touched = {}) => {
      const r = E.twoPlusTwo(v.cc, v.uni, v.ccCredits, P.credits.bachelor);
      return {
        head: [`Saved on a 120-credit bachelor’s by starting at a community college`, m(Math.max(0, r.saved))],
        hyp: `Assumes all ${num(Math.min(v.ccCredits, P.credits.bachelor))} credits transfer; fees left out.`,
        rows: [['Associate route, tuition', m(r.route)], ['All at the university', m(r.direct)], ['The associate degree alone', m(Math.min(v.ccCredits, P.credits.bachelor) * v.cc)]],
        note: RATE_NOTE,
      };
    },
  },
  'bachelor-pace': {
    title: 'Your pace, your years, your bill',
    exemple: `Example: ${PACE.creditsPerTerm} credits a term, ${PACE.termsPerYear} terms a year, the pace every calculator starts from`,
    cta: 'What earlier credits save', ctaPage: 'accredited-online-colleges',
    inputs: [
      { id: 'perTerm', label: 'Credits per term', def: PACE.creditsPerTerm, options: [6, 9, 12, 15].map((n) => ({ value: String(n), label: `${n} credits (${n / 3} courses)` })) },
      { id: 'terms', label: 'Terms per year', def: PACE.termsPerYear, options: TERMS },
      money('rate', 'Price per credit', N.medPub4, 'Not sure? The public median for residents is shown.'),
      count('transfer', 'Credits you already have', 0, 120, 'Not sure? Leave 0.', true),
      money('fees', 'Required fees per year', N.medFeePub4, undefined, true),
    ],
    run: (v, touched = {}) => {
      const r = E.degreeCost({ perCredit: v.rate, credits: P.credits.bachelor, transfer: v.transfer, feesPerYear: v.fees, creditsPerTerm: v.perTerm, termsPerYear: v.terms, grantsPerYear: 0 });
      return {
        head: [`Years to a bachelor’s at ${num(v.perTerm * v.terms)} credits a year`, yrs(Math.round(r.yearsExact * 10) / 10)],
        hyp: `Assumes ${num(r.remaining)} credits at ${m(v.rate)}, ${m(v.fees)} of fees a year.`,
        rows: [['Tuition', m(r.tuition)], [`Fees, ${yrs(r.years)}`, m(r.fees)], ['Total', m(r.gross)], ['Per month', m(r.perMonth)]],
        note: 'Fees are charged per year enrolled: a faster pace pays fewer years of them.',
      };
    },
  },
  state: {
    title: 'Online colleges in your state',
    exemple: 'Example: Texas',
    cta: 'In-state or out-of-state: the gap', ctaPage: 'out-of-state-online-tuition',
    inputs: [
      { id: 'st', label: 'State', def: TX, options: opt(STATES_B.map((s) => s.name)) },
      count('credits', 'Credits you need', P.credits.bachelor, 200),
    ],
    run: (v, touched = {}) => {
      const s = STATES_B[v.st] ?? STATES_B[TX];
      const eff = s.medEffPub ?? 0;
      return {
        head: [`${s.name}: ${num(v.credits)} credits at the median public price, fees included`, eff ? m(eff * v.credits) : 'not reported'],
        hyp: `Median of the ${num(s.nPub)} public colleges of the state with online students, community colleges included, for state residents.`,
        rows: [
          ['Colleges with 50+ fully online students', num(s.nOnline)],
          ['Lowest public price with fees', s.cheapest ? `${m(s.cheapest.eff)} a credit, ${shortName(s.cheapest.n)}` : 'none reported'],
          ['Students fully online', s.share != null ? pct(s.share, 0) : 'not reported'],
          ['Median award rate after 8 years', s.medOm8 != null ? pct(s.medOm8, 0) : 'not reported'],
        ],
        note: `Price with fees = in-state charge per credit plus yearly fees ÷ 30 (${IPEDS}).`,
      };
    },
  },
  'school-compare': {
    title: 'Two online universities side by side',
    exemple: 'Example: the two largest by online enrollment',
    cta: 'Graduation rates of online colleges', ctaPage: 'online-college-graduation-rates',
    inputs: [
      { id: 'a', label: 'First school', def: 0, options: pickFeatured },
      { id: 'b', label: 'Second school', def: 1, options: pickFeatured },
      count('credits', 'Credits you need', P.credits.bachelor, 200),
    ],
    run: (v, touched = {}) => {
      const A = FEATURED_B[v.a] ?? FEATURED_B[0];
      const B = FEATURED_B[v.b] ?? FEATURED_B[1];
      const ta = featuredTuition(A, v.credits), tb = featuredTuition(B, v.credits);
      const ca = ta.tuition + ta.years * (A.f2 ?? 0), cb = tb.tuition + tb.years * (B.f2 ?? 0);
      const cheaper = ca <= cb ? shortName(A.n) : shortName(B.n);
      // Tour 2 and 3 (naive testers, 2026-11-14): the gap as the big figure still read as a price. The big figure is now
      // the first school's price; the second school's price comes next, then the difference, named as such.
      return {
        head: [`${shortName(A.n)}: ${num(v.credits)} credits, fees included`, m(ca)],
        hyp: `${shortName(A.n)}: ${ta.how}, ${m(A.f2 ?? 0)} of fees a year. ${shortName(B.n)}: ${tb.how}, ${m(B.f2 ?? 0)} of fees a year.`,
        rows: [[`${shortName(B.n)}: same credits, fees included`, m(cb)], [ca === cb ? 'Difference' : `Difference: ${cheaper} costs less by`, m(Math.abs(ca - cb))], [`Finished within 8 years, ${shortName(A.n)}`, A.om8 != null ? pct(A.om8, 0) : 'not reported'], [`Finished within 8 years, ${shortName(B.n)}`, B.om8 != null ? pct(B.om8, 0) : 'not reported']],
        note: `${RATE_NOTE} Finished within 8 years: share of students who started in ${P.scorecard.awardCohort} with a degree or certificate 8 years later (College Scorecard).`,
      };
    },
  },
};

/* Online programs by field (IPEDS C2024DEP): one calculator per field, the same engine as the degree calculator,
   with the median charge of the colleges that offer that field fully online at the chosen level. */
const LEVEL_NAME: Record<string, string> = { cert: 'certificate', assoc: 'associate degree', bach: 'bachelor’s degree', mast: 'master’s degree', docr: 'research doctorate (PhD)', docp: 'professional doctorate' };
const LEVEL_CREDITS: Record<string, number> = { cert: P.credits.certificate, assoc: P.credits.associate, bach: P.credits.bachelor, mast: P.credits.master, docr: P.credits.doctorate, docp: P.credits.doctorate };
const DEP = `IPEDS ${P.programs.file}, ${P.programs.completionsYear}`;
interface FieldCfg { key: string; field: string; title: string; exemple: string; cta: string; ctaPage: string; levels: string[]; main: string; levelLabel?: Record<string, string>; creditsHelp: string; transferHelp: string }
function progSpec(c: FieldCfg): MiniSpec {
  const F = PROG_B[c.key];
  const lv = (v: Record<string, number>) => (c.levels.length > 1 ? c.levels[v.level] : c.levels[0]) ?? c.main;
  const lvName = (l: string) => c.levelLabel?.[l] ?? LEVEL_NAME[l];
  return {
    title: c.title, exemple: c.exemple, cta: c.cta, ctaPage: c.ctaPage,
    inputs: [
      ...(c.levels.length > 1 ? [{ id: 'level', label: 'Level', def: Math.max(0, c.levels.indexOf(c.main)), options: opt(c.levels.map((l) => `${lvName(l).charAt(0).toUpperCase()}${lvName(l).slice(1)} (${num(F.levels[l]?.n ?? 0)} colleges)`)) }] : []),
      { id: 'st', label: 'Your state', def: TX, options: opt(STATES_B.map((s) => s.name)) },
      { id: 'sector', label: 'Type of school', def: 0, options: SECTOR_OPTS, help: 'Not sure? Keep “Public, in-state price”: the median charge of the public colleges that offer this program fully online.' },
      { ...money('rate', 'Your program’s price per credit', N.medPub4, 'On the program’s tuition page, “per credit hour”.'), showIf: (v) => v.sector === 4 },
      ...c.levels.map((l, i): MiniInput => ({ id: `cr${i}`, label: `Credits in the ${lvName(l).replace(/ \(.*\)$/, '')}`, def: LEVEL_CREDITS[l], max: 200, help: c.creditsHelp, ...(c.levels.length > 1 ? { showIf: (v: Record<string, number>) => (v.level ?? 0) === i } : {}) })),
      count('transfer', 'Credits you already have (transfer)', 0, 200, c.transferHelp, true),
      money('grants', 'Grants or employer help per year', 0, 'Money you do not repay. Not sure? Leave 0.', true),
      count('perYear', 'Credits per year', 18, 40, 'Program pages start at 18 credits a year, two courses in each of three terms, a common pace for working students; it changes the time, not the tuition.', true),
    ],
    run: (v, touched = {}) => {
      const l = lv(v);
      const L = F.levels[l];
      const s = STATES_B[v.st] ?? STATES_B[TX];
      const here = L?.st[s.code];
      const md = L?.med;
      const rate = v.sector === 4 ? v.rate : v.sector === 0 ? md?.pub : v.sector === 1 ? md?.pubOut : v.sector === 2 ? md?.npf : md?.fp;
      const credits = v[`cr${Math.max(0, c.levels.indexOf(l))}`] ?? LEVEL_CREDITS[l];
      const what = ['public price for residents', 'public price for out-of-state students', 'private nonprofit price', 'for-profit price', ''][v.sector] ?? '';
      if (!rate) return { head: [`${c.field}, ${lvName(l)}: no median for this type of school`, '—'], rows: [], note: `No college of this type offering it fully online reports a per-credit charge (${IPEDS}).` };
      const r = E.degreeCost({ perCredit: rate, credits, transfer: v.transfer, feesPerYear: 0, creditsPerTerm: v.perYear, termsPerYear: 1, grantsPerYear: v.grants });
      const rows: Array<[string, string]> = [
        [`${num(r.remaining)} credits × ${m(rate)}`, m(r.tuition)],
        ...(r.grants ? [['Grants and employer help', `− ${m(r.grants)}`] as [string, string]] : []),
        ['Time to finish at your pace', yrs(Math.round(r.yearsExact * 10) / 10)],
        [`Colleges in ${s.name} offering it fully online`, here ? num(here[0]) : 'none in the file'],
        [`Lowest public price in ${s.name}${l === 'mast' || l.startsWith('doc') ? '' : ', fees included'}`, here && here[1] && here[2] ? `${m(here[2])} a credit, ${shortName(here[1])}` : 'no public college reports one'],
        ['Colleges offering it fully online, whole country', num(L?.n ?? 0)],
      ];
      return {
        head: [`Online ${c.field.toLowerCase()} ${lvName(l)}: tuition${r.grants ? ' after grants' : ''}`, m(r.net)],
        hyp: v.sector === 4 ? `Assumes your price of ${m(rate)} a credit, fees not counted, ${num(v.perYear)} credits a year.` : `Assumes the median ${what} at colleges offering it fully online, ${m(rate)} a credit (${IPEDS}), ${num(v.perYear)} credits a year.`,
        alert: 'Required and program fees are not counted: add them from the school’s tuition page.',
        rows, note: `Programs that can be completed entirely online: ${DEP}. ${RATE_NOTE}`,
      };
    },
  };
}
const FIELD_CFG: FieldCfg[] = [
  { key: 'nursing', field: 'Nursing', title: 'Online nursing program: tuition at the colleges that offer it', exemple: 'Example: a bachelor’s in nursing at the public median, Texas', cta: 'Online master’s degree prices', ctaPage: 'online-masters-degree', levels: ['assoc', 'bach', 'mast', 'docp'], main: 'bach', levelLabel: { assoc: 'associate degree (ADN)', bach: 'bachelor’s (BSN, mostly RN to BSN)', mast: 'master’s (MSN)', docp: 'doctorate (DNP)' }, creditsHelp: 'The program sheet gives the total. An RN to BSN counts your earlier nursing credits: type them as transfer credits.', transferHelp: 'Credits from your associate degree or diploma that the school accepts.' },
  { key: 'mba', field: 'MBA', title: 'Online MBA: tuition at the median graduate price', exemple: 'Example: 36 credits at the public median, Texas', cta: 'Online master’s degree prices', ctaPage: 'online-masters-degree', levels: ['mast'], main: 'mast', creditsHelp: 'Many MBAs ask for 30 to 48 credits: read the program sheet.', transferHelp: 'Graduate credits the school accepts, often capped at a few courses.' },
  { key: 'accounting', field: 'Accounting', title: 'Online accounting degree: what it costs at your level', exemple: 'Example: a bachelor’s at the public median, Texas', cta: 'Cheapest online bachelor’s degrees', ctaPage: 'cheapest-online-bachelors-degree', levels: ['cert', 'assoc', 'bach', 'mast'], main: 'bach', creditsHelp: 'A bachelor’s is about 120 credits. For the CPA, your state board of accountancy sets the credit hours it asks for.', transferHelp: 'Credits from an earlier college that the school accepts.' },
  { key: 'medassist', field: 'Medical assistant', title: 'Online medical assistant program: tuition by state', exemple: 'Example: a certificate at the public median, Texas', cta: 'Online associate degree prices', ctaPage: 'online-associates-degree', levels: ['cert', 'assoc'], main: 'cert', creditsHelp: 'Certificates run from under 20 to more than 40 credits: read the program sheet.', transferHelp: 'Credits from an earlier college that the school accepts.' },
  { key: 'healthadmin', field: 'Healthcare administration', title: 'Masters in healthcare administration: tuition by school type', exemple: 'Example: a master’s at the public median, Texas', cta: 'Online master’s degree prices', ctaPage: 'online-masters-degree', levels: ['bach', 'mast', 'docr'], main: 'mast', creditsHelp: 'Master’s programs in this field ask for about 36 to 60 credits: read the program sheet.', transferHelp: 'Graduate credits the school accepts.' },
  { key: 'phd', field: 'Doctoral', title: 'Online PhD: tuition at the median graduate price', exemple: 'Example: 60 credits at the public median, Texas', cta: 'Online master’s degree prices', ctaPage: 'online-masters-degree', levels: ['docr'], main: 'docr', creditsHelp: '60 is a round starting value: doctoral programs range widely, and the program sheet gives the real number.', transferHelp: 'Credits from a master’s degree that the program accepts.' },
  { key: 'coding', field: 'Medical billing and coding', title: 'Medical billing and coding online program: tuition', exemple: 'Example: a certificate at the public median, Texas', cta: 'Online associate degree prices', ctaPage: 'online-associates-degree', levels: ['cert', 'assoc'], main: 'cert', creditsHelp: 'Certificates run from about 15 to more than 40 credits: read the program sheet.', transferHelp: 'Credits from an earlier college that the school accepts.' },
  { key: 'all', field: 'College', title: 'An online program at the colleges that offer it', exemple: 'Example: a bachelor’s at the public median, Texas', cta: 'Online colleges by state', ctaPage: 'online-colleges-by-state', levels: ['cert', 'assoc', 'bach', 'mast', 'docr', 'docp'], main: 'bach', creditsHelp: 'An associate degree is about 60 credits, a bachelor’s about 120, a master’s 30 to 36.', transferHelp: 'Credits from an earlier college that the school accepts.' },
];
for (const c of FIELD_CFG) SPECS[`prog-${c.key}`] = progSpec(c);
const LAW = PROG_B.law;
const LAW_ONLINE = (LAW.online ?? []).filter((r) => (r.t ?? 0) >= 5000);
SPECS['law-jd'] = {
  title: 'A JD with online study: tuition and fees for the whole degree',
  exemple: 'Example: the median of law schools with an online JD, three years',
  cta: 'Online master’s degree prices', ctaPage: 'online-masters-degree',
  inputs: [
    { id: 'school', label: 'Law school', def: -1, options: [{ value: '-1', label: 'Median of law schools with an online JD' }, { value: '-2', label: 'Median of all public law schools, residents' }, { value: '-3', label: 'Median of all private nonprofit law schools' }, ...LAW_ONLINE.map((r, i) => ({ value: String(i), label: `${shortName(r.n)} (${r.st})` }))] },
    { id: 'years', label: 'Years to finish', def: P.programs.lawYears, max: 6, help: 'Three years is usual full time; part-time and online programs often take four.' },
    { id: 'res', label: 'You live', def: 0, options: opt(['In the school’s state', 'In another state']) },
    money('grants', 'Scholarship per year', 0, 'From the school’s offer. Not sure? Leave 0.', true),
  ],
  run: (v, touched = {}) => {
    const med = LAW.tuition!;
    const onl = LAW_ONLINE.map((r) => r.t ?? 0).sort((a, b) => a - b);
    const mOnl = onl.length ? (onl.length % 2 ? onl[(onl.length - 1) / 2] : (onl[onl.length / 2 - 1] + onl[onl.length / 2]) / 2) : 0;
    const r = v.school >= 0 ? LAW_ONLINE[v.school] : null;
    const tuition = r ? (v.res === 1 ? r.to ?? r.t ?? 0 : r.t ?? 0) : v.school === -2 ? (v.res === 1 ? med.medPubOut : med.medPub) : v.school === -3 ? med.medNpf : mOnl;
    const fee = r ? r.f ?? 0 : med.medFee;
    const who = r ? shortName(r.n) : v.school === -2 ? 'Public law schools, median' : v.school === -3 ? 'Private nonprofit law schools, median' : 'Law schools with an online JD, median';
    const years = Math.max(1, Math.min(6, v.years));
    const total = Math.max(0, years * (tuition + fee - v.grants));
    return {
      head: [`${who}: JD tuition and fees, ${yrs(years)}`, m(total)],
      hyp: `Assumes ${m(tuition)} of tuition and ${m(fee)} of required fees a year (${IPEDS}, law program).`,
      alert: 'The federal college survey does not record bar admission rules: a JD from a law school without ABA approval may not let you sit the bar exam outside its state.',
      rows: [['Tuition per year', m(tuition)], ['Required fees per year', m(fee)], ['Scholarship', v.grants ? `− ${m(v.grants * years)}` : 'none typed'], ['Law schools reporting a JD price', num(med.n)]],
      note: `Yearly JD tuition and fees reported to IPEDS for ${P.ipeds.chargesYear}; online JD: ${DEP}.`,
    };
  },
};

export function getSpec(kind: string, _lang?: string): MiniSpec {
  const s = SPECS[kind];
  if (!s) throw new Error(`Unknown mini spec: ${kind}`);
  return s;
}
export const SPEC_IDS = Object.keys(SPECS);
export { sector };
