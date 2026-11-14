/**
 * Server-side access to the federal data built by scripts/build-data.py. NEVER import this file from a
 * component that runs in the browser or from lib/mini-specs.ts: colleges.json weighs 2 MB. The pages pass
 * each calculator the few rows it needs through `ctx` (Tool.astro → MiniSim).
 */
import collegesRaw from '../data/colleges.json';
import statesRaw from '../data/states.json';
import metaRaw from '../data/data-meta.json';
import topRaw from '../data/top-by-state.json';
import featuredRaw from '../data/featured.json';
import cheapestRaw from '../data/cheapest.json';
import cheapest4Raw from '../data/cheapest4.json';
import cheapestOutRaw from '../data/cheapest-out.json';

export interface College {
  u: number; n: string; city: string; st: string; ctrl: number; lvl: number; cat: number | null;
  tot: number | null; exc: number | null; som: number | null; ugTot: number | null; ugExc: number | null; grTot: number | null; grExc: number | null;
  h1: number | null; h2: number | null; h3: number | null; h5: number | null; h6: number | null; h7: number | null;
  t2: number | null; f2: number | null; t3: number | null; f3: number | null;
  acc: string | null; accc: string | null; om8: number | null; om8ft: number | null; om8pt: number | null;
  pell: number | null; debt: number | null; gdebt: number | null; earn: number | null; ug25: number | null; np: number | null;
  ope: number | null; open: number | null; hcm2: number; donly: number; share: number | null;
}
/** Row handed to a browser calculator (top-by-state.json, cheapest.json). */
export interface Slim { u: number; n: string; st: string; ctrl: number; lvl: number; exc: number | null; share: number | null; h2: number | null; h3: number | null; h6: number | null; f2: number | null; om8: number | null; eff: number | null; effo?: number }
export interface Featured extends Slim { acc: string | null; accc: string | null; h1: number | null; h5: number | null; h7: number | null; t2: number | null; t3: number | null; f3: number | null; city: string; ug25: number | null; pell: number | null; debt: number | null; earn: number | null; om8ft: number | null; om8pt: number | null; grTot: number | null; grExc: number | null; ugTot: number | null; ugExc: number | null; np: number | null; open: number | null; tot: number | null; som: number | null }
export interface Ref { u: number; n: string; h2?: number; f2?: number | null; eff?: number; lvl?: number; exc?: number; share?: number }
export interface StateStats {
  code: string; name: string; n: number; nOnline: number; nWithCredit: number; tot: number; exc: number; som: number; share: number | null;
  nPub: number; nNpf: number; nFp: number; medPub: number | null; medNpf: number | null; medFp: number | null; medGrad: number | null;
  cheapest: Ref | null; cheapest4: Ref | null; largest: Ref | null; medEffPub: number | null; medPremium: number | null; nPremium: number; nNoPremium: number; medOm8: number | null; top: number[];
}
export interface National { n: number; nOnline: number; tot: number; exc: number; som: number; nH2: number; nH6: number; medPub4: number; medPub2: number; medPub2d: number; medNpf4: number; medFp4: number; medPub4out: number; medGradPub: number; medGradNpf: number; medGradFp: number; medOm8Online: number; medOm8Campus: number; nMostlyOnline: number; accreditors: Array<[string, number]>;
  medFeePub4: number; medFeePub2: number; medFeeNpf4: number; medFeeFp4: number; medPub2out: number; nPub4: number; nPub2: number; nNpf4: number; nFp4: number; nSameOut: number; nPub4Out: number; nOm8Online: number; nOm8Campus: number; nAcc: number; nNoAcc: number; nPellData: number; medPellOnline: number; medDebtOnline: number; medEarnOnline: number; medNpOnline: number; nNpOnline: number; q: number[]; nQ: number }

export const COLLEGES = collegesRaw as College[];
export const STATES = statesRaw as Record<string, StateStats>;
export const STATE_CODES = Object.keys(STATES);
export const NAT = (metaRaw as { national: National }).national;
export const META = metaRaw as { built: string; ipedsYear: string; ipedsFall: string; hdYear: string; scorecardRelease: string };
export const TOP_BY_STATE = topRaw as Record<string, Slim[]>;
export const FEATURED = featuredRaw as Featured[];
export const CHEAPEST = cheapestRaw as Slim[];
export const CHEAPEST4 = cheapest4Raw as Slim[];
export const CHEAPEST_OUT = cheapestOutRaw as Slim[];

const byIdMap = new Map(COLLEGES.map((c) => [c.u, c]));
export const byId = (u: number) => byIdMap.get(u);
export const stateName = (code: string) => STATES[code]?.name ?? code;
export const stateSlug = (code: string) => stateName(code).toLowerCase().replace(/[^a-z]+/g, '-');
/** URL slug of a school page: letters of its IPEDS name, campus suffix dropped (“University of Phoenix-Arizona” → university-of-phoenix). */
export function schoolSlug(name: string): string {
  return name.replace(/-(Arizona|Illinois|Colorado Springs|Main Campus|World Campus|Global Region)$/, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
export { shortName } from './browser-data';
export const inState = (code: string) => COLLEGES.filter((c) => c.st === code);
/** Schools of a state with at least 50 fully online students, largest first. */
export const onlineInState = (code: string) => inState(code).filter((c) => (c.exc ?? 0) >= 50).sort((a, b) => (b.exc ?? 0) - (a.exc ?? 0));
export const accreditorOf = (c: Pick<College, 'acc'>) => (c.acc && c.acc !== 'NA' ? c.acc : null);

// Programs that can be completed fully online, by field and level (IPEDS C2024DEP, scripts/build-programs.py).
import programsRaw from '../data/programs.json';
export type ProgLevel = 'cert' | 'assoc' | 'bach' | 'mast' | 'docr' | 'docp';
export interface ProgRow { u: number; n: string; st: string; ctrl: number; lvl: number; p: number | null; po: number | null; pe: number | null; f2: number | null; exc: number | null; om8: number | null; k: number }
export interface ProgMed { pub: number | null; pubOut: number | null; npf: number | null; fp: number | null; pubEff: number | null }
export interface ProgLevelStats { nOffer: number; nOnline: number; nPub: number; nNpf: number; nFp: number; nPriced: number; nPrograms: number; nStates: number; med: ProgMed; cheapest: ProgRow[]; cheapestPub: ProgRow[]; most: ProgRow[]; states: Record<string, { n: number; nPub: number; low: { n: string; p: number } | null }> }
export interface ProgField { levels: Partial<Record<ProgLevel, ProgLevelStats>> }
export interface LawRow { u: number; n: string; st: string; ctrl: number; exc: number | null; t: number | null; f: number | null; to: number | null; h6: number | null }
export const PROGRAMS = programsRaw as unknown as Record<'nursing' | 'mba' | 'accounting' | 'medassist' | 'healthadmin' | 'phd' | 'coding', ProgField> & {
  law: ProgField & { tuition: { n: number; nPub: number; nNpf: number; medPub: number; medPubOut: number; medNpf: number; medFee: number }; online: LawRow[]; medOnline: number };
  phd: ProgField & { families: Array<[string, number]> };
  all: ProgField & { nAnyOnline: number; nAny: number; programsOnline: number; programs: number; byState: Record<string, [number, number]>; top: Array<{ u: number; n: string; st: string; ctrl: number; lvl: number; k: number; p: number; h2: number | null; h6: number | null; exc: number | null; om8: number | null }> };
};
