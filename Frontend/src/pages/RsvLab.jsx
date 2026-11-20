import { useEffect, useState } from 'react'
import { api } from '../api'
import LineChart from '../components/LineChart'

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
}

const PRESETS = [
  { label: 'Nirsevimab only', values: { maternal_coverage: 0, nirsevimab_coverage: 0.6, nirsevimab_seasonal_only: false } },
  { label: 'Maternal vaccine only', values: { maternal_coverage: 0.6, nirsevimab_coverage: 0 } },
  { label: 'Both products', values: { maternal_coverage: 0.6, nirsevimab_coverage: 0.5, nirsevimab_seasonal_only: false } },
  { label: 'Seasonal nirsevimab', values: { maternal_coverage: 0, nirsevimab_coverage: 0.6, nirsevimab_seasonal_only: true } },
]

function Slider({ id, label, value, min, max, step, format, onChange }) {
  return (
    <div className="control">
      <label htmlFor={id}>
        {label} <output htmlFor={id}>{format(value)}</output>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

const pct = (v) => `${Math.round(v * 100)}%`
const fmt = (v, d = 1) => v.toLocaleString('en-AU', { maximumFractionDigits: d, minimumFractionDigits: d })

export default function RsvLab() {
  const [params, setParams] = useState(DEFAULTS)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const set = (k) => (v) => setParams((p) => ({ ...p, [k]: v }))

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

  const anyProduct = params.maternal_coverage > 0 || params.nirsevimab_coverage > 0

  return (
    <div className="wrap article">
      <h1 className="article__title">RSV Lab</h1>
      <p className="article__lede">
        How much could infant immunisation reduce RSV hospitalisations? Change the programme or the virus and the
        transmission model reruns on the server.
      </p>

      <div className="filters" role="group" aria-label="Scenario presets" style={{ marginTop: '1.5rem' }}>
        {PRESETS.map((p) => (
          <button key={p.label} className="chip" onClick={() => setParams((s) => ({ ...s, ...p.values }))}>
            {p.label}
          </button>
        ))}
        <button className="chip" onClick={() => setParams(DEFAULTS)}>
          Reset
        </button>
      </div>

      <div className="lab">
        <form className="controls" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>Nirsevimab</legend>
            <Slider id="n-cov" label="Coverage" value={params.nirsevimab_coverage} min={0} max={1} step={0.05} format={pct} onChange={set('nirsevimab_coverage')} />
            <Slider id="n-eff" label="Efficacy" value={params.nirsevimab_efficacy} min={0} max={1} step={0.05} format={pct} onChange={set('nirsevimab_efficacy')} />
            <label className="check">
              <input
                type="checkbox"
                checked={params.nirsevimab_seasonal_only}
                onChange={(e) => set('nirsevimab_seasonal_only')(e.target.checked)}
              />
              Only babies born April to September
            </label>
          </fieldset>
          <fieldset>
            <legend>Maternal vaccine</legend>
            <Slider id="m-cov" label="Coverage" value={params.maternal_coverage} min={0} max={1} step={0.05} format={pct} onChange={set('maternal_coverage')} />
            <Slider id="m-eff" label="Efficacy" value={params.maternal_efficacy} min={0} max={1} step={0.05} format={pct} onChange={set('maternal_efficacy')} />
          </fieldset>
          <fieldset>
            <legend>Virus</legend>
            <Slider id="r0" label="Basic reproduction number" value={params.r0} min={1.2} max={2.5} step={0.05} format={(v) => v.toFixed(2)} onChange={set('r0')} />
            <Slider id="amp" label="Seasonality" value={params.seasonal_amplitude} min={0} max={0.8} step={0.05} format={(v) => v.toFixed(2)} onChange={set('seasonal_amplitude')} />
            <Slider id="imm" label="Immunity after infection" value={params.immunity_days} min={90} max={500} step={10} format={(v) => `${v} days`} onChange={set('immunity_days')} />
          </fieldset>
        </form>

        <div className={loading ? 'loading' : undefined} aria-busy={loading}>
          <figure className="figure" style={{ margin: 0 }}>
            <p className="figure__title">Weekly hospitalisations, infants under 6 months</p>
            <p className="figure__sub">Per million people, over {params.years} years after the programme starts</p>
            <div className="legend" aria-hidden="true">
              <span>
                <i style={{ background: 'var(--grey-line)' }} /> No immunisation
              </span>
              <span>
                <i style={{ background: 'var(--blue)' }} /> With the programme
              </span>
            </div>
            {error && <p className="notice notice--error">The model didn't run: {error}</p>}
            {result && (
              <LineChart
                x={result.weeks.map((w) => w / 52)}
                xLabel="Years"
                ariaLabel="Weekly RSV hospitalisations in infants under 6 months with and without the immunisation programme"
                series={[
                  { name: 'baseline', color: 'var(--grey-line)', values: result.under6_baseline, width: 2 },
                  { name: 'scenario', color: 'var(--blue)', values: result.under6_scenario, width: 2.75 },
                ]}
              />
            )}
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
                    <td className={r.percent_averted < -0.05 ? 'neg' : undefined}>
                      {anyProduct ? `${fmt(r.percent_averted, 0)}%` : '0%'}
                    </td>
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
          stays flat. A share of infections in each infant age group leads to hospital.
        </p>
        <h2>What to look for</h2>
        <p>
          Raising the basic reproduction number switches the epidemics from alternating large and small seasons to
          regular yearly peaks, a pattern seen in Australian RSV data. The 6 to 11 month row can turn slightly
          negative: protected babies who avoid early infection are still susceptible when protection ends. Restricting
          nirsevimab to winter-born babies leaves those born in summer unprotected when their first season arrives.
        </p>
        <h2>Limits and sources</h2>
        <p>
          Everyone mixes equally in this version, and the model is not fitted to Australian surveillance data, so the
          absolute numbers are illustrative and the percentage reductions are the more reliable output. Parameters
          follow the Western Australian RSV models of Hogan and colleagues
          (<a href="https://core.ac.uk/download/327069014.pdf" target="_blank" rel="noreferrer">maternal vaccine study</a>),
          with nirsevimab efficacy from the{' '}
          <a href="https://archive.lstmed.ac.uk/26858/" target="_blank" rel="noreferrer">HARMONIE trial</a>. Code and
          tests are on{' '}
          <a href="https://github.com/itsgichia/rsv-transmission-model" target="_blank" rel="noreferrer">GitHub</a>.
        </p>
      </section>
    </div>
  )
}
