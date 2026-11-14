import type { Locale } from './routes';
import { P } from '../lib/engine/params';
const en = {
  updatedOn: 'Page updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Federal files read and totals checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Questions students ask before they enroll', relatedCalculators: 'Related pages', sourcesTitle: 'Federal files and pages behind this page', writtenBy: 'Totals worked out by',
  asOf: `Prices colleges reported for ${P.ipeds.chargesYear}, the latest federal figures · edition`, lastUpdated: 'page updated on', footerValidated: 'Charges, enrollment and outcomes read in the federal IPEDS and College Scorecard files', footerBrowser: 'Every total is worked out in your browser · nothing you type is sent · no sign-up, no e-mail, no lead form',
  footerDisclaimer: 'Degree by Credit is an independent site published by Radif Partners. It is not a college, an accreditor or a lead seller, and it is not affiliated with the U.S. Department of Education, NCES or any school named. It recommends no school and gives no financial advice; the school’s own tuition page is the one that counts.',
  footerPopular: '',
  notFound: 'Nothing at this address. The online degree cost calculator and the pages on price per credit are one click away.',
  readMore: 'Show the rest of this paragraph ▾', disclaimer: 'Estimates from the published charges colleges report to the federal government: a budget, not a bill, and not financial advice. Charges change every year; the school’s own page is the one that counts.',
  /** HTML (footer of every page and of the embed): NCES public domain citation, College Scorecard CC BY attribution with the licence link. */
  attribution: 'Sources: U.S. Department of Education, Institute of Education Sciences, National Center for Education Statistics, Integrated Postsecondary Education Data System (IPEDS), public domain. College Scorecard data, U.S. Department of Education, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" class="underline">CC BY 4.0</a>; adapted, calculations by Radif Partners.',
};
export function t(_lang: Locale) { return en; }
