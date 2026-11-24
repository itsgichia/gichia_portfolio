import { Link } from 'react-router-dom'
import ChemFigure from './ChemFigure'
import HeroFigure from './HeroFigure'
import { SeqFigure } from './SeqFigure'
import { AnzhfrMock, RhipMock } from './ProjectMocks'
import { BronchFigure, ClaudeIcdFigure, FnaFigure, HistoFigure, IcdFigure, LigandFigure, RsvFitFigure } from './ProjectFigures'

export const COLORS = ['#2dd4bf', '#7cc4f8', '#f5b84a', '#6ee7a8', '#9fb3d1', '#f49a6a']

/** Every project has its own figure, keyed by slug. */
const FIGURES = {
  'rsv-transmission-lab': HeroFigure,
  'rsv-bayesian-calibration': RsvFitFigure,
  'sequence-lab': SeqFigure,
  'rhip-connect': RhipMock,
  'anzhfr-cohort-builder': AnzhfrMock,
  'antidiabetic-drug-discovery': ChemFigure,
  'histopath-metastasis-cnn': HistoFigure,
  'ligand-activity-ml': LigandFigure,
  'icd10am-llm-coding': IcdFigure,
  'icd10am-claude-coding': ClaudeIcdFigure,
  'fna-ann-vs-logistic': FnaFigure,
  'infant-bronchiolitis-prediction': BronchFigure,
}

export function ProjectVisual({ p, color }) {
  if (p.image_url) return <img className="room__shot" src={p.image_url} alt={`Screenshot of ${p.title}`} loading="lazy" />
  const Fig = FIGURES[p.slug]
  if (Fig) return <Fig />
  return (
    <div className="room__blank" style={{ '--c': color }} aria-hidden="true">
      <span>{p.title}</span>
    </div>
  )
}

/** A full project card ("room"), used on the projects page. */
export default function ProjectCard({ p, color, n }) {
  const live = p.live_url
  const internal = live && live.startsWith('/')
  return (
    <article id={p.slug} className="room" style={{ '--c': color }}>
      <p className="room__no">
        {String(n).padStart(2, '0')} · {p.category}
        {p.status === 'live' && <span className="badge badge--live">live</span>}
      </p>
      <h3 className="room__title">{p.title}</h3>
      <p className="room__tagline">{p.tagline}</p>
      <div className="room__visual">
        <ProjectVisual p={p} color={color} />
      </div>
      <p>{p.approach}</p>
      <ul className="tags">
        {p.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <div className="actions">
        {live &&
          (internal ? (
            <Link className="btn" to={live}>
              Open the lab
            </Link>
          ) : (
            <a className="btn" href={live} target="_blank" rel="noreferrer">
              Open live app
            </a>
          ))}
        <Link className="btn btn--ghost" to={`/projects/${p.slug}`}>
          Read more
        </Link>
        {p.repo_url && (
          <a className="btn btn--ghost" href={p.repo_url} target="_blank" rel="noreferrer">
            Code
          </a>
        )}
      </div>
    </article>
  )
}
