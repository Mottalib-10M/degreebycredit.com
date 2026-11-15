/**
 * "Find your college" (naive testers, 2026-11-14, tour 5): type a name, pick a college among the 2,530 online colleges
 * of the site, read its price per credit, the cost of the chosen degree with the credits already earned, its town and
 * sector, and its official College Scorecard page. The list (/data/college-search.json) is fetched on first focus only.
 * `type="search"`: the first-screen check still finds the page's calculator as the first field (check-premier-ecran).
 */
import { useMemo, useRef, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { P } from '../../lib/engine/params';
import { PACE } from '../../lib/pace';
import { formatMoney, formatNumber } from '../../lib/format';
import { indexRows, search, priceOf, costAt, scorecardUrl, navigatorUrl, SECTOR, type SearchData, type SearchRow, type Price } from '../../lib/college-search';

const LEVELS = [
  { name: 'Associate degree', credits: P.credits.associate, grad: false },
  { name: 'Bachelor’s degree', credits: P.credits.bachelor, grad: false },
  { name: 'Master’s degree', credits: P.credits.master, grad: true },
  { name: 'Certificate', credits: P.credits.certificate, grad: false },
];
const m = (n: number) => formatMoney(Math.round(n), 0);
const mc = (n: number) => formatMoney(n, Number.isInteger(n) ? 0 : 2);
const num = (n: number) => formatNumber(n, 0);
const priceText = (p: Price) => (p.annual ? `${m(p.annual)} a year, whatever the credits: ${mc(p.perCredit)} a credit at 30 credits a year (${m(p.annual)} ÷ 30)` : `${mc(p.perCredit)} a credit`);

interface Props { idPrefix?: string; showAccreditor?: boolean; count: number }

export default function CollegeLookup({ idPrefix = 'find', showAccreditor = false, count }: Props) {
  const [data, setData] = useState<SearchData | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pick, setPick] = useState<SearchRow | null>(null);
  const [level, setLevel] = useState(1);
  const [transfer, setTransfer] = useState(0);
  const loading = useRef(false);
  const index = useMemo(() => (data ? indexRows(data.rows) : []), [data]);
  const hits = useMemo(() => search(index, q), [index, q]);
  const id = (s: string) => `${idPrefix}-${s}`;

  const load = () => {
    if (data || loading.current) return;
    loading.current = true;
    fetch('/data/college-search.json').then((r) => r.json()).then((d: SearchData) => setData(d)).catch(() => { setFailed(true); loading.current = false; });
  };
  const choose = (r: SearchRow) => { setPick(r); setQ(r[1]); setOpen(false); setLevel(r[7] || r[9] ? (r[5] === 1 ? 1 : 0) : r[13] ? 2 : 1); }; // graduate-only school: master's
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, hits.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && open && hits[active]) { e.preventDefault(); choose(hits[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const showList = open && q.trim().length > 0 && !!data;

  return (
    <div data-chrome data-lookup className="not-prose">
      {/* One line on a computer: the calculator under it must stay on the first screen (check-premier-ecran). */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <label htmlFor={id('q')} className="shrink-0 text-base font-semibold text-navy-900">Find your college</label>
      <div className="relative flex-1">
        <input id={id('q')} type="search" role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={showList} aria-controls={id('list')}
          aria-activedescendant={showList && hits[active] ? id(`o${active}`) : undefined} value={q} placeholder="Type its name, e.g. Western Governors"
          onFocus={() => { load(); setOpen(true); }} onBlur={() => setOpen(false)} onKeyDown={onKey}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          className="h-11 w-full rounded-lg border-2 border-accent-300 bg-white px-3 text-base text-navy-900 focus:border-accent-500 focus:outline-none" />
        {showList && (
          <ul id={id('list')} role="listbox" className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-navy-200 bg-white shadow-lg">
            {hits.length === 0
              ? <li className="px-4 py-2 text-sm text-navy-700">No match among the {num(count)} online colleges (at least 50 students fully online). Check the spelling or type one word of the name.</li>
              : hits.map((r, i) => (
                <li key={r[0]} id={id(`o${i}`)} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); choose(r); }} onMouseEnter={() => setActive(i)}
                  className={`cursor-pointer px-4 py-2 text-sm ${i === active ? 'bg-accent-100' : ''}`}>
                  <span className="font-medium text-navy-900">{r[1]}</span> <span className="text-navy-600">{r[2]}, {r[3]}</span>
                </li>))}
          </ul>
        )}
      </div>
      </div>
      {failed && <p role="status" className="mt-2 text-sm text-amber-700">The list of colleges could not load. Check your connection and click the field again.</p>}
      {pick && <Card r={pick} acc={showAccreditor && data && pick[15] >= 0 ? data.acc[pick[15]] : null} showAccreditor={showAccreditor} level={level} setLevel={setLevel} transfer={transfer} setTransfer={setTransfer} id={id} />}
    </div>
  );
}

