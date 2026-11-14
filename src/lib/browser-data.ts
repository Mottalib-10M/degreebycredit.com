/**
 * The few federal rows the calculators need in the browser (about 70 KB of JSON in all): national medians and
 * percentiles, the 20 largest online schools, the cheapest lists and one line per state. The full list of 3,801
 * colleges (colleges.json, 2 MB) stays server-side in `lib/data.ts`.
 */
import metaRaw from '../data/data-meta.json';
import featuredRaw from '../data/featured.json';
import cheapestRaw from '../data/cheapest.json';
import cheapest4Raw from '../data/cheapest4.json';
import cheapestOutRaw from '../data/cheapest-out.json';
import statesRaw from '../data/states.json';

export interface Row { u: number; n: string; st: string; ctrl: number; lvl: number; exc: number | null; share: number | null; h2: number | null; h3: number | null; h6: number | null; f2: number | null; om8: number | null; eff: number | null; effo?: number }
export interface FeaturedRow extends Row { acc: string | null; accc: string | null; t2: number | null; t3: number | null; f3: number | null; city: string; pell: number | null; debt: number | null; earn: number | null; np: number | null; ug25: number | null; tot: number | null }
export interface StateRow { code: string; name: string; nOnline: number; exc: number; tot: number; share: number | null; nPub: number; medPub: number | null; medNpf: number | null; medFp: number | null; medGrad: number | null; medEffPub: number | null; medOm8: number | null; medPremium: number | null; cheapest: { n: string; h2: number; f2: number | null; eff: number; lvl: number } | null; cheapest4: { n: string; h2: number; f2: number | null; eff: number } | null; largest: { n: string; exc: number; share: number } | null }

export const NATB = (metaRaw as any).national as {
  n: number; nOnline: number; nH2: number; medPub4: number; medPub2: number; medPub2d: number; medNpf4: number; medFp4: number; medPub4out: number; medPub2out: number;
  medGradPub: number; medGradNpf: number; medGradFp: number; medOm8Online: number; medOm8Campus: number; medFeePub4: number; medFeePub2: number; medFeeNpf4: number; medFeeFp4: number; q: number[]; nQ: number;
};
export const FEATURED_B = featuredRaw as FeaturedRow[];
export const CHEAP_B = cheapestRaw as Row[];
export const CHEAP4_B = cheapest4Raw as Row[];
export const CHEAPOUT_B = cheapestOutRaw as Row[];
export const STATES_B = Object.values(statesRaw as Record<string, StateRow>).sort((a, b) => a.name.localeCompare(b.name));

/** Display name of a school: the IPEDS name minus a campus suffix, with the two names readers search for. */
export const shortName = (name: string) => name
  .replace('Pennsylvania State University-World Campus', 'Penn State World Campus')
  .replace('Arizona State University Digital Immersion', 'ASU Online (Digital Immersion)')
  .replace(/-(Arizona|Illinois|Colorado Springs|Global Region)$/, '');
export const SECTOR = ['public', 'private nonprofit', 'private for-profit'];
export const sector = (ctrl: number) => SECTOR[ctrl - 1] ?? 'unknown sector';

/** Programs that can be completed fully online, by field and level: national medians and, per state, the number of
 *  colleges and the lowest public price (IPEDS C2024DEP with IC2023_AY charges, scripts/build-programs.py). */
import progRaw from '../data/programs-b.json';
export interface ProgLevelB { n: number; nPub: number; med: { pub: number | null; pubOut: number | null; npf: number | null; fp: number | null; pubEff: number | null }; st: Record<string, [number, string | null, number | null]> }
export const PROG_B = progRaw as unknown as Record<string, { levels: Record<string, ProgLevelB>; byState?: Record<string, [number, number]>; tuition?: { n: number; medPub: number; medPubOut: number; medNpf: number; medFee: number }; online?: Array<{ n: string; st: string; ctrl: number; t: number | null; f: number | null; to: number | null }> }>;
