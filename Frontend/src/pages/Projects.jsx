import { Link } from 'react-router-dom'
import { api } from '../api'
import ProjectCard, { COLORS } from '../components/ProjectCard'
import { Win } from '../components/Retro'
import useApi from '../components/useApi'

/**
 * Projects are grouped into areas by their category. A category that isn't
 * listed here lands in "Other work", so new projects added in the admin area
 * still show up.
 */
const AREAS = [
  {
    title: 'software and platforms',
    icon: '▣',
    blurb: 'Things people use: web apps and data tools built end to end.',
    categories: ['Digital health platform', 'Clinical data tool', 'Software', 'Web app', 'Data tool'],
  },
  {
    title: 'modelling and prediction',
    icon: '⚗',
    blurb: 'Statistical and mechanistic models of how disease spreads and who is at risk.',
    categories: ['Infectious disease modelling', 'Clinical prediction', 'Statistics', 'Modelling'],
  },
  {
    title: 'machine learning',
    icon: '◈',
    blurb: 'Learning from clinical text, images and molecules, and testing whether the models hold up.',
    categories: ['Machine learning', 'Deep learning', 'Medical imaging', 'Clinical NLP', 'Drug discovery'],
  },
  {
    title: 'bioinformatics',
    icon: '⌘',
    blurb: 'Sequence and omics data: pipelines, analysis and what they say about disease.',
    categories: ['Bioinformatics', 'Genomics', 'Transcriptomics', 'Omics'],
  },
  {
    title: 'laboratory research',
    icon: '✎',
    blurb: 'Earlier work from the chemistry bench and the computer next to it.',
    categories: ['Computational chemistry', 'Chemistry', 'Laboratory'],
  },
]

const norm = (s) => (s || '').trim().toLowerCase()

function group(projects) {
  const areas = AREAS.map((a) => ({ ...a, items: [] }))
  const other = { title: 'other work', icon: '☾', blurb: '', items: [] }
  for (const p of projects) {
    const area = areas.find((a) => a.categories.some((c) => norm(c) === norm(p.category)))
    ;(area || other).items.push(p)
  }
  return [...areas, other].filter((a) => a.items.length)
}

export default function Projects() {
  const { data, error, loading } = useApi(api.projects)
  const projects = data || []
  const areas = group(projects)
  let n = 0

  return (
    <div className="page">
      <Win title="projects" icon="✩" className="catalog" id="work">
        <h1 className="article__title">Projects</h1>
        <p className="article__lede">
          Everything I've built or studied in enough depth to write up, grouped by what kind of work it is. The{' '}
          <Link to="/lab/rsv">RSV lab</Link> runs live on this server.
        </p>
        {loading && <p className="muted">Loading projects…</p>}
        {error && (
          <p className="notice notice--error" role="alert">
            Couldn't load projects from the API ({error.message}). If you're running this locally, start the backend on
            port 8000 and refresh.
          </p>
        )}
        {areas.length > 1 && (
          <ul className="stars stars--inline" aria-label="Jump to an area">
            {areas.map((a) => (
              <li key={a.title}>
                <a href={`#${a.title.replace(/\s+/g, '-')}`}>{a.title}</a>
              </li>
            ))}
          </ul>
        )}
      </Win>

      {areas.map((a) => (
        <Win key={a.title} title={a.title} icon={a.icon} id={a.title.replace(/\s+/g, '-')}>
          {a.blurb && <p className="muted catalog__blurb">{a.blurb}</p>}
          <div className="rooms">
            {a.items.map((p) => {
              n += 1
              return <ProjectCard key={p.id} p={p} n={n} color={COLORS[(n - 1) % COLORS.length]} />
            })}
          </div>
        </Win>
      ))}
    </div>
  )
}
