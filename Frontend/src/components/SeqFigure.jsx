import { useEffect, useState } from 'react'
import { api } from '../api'

/** Draws a neighbour-joining tree from the backend's node layout as a rectangular cladogram. */
export function Tree({ nodes, width = 520, rowHeight = 22, color = 'var(--pink)' }) {
  if (!nodes?.length) return null
  const leaves = nodes.filter((n) => n.leaf).length
  const maxX = Math.max(...nodes.map((n) => n.x)) || 1
  const labelW = 110
  const plotW = width - labelW - 16
  const sx = (x) => 8 + (x / maxX) * plotW
  const sy = (y) => 14 + y * rowHeight
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const height = sy(leaves - 1) + 14
  return (
    <svg className="tree" viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Tree with ${leaves} sequences`}>
      {nodes.map((n) => {
        if (n.parent == null) return null
        const p = byId[n.parent]
        return (
          <path
            key={n.id}
            d={`M${sx(p.x)},${sy(p.y)} V${sy(n.y)} H${sx(n.x)}`}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            shapeRendering="crispEdges"
          />
        )
      })}
      {nodes
        .filter((n) => n.leaf)
        .map((n) => (
          <text key={n.id} x={sx(n.x) + 6} y={sy(n.y) + 4} className="tree__label">
            {n.name}
          </text>
        ))}
    </svg>
  )
}

/** The small live figure on the Sequence Lab project card. */
export function SeqFigure() {
  const [tree, setTree] = useState(null)
  const [error, setError] = useState(null)
  useEffect(() => {
    api
      .bioExamples()
      .then((ex) => api.bioTree({ fasta: ex.fasta }))
      .then(setTree)
      .catch(() => setError('The sequence server is not responding right now.'))
  }, [])
  return (
    <figure className="figure" style={{ margin: 0 }}>
      <p className="figure__title">Neighbour-joining tree of a synthetic gene family</p>
      <p className="figure__sub">Jukes-Cantor distances from pairwise alignments, computed live</p>
      {error && <p className="notice notice--error">{error}</p>}
      {tree ? <Tree nodes={tree.nodes} /> : !error && <p className="muted">Aligning…</p>}
    </figure>
  )
}
