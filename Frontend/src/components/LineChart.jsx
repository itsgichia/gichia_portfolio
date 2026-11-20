import { useLayoutEffect, useRef } from 'react'

const W = 640
const H = 260
const M = { top: 14, right: 12, bottom: 44, left: 40 }

function niceMax(v) {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p
  return 10 * p
}

/**
 * Minimal responsive SVG line chart.
 * series: [{ name, color, values, width, dash }]; x: number[]
 */
export default function LineChart({ x, series, xLabel, yLabel, animate = false, ariaLabel }) {
  const pathRefs = useRef([])
  const maxY = niceMax(Math.max(1, ...series.flatMap((s) => s.values)))
  const minX = x[0] ?? 0
  const maxX = x[x.length - 1] ?? 1
  const iw = W - M.left - M.right
  const ih = H - M.top - M.bottom
  const sx = (v) => M.left + ((v - minX) / (maxX - minX || 1)) * iw
  const sy = (v) => M.top + ih - (v / maxY) * ih
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY)
  const xTicks = []
  for (let t = Math.ceil(minX); t <= maxX; t++) xTicks.push(t)

  useLayoutEffect(() => {
    if (!animate) return
    pathRefs.current.forEach((p) => {
      if (p) p.style.setProperty('--len', String(Math.ceil(p.getTotalLength())))
    })
  }, [animate, series])

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
      {yTicks.map((t) => (
        <g key={t}>
          <line className="grid" x1={M.left} x2={W - M.right} y1={sy(t)} y2={sy(t)} />
          <text x={M.left - 8} y={sy(t) + 4} textAnchor="end">
            {Math.round(t)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} x={sx(t)} y={H - 24} textAnchor="middle">
          {t}
        </text>
      ))}
      {xLabel && (
        <text x={M.left + iw / 2} y={H - 4} textAnchor="middle" style={{ fontWeight: 600 }}>
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={M.left} y={M.top - 2} style={{ fontWeight: 600 }}>
          {yLabel}
        </text>
      )}
      {series.map((s, i) => {
        const d = s.values.map((v, j) => `${j ? 'L' : 'M'}${sx(x[j]).toFixed(1)},${sy(v).toFixed(1)}`).join('')
        return (
          <path
            key={s.name + (animate ? s.values.length : '')}
            ref={(el) => (pathRefs.current[i] = el)}
            className={animate ? 'draw' : undefined}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width || 2.25}
            strokeDasharray={s.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
