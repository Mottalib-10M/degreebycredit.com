import { route, type Locale } from './routes';
import { PAGES, pageById } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Online degree cost calculator', method: 'Method and data', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
const GROUP_LABEL: Record<Group, string> = { program: 'Online programs by field: nursing, MBA, law, PhD', cost: 'Price per credit and the cheapest colleges', degree: 'Online degrees by level', choose: 'Choosing a school: accreditation, aid, completion' };
// Cost first (naive testers, 2026-11-14, tour 3): it is what most readers come for.
export const GROUPS_ORDER: Group[] = ['cost', 'program', 'degree', 'choose'];
export const groupLabel = (g: Group) => GROUP_LABEL[g];
export const label = (id: string, _lang: Locale = 'en') => CORE[id] ?? pageById(id)?.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
function categoriesCompletes(lang: Locale): NavCategory[] {
  return GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
// Top menu: one or two words each, never on two lines (full labels stay in the footer, RECETTE §10.3).
const COURT: Record<string, string> = { [GROUP_LABEL.program]: 'Programs', [GROUP_LABEL.cost]: 'Cost', [GROUP_LABEL.degree]: 'Degrees', [GROUP_LABEL.choose]: 'Choosing' };
export const navCategories = (lang: Locale, court = true): NavCategory[] =>
  categoriesCompletes(lang).map((c) => (court ? { ...c, label: COURT[c.label] ?? c.label } : c));
export const navDirect = (lang: Locale): NavLink[] => [{ href: route('home', lang), label: 'Home: degree cost calculator' }];
export const footerColumns = (lang: Locale): NavCategory[] => [...GROUPS_ORDER.map((g) => ({ label: GROUP_LABEL[g], links: inGroup(g, lang) })).filter((c) => c.links.length), { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
