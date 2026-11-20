import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import LineChart from './LineChart'

export default function HeroFigure() {
  const [coverage, setCoverage] = useState(60)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const first = useRef(true)

  useEffect(() => {
    const t = setTimeout(
      () => {
        api
          .rsv({ nirsevimab_coverage: coverage / 100, maternal_coverage: 0, years: 3 })
          .then((d) => {
            setData(d)
            setError(null)
          })
          .catch(() => setError('The model server is not responding right now.'))
      },
      first.current ? 0 : 250,
    )
    first.current = false
    return () => clearTimeout(t)
  }, [coverage])

  const under6 = data?.summary
    ? data.summary.filter((r) => r.group === '0-2 months' || r.group === '3-5 months')
    : []
  const base = under6.reduce((a, r) => a + r.baseline_per_year, 0)
  const scen = under6.reduce((a, r) => a + r.scenario_per_year, 0)
  const pct = base > 0 ? Math.round((100 * (base - scen)) / base) : 0

  return (
    <figure className="figure" style={{ margin: 0 }}>
      <p className="figure__title">RSV hospitalisations in infants under 6 months</p>
      <p className="figure__sub">Weekly admissions per million people, from the transmission model</p>
      <div className="legend" aria-hidden="true">
        <span>
          <i style={{ background: 'var(--grey-line)' }} /> No immunisation
        </span>
        <span>
          <i style={{ background: 'var(--blue)' }} /> Nirsevimab at birth, {coverage}% coverage
        </span>
      </div>
      {data ? (
        <LineChart
          animate
          x={data.weeks.map((w) => w / 52)}
          xLabel="Years"
          ariaLabel={`Line chart: weekly RSV hospitalisations in infants under 6 months over three years, with and without nirsevimab at ${coverage}% coverage. About ${pct}% fewer admissions with nirsevimab.`}
          series={[
            { name: 'baseline', color: 'var(--grey-line)', values: data.under6_baseline, width: 2 },
            { name: 'scenario', color: 'var(--blue)', values: data.under6_scenario, width: 2.75 },
          ]}
        />
      ) : (
        <div style={{ aspectRatio: '640 / 260', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
          {error || 'Running the model…'}
        </div>
      )}
      <div className="slider-row">
        <label htmlFor="hero-coverage">Nirsevimab coverage</label>
        <input
          id="hero-coverage"
          type="range"
          min="0"
          max="100"
          step="5"
          value={coverage}
          onChange={(e) => setCoverage(Number(e.target.value))}
        />
        <output htmlFor="hero-coverage">{coverage}%</output>
      </div>
      <figcaption className="figure__caption">
        At {coverage}% coverage the model averts about <b>{pct}%</b> of hospitalisations in infants under six months.
        Illustrative output, run live in Python.
      </figcaption>
    </figure>
  )
}
