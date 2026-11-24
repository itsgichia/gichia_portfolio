/**
 * Figure for the RSV Bayesian calibration: particles temper onto the
 * R0-immunity ridge beside the true value while the fitted curve lands on
 * the synthetic counts anyway, which is why the recovery test failed.
 */
import { Figure, Row, hash } from './ProjectFigures'

// Synthetic monthly notifications over three years, scaled to the largest month,
// with the modelled series at the true parameters and at the posterior mean.
// The two model curves sit almost on top of each other: that is the finding.
const RSV_OBS = [0, 0.01, 0.02, 0.11, 0.34, 0.68, 0.69, 0.21, 0.09, 0.02, 0.01, 0.01, 0.01, 0.02, 0.09, 0.32, 1, 0.89, 0.38, 0.12, 0.03, 0.01, 0, 0, 0, 0, 0.02, 0.09, 0.42, 0.75, 0.58, 0.25, 0.09, 0.02, 0.01, 0.01]
const RSV_TRUTH = [0, 0.01, 0.02, 0.09, 0.37, 0.71, 0.61, 0.25, 0.08, 0.03, 0.01, 0.01, 0.01, 0.02, 0.08, 0.35, 0.93, 0.86, 0.38, 0.11, 0.03, 0.01, 0, 0, 0, 0.01, 0.02, 0.1, 0.36, 0.76, 0.61, 0.26, 0.08, 0.02, 0.01, 0.01]
const RSV_FIT = [0, 0.01, 0.02, 0.1, 0.39, 0.76, 0.66, 0.28, 0.09, 0.03, 0.01, 0.01, 0.01, 0.03, 0.09, 0.38, 1.01, 0.97, 0.44, 0.13, 0.04, 0.01, 0, 0, 0, 0.01, 0.02, 0.11, 0.39, 0.81, 0.66, 0.29, 0.09, 0.03, 0.01, 0.01]
// Twenty draws from the recovery posterior: (R0, immunity in days).
const RSV_DRAWS = [
  [1.522, 205.4], [1.486, 197.6], [1.447, 184.9], [1.551, 214.1], [1.525, 205.3], [1.476, 192.3], [1.511, 201.3],
  [1.492, 196.0], [1.49, 194.7], [1.568, 216.7], [1.477, 194.5], [1.519, 204.8], [1.529, 206.7], [1.535, 209.4],
  [1.47, 191.4], [1.522, 206.5], [1.455, 186.2], [1.471, 189.3], [1.576, 221.0], [1.482, 194.2],
]
const RSV_TRUE = [1.6, 230]

