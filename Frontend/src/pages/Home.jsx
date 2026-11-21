import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import HeroFigure from '../components/HeroFigure'
import { AnzhfrMock, RhipMock } from '../components/ProjectMocks'
import { ButtonWall, SydneyClock, Virion, Win } from '../components/Retro'
import useApi from '../components/useApi'

const COLORS = ['#2dd4bf', '#7cc4f8', '#f5b84a', '#6ee7a8', '#9fb3d1', '#f49a6a']

/* ------------------------------------------------------------------ left */

function Stars() {
  const links = [
    ['#welcome', 'welcome'],
    ['#work', 'projects'],
    ['/lab/rsv', 'rsv lab', true],
    ['#skills', 'skills'],
    ['#contact', 'contact'],
  ]
  return (
    <Win title="navigate" icon="✩">
      <ul className="stars">
        {links.map(([href, label, route]) => (
          <li key={href}>{route ? <Link to={href}>{label}</Link> : <a href={href}>{label}</a>}</li>
        ))}
      </ul>
    </Win>
  )
}

function CurrentStatus({ profile }) {
  return (
    <Win title="current status" icon="☾">
      <div className="status">
        <Virion size={40} className="bob" />
        <div>
          <p className="status__line">{profile?.availability || 'Open to full-time roles'}</p>
          <p className="muted">
            {profile?.location || 'Sydney'} ☾ <SydneyClock />
          </p>
        </div>
      </div>
    </Win>
  )
}

function useCheck(fn) {
  const [ok, setOk] = useState(null)
  useEffect(() => {
    fn()
      .then(() => setOk(true))
      .catch(() => setOk(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ok
}

function SystemStatus() {
  const apiOk = useCheck(api.health)
  const rsvOk = useCheck(api.rsvDefaults)
  const rows = [
    ['lab.api', apiOk],
    ['rsv.model', rsvOk],
  ]
  return (
    <Win title="systems status" icon="⚙">
      <ul className="sys">
        {rows.map(([name, ok]) => (
          <li key={name}>
            <span className={ok == null ? 'sys--wait' : ok ? 'sys--ok' : 'sys--fail'}>
              [{ok == null ? ' .. ' : ok ? ' OK ' : 'FAIL'}]
            </span>{' '}
            {name}
          </li>
        ))}
      </ul>
    </Win>
  )
}

function Elsewhere({ profile }) {
  return (
    <Win title="links" icon="✈">
      <ul className="stars">
        {profile?.github && (
          <li>
            <a href={profile.github} target="_blank" rel="noreferrer">
              github
            </a>
          </li>
        )}
        {profile?.linkedin && (
          <li>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              linkedin
            </a>
          </li>
        )}
        <li>
          <a href="https://github.com/itsgichia/rsv-transmission-model" target="_blank" rel="noreferrer">
            rsv model source
          </a>
        </li>
      </ul>
    </Win>
  )
}

/* ---------------------------------------------------------------- centre */

function Welcome({ profile }) {
  return (
    <Win title="welcome" icon="☾" id="welcome">
      <div className="welcome">
        <div>
          <h1 className="welcome__name">{profile?.name || 'Gichia Muiruri'}</h1>
          <p className="welcome__headline">{profile?.headline}</p>
          <p>{profile?.bio}</p>
          <p className="welcome__note">
            This site is a small, hand-built corner of the web. Browse the projects below, including the{' '}
            <Link to="/lab/rsv">RSV transmission lab</Link>, which runs live. The teal mascot is a respiratory
            syncytial virus; it's harmless here.
          </p>
        </div>
      </div>
    </Win>
  )
}

function ProjectVisual({ p, color }) {
  if (p.image_url) return <img className="room__shot" src={p.image_url} alt={`Screenshot of ${p.title}`} loading="lazy" />
  if (p.slug === 'rsv-transmission-lab') return <HeroFigure />
  if (p.slug === 'rhip-connect') return <RhipMock />
  if (p.slug === 'anzhfr-cohort-builder') return <AnzhfrMock />
  return (
    <div className="room__blank" style={{ '--c': color }} aria-hidden="true">
      <span>{p.title}</span>
    </div>
  )
}

function Room({ p, color, n }) {
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

function Projects({ projects, error, loading }) {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)
  return (
    <Win title="projects" icon="✩" id="work">
      {loading && <p className="muted">Loading projects…</p>}
      {error && (
        <p className="notice notice--error" role="alert">
          Couldn't load projects from the API ({error.message}). If you're running this locally, start the backend
          on port 8000 and refresh.
        </p>
      )}
      <div className="rooms">
        {featured.map((p, i) => (
          <Room key={p.id} p={p} n={1 + i} color={COLORS[i % COLORS.length]} />
        ))}
      </div>
      {rest.length > 0 && (
        <>
          <h3 className="subhead">☾ research</h3>
          <ul className="archive">
            {rest.map((p) => (
              <li key={p.id}>
                <Link to={`/projects/${p.slug}`}>
                  <strong>{p.title}</strong>
                </Link>{' '}
                <span className="muted">({p.category})</span>
                <br />
                {p.tagline}
              </li>
            ))}
          </ul>
        </>
      )}
    </Win>
  )
}

function Inventory({ profile }) {
  if (!profile?.skills?.length) return null
  return (
    <Win title="skills" icon="⚗" id="skills">
      <dl className="inventory">
        {profile.skills.map((g, i) => (
          <div key={g.group}>
            <dt style={{ color: COLORS[i % COLORS.length] }}>{g.group}</dt>
            <dd>
              <ul className="tags">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Win>
  )
}

function Contact({ profile }) {
  const phone = profile?.phone?.trim()
  const rows = [
    { label: 'email', value: profile?.email, href: profile?.email && `mailto:${profile.email}` },
    { label: 'linkedin', value: profile?.linkedin?.replace(/^https?:\/\/(www\.)?/, ''), href: profile?.linkedin },
    { label: 'phone', value: phone, href: phone && `tel:${phone.replace(/[^\d+]/g, '')}` },
  ].filter((r) => r.value && r.href)

  return (
    <Win title="contact" icon="☎" id="contact">
      <p>Open to full-time roles in health data science, biostatistics, research and software engineering.</p>
      <dl className="contact">
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>
              <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {r.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </Win>
  )
}

export default function Home() {
  const profile = useApi(api.profile)
  const projects = useApi(api.projects)
  const p = profile.data

  return (
    <div className="lobby">
      <aside className="lobby__left">
        <Stars />
        <CurrentStatus profile={p} />
        <SystemStatus />
        <Elsewhere profile={p} />
        <Win title="made with" icon="▣">
          <ButtonWall />
        </Win>
      </aside>

      <div className="lobby__main">
        <Welcome profile={p} />
        <Projects projects={projects.data || []} error={projects.error} loading={projects.loading} />
        <Inventory profile={p} />
        <Contact profile={p} />
      </div>
    </div>
  )
}