function Card({ r, acc, showAccreditor, level, setLevel, transfer, setTransfer, id }: { r: SearchRow; acc: string | null; showAccreditor: boolean; level: number; setLevel: (n: number) => void; transfer: number; setTransfer: (n: number) => void; id: (s: string) => string }) {
  const L = LEVELS[level];
  const inS = priceOf(r, L.grad, false);
  const outS = priceOf(r, L.grad, true);
  const same = !!inS && !!outS && inS.perCredit === outS.perCredit && inS.fees === outS.fees;
  const cIn = inS && costAt(inS, L.credits, transfer);
  const cOut = outS && costAt(outS, L.credits, transfer);
  const sc = scorecardUrl(r);
  return (
    <div aria-live="polite" data-fiche className="mt-3 rounded-lg bg-white p-4">
      <p className="text-lg font-bold text-navy-900">{r[1]}</p>
      <p className="text-sm text-navy-700">{r[2]}, {r[3]} · {SECTOR[r[4] - 1] ?? ''}{r[5] === 1 ? ' · four-year' : r[5] === 2 ? ' · two-year' : ''} · {num(r[6])} students fully online</p>
      {showAccreditor && <p className="mt-1 text-sm text-navy-900">Accreditor: <strong>{acc ?? 'none on file in College Scorecard'}</strong></p>}
      <form data-simulateur-secondaire onSubmit={(e) => e.preventDefault()} className="mt-3 grid gap-3 sm:grid-cols-2">
        <SelectField id={id('level')} label="Degree" value={String(level)} onChange={(x) => setLevel(Number(x))} options={LEVELS.map((l, i) => ({ value: String(i), label: `${l.name} (${l.credits} credits)` }))} />
        <NumberField id={id('transfer')} label="Credits you already have" value={transfer} onChange={setTransfer} max={200} help="Not sure? Leave 0." />
      </form>
      {!inS
        ? <p className="mt-3 text-sm text-navy-900">{L.grad ? 'This college reports no graduate price per credit to the federal college survey.' : 'This college reports no undergraduate price to the federal college survey.'} Its own tuition page gives it.</p>
        : <div className="mt-3 text-sm text-navy-900">
          <p>Price, {same ? 'wherever you live' : 'for residents of its state'}: <strong>{priceText(inS)}</strong>{inS.fees > 0 ? `, plus ${m(inS.fees)} of required fees a year` : ''}.</p>
          {!same && outS && <p className="mt-1">From another state: <strong>{priceText(outS)}</strong>{outS.fees > 0 ? `, plus ${m(outS.fees)} of fees a year` : ''}.</p>}
          {cIn && <p data-cout className="mt-3 text-base">{L.name}, {num(cIn.remaining)} credits left: <strong className="tabular-nums text-2xl text-navy-900">{m(cIn.net)}</strong>{same ? '' : ' for a resident'}{!same && cOut ? <>, <strong className="tabular-nums">{m(cOut.net)}</strong> from another state</> : ''}</p>}
          {cIn && <p className="mt-1 text-xs text-navy-600">Tuition and required fees before grants, at {PACE.creditsPerTerm} credits a term, {PACE.termsPerYear} terms a year ({cIn.years === 1 ? '1 year' : `${formatNumber(cIn.years, cIn.years % 1 ? 1 : 0)} years`} of fees{L.grad ? '; graduate fees are not in the federal file' : ''}). Prices the college reported for {P.ipeds.chargesYear}: check its tuition page before you enroll.</p>}
        </div>}
      <p className="mt-3 text-sm">
        {sc
          ? <a href={sc} rel="noopener" className="font-medium text-accent-700 underline">{showAccreditor ? 'Check its accreditation on College Scorecard' : 'Its official page on College Scorecard'} (U.S. Department of Education) →</a>
          : <a href={navigatorUrl(r)} rel="noopener" className="font-medium text-accent-700 underline">College Scorecard has no page for this college: its page on College Navigator (National Center for Education Statistics) →</a>}
      </p>
    </div>
  );
}
