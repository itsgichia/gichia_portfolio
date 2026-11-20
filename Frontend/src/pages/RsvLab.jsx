import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import LineChart from '../components/LineChart'
import { Win } from '../components/Retro'
import useApi from '../components/useApi'

const DEFAULTS = {
  maternal_coverage: 0,
  maternal_efficacy: 0.8,
  nirsevimab_coverage: 0.6,
  nirsevimab_efficacy: 0.8,
  nirsevimab_seasonal_only: false,
  r0: 1.6,
  seasonal_amplitude: 0.4,
  immunity_days: 230,
  years: 4,
  mixing: 'homogeneous',
}

const PRESETS = [
  { label: 'Nirsevimab only', values: { maternal_coverage: 0, nirsevimab_coverage: 0.6, nirsevimab_seasonal_only: false } },
  { label: 'Maternal vaccine only', values: { maternal_coverage: 0.6, nirsevimab_coverage: 0 } },
  { label: 'Both products', values: { maternal_coverage: 0.6, nirsevimab_coverage: 0.5, nirsevimab_seasonal_only: false } },
  { label: 'Seasonal nirsevimab', values: { maternal_coverage: 0, nirsevimab_coverage: 0.6, nirsevimab_seasonal_only: true } },
]

const VIEWS = [
  { key: 'under6', label: 'Under 6 months' },
  { key: '0-2 months', label: '0-2 months' },
  { key: '3-5 months', label: '3-5 months' },
  { key: '6-11 months', label: '6-11 months' },
  { key: '12-23 months', label: '12-23 months' },
  { key: 'prevalence', label: 'All-age infections' },
]

/* ---------------------------------------------------------------- helpers */

const pct = (v) => `${Math.round(v * 100)}%`
const fmt = (v, d = 1) => v.toLocaleString('en-AU', { maximumFractionDigits: d, minimumFractionDigits: d })
const int = (v) => Math.round(v).toLocaleString('en-AU')

// Parameters travel in the URL so a scenario can be shared as a link.
function paramsFromSearch(search) {
  const out = { ...DEFAULTS }
  for (const [k, v] of search.entries()) {
    if (!(k in DEFAULTS)) continue
    if (typeof DEFAULTS[k] === 'boolean') out[k] = v === '1' || v === 'true'
    else if (typeof DEFAULTS[k] === 'number') {
      const n = Number(v)
      if (Number.isFinite(n)) out[k] = n
    } else out[k] = v
  }
  return out
}

function searchFromParams(params) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === DEFAULTS[k]) continue
    s.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
  }
  return s
}

function toCsv(result) {
  const groups = Object.keys(result.groups)
  const head = ['week', 'under6_baseline', 'under6_scenario', ...groups.flatMap((g) => [`${g}_baseline`, `${g}_scenario`]), 'all_age_infectious']
  const rows = result.weeks.map((w, i) => [
    w,
    result.under6_baseline[i],
    result.under6_scenario[i],
    ...groups.flatMap((g) => [result.groups[g].baseline[i], result.groups[g].scenario[i]]),
    result.prevalence_all_ages[i],
  ])
  return [head, ...rows].map((r) => r.join(',')).join('\n')
}

function useDebounced(value, ms) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/* ------------------------------------------------------------- controls */

function Slider({ id, label, hint, value, min, max, step, format, onChange }) {
  return (
    <div className="control">
      <label htmlFor={id}>
        {label} <output htmlFor={id}>{format(value)}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      {sub && <span className="stat__sub">{sub}</span>}
    </div>
  )
}

/* --------------------------------------------------------------- page */