function RecoveryTest() {
  const bx = (m) => 12 + m * 6
  const by = (v) => 78 - v * 54
  const line = (vals) => vals.map((v, m) => `${bx(m) + 2.5},${by(v)}`).join(' ')
  // Parameter plane: R0 1.2 to 2.0 across, immunity 150 to 320 days up.
  const px = (r0) => 14 + ((r0 - 1.2) / 0.8) * 90
  const py = (imm) => 166 - ((imm - 150) / 170) * 62
  return (
    <svg
      className="pfig__svg"
      viewBox="0 0 240 180"
      role="img"
      aria-label="Particles spread over a plane of R0 against immunity duration contract onto a tight cloud that sits beside the true value, while the fitted curve lands on the synthetic counts anyway"
    >
      <text x="8" y="14" className="pfig__tag">
        SYNTHETIC COUNTS, 36 MONTHS
      </text>
      {RSV_OBS.map((v, m) => (
        <rect key={m} x={bx(m)} y={by(v)} width="5" height={Math.max(0.5, 78 - by(v))} fill="rgba(159,179,209,0.35)" />
      ))}
      <line x1="12" y1="78.5" x2="228" y2="78.5" stroke="var(--line-hi)" strokeWidth="1" />
      <polyline points={line(RSV_TRUTH)} fill="none" stroke="var(--yellow)" strokeWidth="1.5" strokeDasharray="3 2" />
      <polyline
        className="rsvfit__curve"
        points={line(RSV_FIT)}
        pathLength="100"
        fill="none"
        stroke="var(--pink)"
        strokeWidth="1.5"
      />

      <line x1="8" y1="90" x2="232" y2="90" stroke="var(--line)" strokeDasharray="2 3" />

      {/* parameter plane */}
      <rect x="12" y="102" width="94" height="66" fill="rgba(45,212,191,0.05)" stroke="var(--line)" strokeWidth="1" />
      <text x="12" y="100" className="pfig__tag">
        R0 × IMMUNITY
      </text>
      <text x="106" y="176" className="pfig__lab" textAnchor="end">
        R0 2.0
      </text>
      <text x="12" y="176" className="pfig__lab">
        1.2
      </text>
      {/* the ridge both points sit on */}
      <line x1={px(1.36)} y1={py(158)} x2={px(1.72)} y2={py(266)} stroke="var(--line-hi)" strokeWidth="1" strokeDasharray="1 2" />

      {RSV_DRAWS.map(([r0, imm], i) => {
        const sx = 16 + hash(i * 7 + 1) * 86
        const sy = 106 + hash(i * 13 + 5) * 58
        return (
          <rect
            key={i}
            className="rsvfit__p"
            x={sx}
            y={sy}
            width="3"
            height="3"
            fill="var(--pink)"
            style={{ '--dx': `${(px(r0) - sx).toFixed(1)}px`, '--dy': `${(py(imm) - sy).toFixed(1)}px` }}
          />
        )
      })}
      <g stroke="var(--yellow)" strokeWidth="1.5">
        <line x1={px(RSV_TRUE[0]) - 4} y1={py(RSV_TRUE[1])} x2={px(RSV_TRUE[0]) + 4} y2={py(RSV_TRUE[1])} />
        <line x1={px(RSV_TRUE[0])} y1={py(RSV_TRUE[1]) - 4} x2={px(RSV_TRUE[0])} y2={py(RSV_TRUE[1]) + 4} />
      </g>

      {/* stage readout */}
      <text x="118" y="112" className="pfig__tag rsvfit__stage rsvfit__stage--1">
        STAGE: PRIOR
      </text>
      <text x="118" y="112" className="pfig__tag rsvfit__stage rsvfit__stage--2">
        STAGE: TEMPERING
      </text>
      <text x="118" y="112" className="pfig__tag rsvfit__stage rsvfit__stage--3">
        STAGE: POSTERIOR
      </text>

      <line x1="118" y1="124" x2="126" y2="124" stroke="var(--yellow)" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="130" y="127" className="pfig__lab">
        truth R0 1.6, 230 days
      </text>
      <line className="rsvfit__key" x1="118" y1="138" x2="126" y2="138" stroke="var(--pink)" strokeWidth="1.5" />
      <text x="130" y="141" className="pfig__lab rsvfit__key">
        posterior 1.5, 200 days
      </text>
      <text x="118" y="158" className="pfig__val rsvfit__key" fill="var(--yellow)">
        same curve
      </text>
      <text x="118" y="170" className="pfig__lab rsvfit__key">
        truth outside 95% band
      </text>
    </svg>
  )
}

export function RsvFitFigure() {
  return (
    <Figure
      title="A fit must recover known parameters before it meets real data"
      sub="Sequential Monte Carlo over the SEIRS model, tested on counts the model generated itself"
      svg={<RecoveryTest />}
      caption={
        <>
          The sampler converged tightly, and tightly in the wrong place. A lower R0 with shorter immunity reproduces the
          synthetic series almost exactly, so three years of monthly counts cannot tell the two apart, and 200 particles
          never found the over-dispersion. At these parameters the model also runs a two-year cycle, so the burn-in state
          depends on whether the burn-in is an odd or even number of years. The NSW series stays untouched until the test
          passes.
        </>
      }
    >
      <Row label="NSW months fetched" value="50 × 8 ages" pct={1} />
      <Row label="Truth inside the 95% interval" value="8 of 14" pct={8 / 14} bad />
      <Row label="R0, immunity vs truth 1.6, 230 d" value="1.50 / 200 d" pct={0.87} bad />
      <Row label="Over-dispersion, truth 20" value="6.4" pct={0.32} bad />
    </Figure>
  )
}
