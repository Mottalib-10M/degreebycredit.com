/** The parameter file, typed. Dates, file names, defaults and sources of every figure shown (RECETTE §4). */
import RAW from '../../data/params-2026.json';
export type SourceKey = keyof typeof RAW.sources;
export const P = RAW;
