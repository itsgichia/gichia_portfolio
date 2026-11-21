/**
 * Methodology figure for the antidiabetic drug discovery project: an animated
 * ligand docking into the SUR1 pocket (left) and the five-step pipeline (right).
 * Pure SVG and CSS; the ligand's path is a looping keyframe animation.
 */
const STEPS = [
  ['01', 'Synthesis', 'a new sulfonamide made on the bench'],
  ['02', 'Ligand prep', 'RDKit: protonation, 3D conformers, energy minimised'],
  ['03', 'Docking x200', 'AutoDock Vina into the SUR1 structure, poses scored against glibenclamide'],
  ['04', 'QSAR and ML', 'descriptors and fingerprints, models that predict activity'],
  ['05', 'Shortlist', 'five high-affinity candidates ranked by affinity and drug-likeness'],
]

function Pocket() {
  // A blocky cross-section of a binding pocket with the ligand sliding in and settling.
  return (
    <svg className="chem__dock" viewBox="0 0 220 180" role="img" aria-label="Ligand docking into the SUR1 pocket">
      <defs>
        <pattern id="chem-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0V10" fill="none" stroke="rgba(159,179,209,0.12)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="220" height="180" fill="url(#chem-grid)" />
      {/* receptor wall */}
      <path
        d="M20 60 H70 V95 H60 V130 H160 V95 H150 V60 H200 V170 H20 Z"
        fill="rgba(124,196,248,0.14)"
        stroke="var(--sky)"
        strokeWidth="2"
        shapeRendering="crispEdges"
      />
      <text x="110" y="160" className="chem__tag" textAnchor="middle">
        SUR1 pocket
      </text>
      {/* interaction residues */}
      {[
        [78, 110],
        [142, 110],
        [110, 124],
      ].map(([x, y], i) => (
        <g key={i} className="chem__residue" style={{ animationDelay: `${i * 0.3}s` }}>
          <rect x={x - 3} y={y - 3} width="6" height="6" fill="var(--yellow)" />
        </g>
      ))}
      {/* ligand: a sulfonylurea-like stick figure */}
      <g className="chem__ligand">
        <g transform="translate(-24,-8)">
          <polygon points="0,8 6,0 18,0 24,8 18,16 6,16" fill="none" stroke="var(--pink)" strokeWidth="2" />
          <line x1="24" y1="8" x2="34" y2="8" stroke="var(--pink)" strokeWidth="2" />
          <rect x="34" y="4" width="8" height="8" fill="var(--pink)" />
          <line x1="42" y1="8" x2="50" y2="8" stroke="var(--pink)" strokeWidth="2" />
          <line x1="38" y1="4" x2="38" y2="-2" stroke="var(--pink)" strokeWidth="2" />
          <line x1="38" y1="12" x2="38" y2="18" stroke="var(--pink)" strokeWidth="2" />
          <text x="34" y="-4" className="chem__atom">
            O
          </text>
          <text x="34" y="26" className="chem__atom">
            O
          </text>
          <text x="52" y="11" className="chem__atom">
            N
          </text>
        </g>
      </g>
      <text x="20" y="22" className="chem__score">
        pose
      </text>
      <text x="52" y="22" className="chem__score chem__score--val">
        <tspan className="chem__kcal">scored ✓</tspan>
      </text>
    </svg>
  )
}

export default function ChemFigure() {
  return (
    <figure className="figure chem" style={{ margin: 0 }}>
      <p className="figure__title">Computer-aided discovery, from synthesis to shortlist</p>
      <p className="figure__sub">Docking poses are scored against glibenclamide, the reference sulfonylurea</p>
      <div className="chem__grid">
        <Pocket />
        <ol className="chem__steps">
          {STEPS.map(([n, title, detail]) => (
            <li key={n}>
              <span className="chem__no">{n}</span>
              <span>
                <b>{title}</b>
                <small>{detail}</small>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  )
}