export default function RsvLab() {
  const [search, setSearch] = useSearchParams()
  const [params, setParams] = useState(() => paramsFromSearch(search))
  const [view, setView] = useState('under6')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const defaults = useApi(api.rsvDefaults)
  const set = (k) => (v) => setParams((p) => ({ ...p, [k]: v }))

  // Keep the address bar in step with the sliders (without adding history entries).
  useEffect(() => {
    setSearch(searchFromParams(params), { replace: true })
  }, [params, setSearch])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => {
      api
        .rsv(params)
        .then((r) => {
          setResult(r)
          setError(null)
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(t)
  }, [params])

  // Presets are compared under the current virus settings, a little behind the main run.
  const virus = useDebounced(
    useMemo(
      () => ({ r0: params.r0, seasonal_amplitude: params.seasonal_amplitude, immunity_days: params.immunity_days, mixing: params.mixing, years: params.years }),
      [params.r0, params.seasonal_amplitude, params.immunity_days, params.mixing, params.years],
    ),
    600,
  )
  const [compare, setCompare] = useState(null)
  useEffect(() => {
    let live = true
    api
      .rsvCompare({
        scenarios: [
          { label: 'No programme', params: { ...DEFAULTS, ...virus, maternal_coverage: 0, nirsevimab_coverage: 0 } },
          ...PRESETS.map((p) => ({ label: p.label, params: { ...DEFAULTS, ...virus, ...p.values } })),
        ],
      })
      .then((rows) => live && setCompare(rows))
      .catch(() => live && setCompare(null))
    return () => {
      live = false
    }
  }, [virus])

  const anyProduct = params.maternal_coverage > 0 || params.nirsevimab_coverage > 0
  const total = result?.summary.find((r) => r.group === 'Under 2 years')

  const series = useMemo(() => {
    if (!result) return null
    if (view === 'prevalence')
      return {
        title: 'People infectious with RSV, all ages',
        sub: `Per million people each week, no programme (the programme changes this very little)`,
        lines: [{ name: 'baseline', color: 'var(--grey-line)', values: result.prevalence_all_ages, width: 2.25 }],
      }
    const pair = view === 'under6' ? { baseline: result.under6_baseline, scenario: result.under6_scenario } : result.groups[view]
    return {
      title: `Weekly hospitalisations, infants ${view === 'under6' ? 'under 6 months' : view}`,
      sub: `Per million people, over ${params.years} years after the programme starts`,
      lines: [
        { name: 'baseline', color: 'var(--grey-line)', values: pair.baseline, width: 2 },
        { name: 'scenario', color: 'var(--blue)', values: pair.scenario, width: 2.75 },
      ],
    }
  }, [result, view, params.years])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const csvRef = useRef(null)
  const download = () => {
    if (!result) return
    const blob = new Blob([toCsv(result)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = csvRef.current
    a.href = url
    a.download = `rsv-scenario-${Date.now()}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="page">
      <Win title="rsv_lab" icon="⚗" className="article">
        <h1 className="article__title">RSV Lab</h1>
        <p className="article__lede">
          How much could infant immunisation reduce RSV hospitalisations? Change the programme or the virus and an
          age-structured transmission model reruns on the server. Every scenario has its own link, so you can share one.
        </p>

        <div className="filters" role="group" aria-label="Scenario presets" style={{ marginTop: '1.25rem' }}>
          {PRESETS.map((p) => (
            <button key={p.label} className="chip" onClick={() => setParams((s) => ({ ...s, ...p.values }))}>
              {p.label}
            </button>
          ))}
          <button className="chip" onClick={() => setParams(DEFAULTS)}>
            Reset
          </button>
          <span className="filters__spacer" />
          <button className="chip chip--quiet" onClick={copyLink}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button className="chip chip--quiet" onClick={download} disabled={!result}>
            Download CSV
          </button>
          <a ref={csvRef} hidden href="#csv" aria-hidden="true">
            csv
          </a>
        </div>

        <div className="lab">
          <form className="controls" onSubmit={(e) => e.preventDefault()}>
            <fieldset>
              <legend>Nirsevimab</legend>
              <Slider id="n-cov" label="Coverage" hint="Share of newborns given the antibody" value={params.nirsevimab_coverage} min={0} max={1} step={0.05} format={pct} onChange={set('nirsevimab_coverage')} />
              <Slider id="n-eff" label="Efficacy" hint="Protection against hospitalisation, flat for six months" value={params.nirsevimab_efficacy} min={0} max={1} step={0.05} format={pct} onChange={set('nirsevimab_efficacy')} />
              <label className="check">
                <input type="checkbox" checked={params.nirsevimab_seasonal_only} onChange={(e) => set('nirsevimab_seasonal_only')(e.target.checked)} />
                Only babies born April to September
              </label>
            </fieldset>
            <fieldset>
              <legend>Maternal vaccine</legend>
              <Slider id="m-cov" label="Coverage" hint="Share of pregnancies vaccinated" value={params.maternal_coverage} min={0} max={1} step={0.05} format={pct} onChange={set('maternal_coverage')} />
              <Slider id="m-eff" label="Efficacy" hint="Starting protection; it wanes from month four" value={params.maternal_efficacy} min={0} max={1} step={0.05} format={pct} onChange={set('maternal_efficacy')} />
            </fieldset>
            <fieldset>
              <legend>Virus and population</legend>
              <Slider id="r0" label="Basic reproduction number" hint="Average infections from one case in a fully susceptible population" value={params.r0} min={1.2} max={2.5} step={0.05} format={(v) => v.toFixed(2)} onChange={set('r0')} />
              <Slider id="amp" label="Seasonality" hint="How strongly transmission rises in autumn and winter" value={params.seasonal_amplitude} min={0} max={0.8} step={0.05} format={(v) => v.toFixed(2)} onChange={set('seasonal_amplitude')} />
              <Slider id="imm" label="Immunity after infection" hint="Average time before someone can be reinfected" value={params.immunity_days} min={90} max={500} step={10} format={(v) => `${v} days`} onChange={set('immunity_days')} />
              <Slider id="yrs" label="Years simulated" value={params.years} min={1} max={8} step={1} format={(v) => `${v}`} onChange={set('years')} />
              <div className="control">
                <label htmlFor="mixing">Mixing between ages</label>
                <select id="mixing" value={params.mixing} onChange={(e) => set('mixing')(e.target.value)}>
                  <option value="homogeneous">Everyone mixes equally</option>
                  <option value="assortative">Age-assortative (synthetic)</option>
                </select>
                <span className="hint">Assortative mixing concentrates contacts within age bands and between parents and children.</span>
              </div>
            </fieldset>
          </form>

          <div className={loading ? 'loading' : undefined} aria-busy={loading}>
            {error && <p className="notice notice--error">The model didn't run: {error}</p>}

            {total && (
              <div className="stats" aria-label="Headline results">
                <Stat label="Admissions averted, under 2 years" value={anyProduct ? `${fmt(total.percent_averted, 0)}%` : '0%'} sub={`${int(total.averted_per_year)} fewer per year per million people`} />
                <Stat label="Doses per year" value={int(result.doses.total)} sub={`per million people (${int(result.births_per_year)} births)`} />
                <Stat label="Doses per admission averted" value={result.doses.per_admission_averted ? fmt(result.doses.per_admission_averted, 0) : '—'} sub="lower is more efficient" />
                <Stat label="Peak week, under 6 months" value={`${fmt(result.peak_under6.baseline, 0)} → ${fmt(result.peak_under6.scenario, 0)}`} sub="weekly admissions per million" />
              </div>
            )}

            <div className="filters" role="tablist" aria-label="Chart view" style={{ margin: '1rem 0 0.75rem' }}>
              {VIEWS.map((v) => (
                <button key={v.key} role="tab" aria-selected={view === v.key} className="chip chip--small" onClick={() => setView(v.key)}>
                  {v.label}
                </button>
              ))}
            </div>

            <figure className="figure" style={{ margin: 0 }}>
              {series && (
                <>
                  <p className="figure__title">{series.title}</p>
                  <p className="figure__sub">{series.sub}</p>
                  <div className="legend" aria-hidden="true">
                    <span>
                      <i style={{ background: 'var(--grey-line)' }} /> No immunisation
                    </span>
                    {series.lines.length > 1 && (
                      <span>
                        <i style={{ background: 'var(--blue)' }} /> With the programme
                      </span>
                    )}
                  </div>
                  <LineChart x={result.weeks.map((w) => w / 52)} xLabel="Years" ariaLabel={series.title} series={series.lines} />
                </>
              )}
              {!series && !error && <p className="muted">Running the model…</p>}
            </figure>

            {result && (
              <table className="table">
                <caption className="figure__sub" style={{ textAlign: 'left', captionSide: 'top' }}>
                  Hospitalisations per 1,000 births each year, averaged over the run
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Age group</th>
                    <th scope="col">No immunisation</th>
                    <th scope="col">With programme</th>
                    <th scope="col">Averted</th>
                  </tr>
                </thead>
                <tbody>
                  {result.summary.map((r) => (
                    <tr key={r.group} className={r.group === 'Under 2 years' ? 'total' : undefined}>
                      <td>{r.group}</td>
                      <td>{fmt(r.baseline_per_1000_births)}</td>
                      <td>{fmt(r.scenario_per_1000_births)}</td>
                      <td className={r.percent_averted < -0.05 ? 'neg' : undefined}>{anyProduct ? `${fmt(r.percent_averted, 0)}%` : '0%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {compare && (
              <table className="table">
                <caption className="figure__sub" style={{ textAlign: 'left', captionSide: 'top' }}>
                  Programmes compared under the current virus settings, infants under 2 years
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Programme</th>
                    <th scope="col">Averted</th>
                    <th scope="col">Per 1,000 births</th>
                    <th scope="col">Doses / year</th>
                    <th scope="col">Doses per admission averted</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map((r) => (
                    <tr key={r.label}>
                      <td>{r.label}</td>
                      <td>{fmt(r.percent_averted, 0)}%</td>
                      <td>{fmt(r.scenario_per_1000_births)}</td>
                      <td>{int(r.doses_per_year)}</td>
                      <td>{r.doses_per_admission_averted ? fmt(r.doses_per_admission_averted, 0) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <section className="method prose">
          <h2>How the model works</h2>
          <p>
            The population is split into 30 age groups, monthly for the first two years, and each person moves between
            susceptible, exposed, infectious and recovered states. Immunity wanes, so people can be reinfected.
            Transmission rises and falls with the seasons. Infants protected at birth sit in their own compartments for
            six months with lower susceptibility; maternal vaccine protection wanes from month four, while nirsevimab's
            stays flat. A share of infections in each infant age group leads to hospital. Doses are counted from the
            birth flows in the model, so "doses per admission averted" is a simple efficiency measure, not a costing.
          </p>
          <h2>What to look for</h2>
          <p>
            Raising the basic reproduction number switches the epidemics from alternating large and small seasons to
            regular yearly peaks, a pattern seen in Australian RSV data. The 6 to 11 month row can turn slightly
            negative: protected babies who avoid early infection are still susceptible when protection ends. Restricting
            nirsevimab to winter-born babies uses far fewer doses but leaves summer-born babies unprotected when their
            first season arrives. Switching on age-assortative mixing lowers the baseline burden in infants, because
            they meet fewer infectious people, while the proportional effect of a programme stays similar.
          </p>
          <h2>Limits and sources</h2>
          <p>
            The model is not fitted to Australian surveillance data, so the absolute numbers are illustrative and the
            percentage reductions are the more reliable output. The assortative contact kernel is synthetic rather than
            taken from a contact survey. Parameters follow the Western Australian RSV models of Hogan and colleagues,
            with nirsevimab efficacy from the HARMONIE trial.
          </p>
          {defaults.data?.sources && (
            <ul className="plain">
              {defaults.data.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Win>
    </div>
  )
}
