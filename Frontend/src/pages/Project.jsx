import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import useApi from '../components/useApi'
import { Win } from '../components/Retro'

export default function Project() {
  const { slug } = useParams()
  const { data: p, error, loading } = useApi(() => api.project(slug), [slug])

  if (loading)
    return (
      <div className="page">
        <Win title="loading…">Loading…</Win>
      </div>
    )
  if (error || !p)
    return (
      <div className="page">
        <Win title="404.txt">
          <h1 className="article__title">Project not found</h1>
          <p className="article__lede">
            It may have been renamed. <Link to="/projects">Go back to all projects</Link>.
          </p>
        </Win>
      </div>
    )

  const live = p.live_url
  return (
    <div className="page">
    <Win title={`${p.slug}.html`} className="article">
      <Link className="back" to="/projects">
        ← all projects
      </Link>
      <h1 className="article__title">{p.title}</h1>
      <p className="article__lede">{p.tagline}</p>

      <div className="article__grid">
        <div className="prose">
          {p.situation && (
            <>
              <h2>The problem</h2>
              <p>{p.situation}</p>
            </>
          )}
          {p.approach && (
            <>
              <h2>What I did</h2>
              <p>{p.approach}</p>
            </>
          )}
          {p.outcome && (
            <>
              <h2>What came of it</h2>
              <p>{p.outcome}</p>
            </>
          )}
          {(live || p.repo_url) && (
            <div className="hero__actions">
              {live &&
                (live.startsWith('/') ? (
                  <Link className="btn" to={live}>
                    Try it live
                  </Link>
                ) : (
                  <a className="btn" href={live} target="_blank" rel="noreferrer">
                    Open live app
                  </a>
                ))}
              {p.repo_url && (
                <a className="btn btn--ghost" href={p.repo_url} target="_blank" rel="noreferrer">
                  View the code
                </a>
              )}
            </div>
          )}
        </div>

        <dl className="aside">
          {p.role && (
            <div>
              <dt>Role</dt>
              <dd>{p.role}</dd>
            </div>
          )}
          {p.year && (
            <div>
              <dt>Year</dt>
              <dd>{p.year}</dd>
            </div>
          )}
          {p.metrics?.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd style={{ fontSize: 'var(--s-25)', fontWeight: 800 }}>{m.value}</dd>
            </div>
          ))}
          {p.tags?.length > 0 && (
            <div>
              <dt>Tools and methods</dt>
              <dd>
                <ul className="tags">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </Win>
    </div>
  )
}
