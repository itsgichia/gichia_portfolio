import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ButtonWall, SydneyClock, Virion, Win } from '../components/Retro'
import useApi from '../components/useApi'

import { COLORS } from '../components/ProjectCard'

/* ------------------------------------------------------------------ left */

function Stars() {
  const links = [
    ['#welcome', 'welcome'],
    ['/projects', 'projects', true],
    ['/lab/rsv', 'rsv lab', true],
    ['/lab/seq', 'sequence lab', true],
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
            This site is a small, hand-built corner of the web. The highlights are below and the{' '}
            <Link to="/projects">full project list</Link> is one page over; the <Link to="/lab/rsv">RSV lab</Link>{' '}
            runs live. The teal mascot is a respiratory
            syncytial virus; it's harmless here.
          </p>
        </div>
      </div>
    </Win>
  )
}

function Featured({ projects, error, loading }) {
  const featured = projects.filter((p) => p.featured)
  const count = projects.length
  return (
    <Win title="featured projects" icon="✩" id="work">
      {loading && <p className="muted">Loading projects…</p>}
      {error && (
        <p className="notice notice--error" role="alert">
          Couldn't load projects from the API ({error.message}). If you're running this locally, start the backend
          on port 8000 and refresh.
        </p>
      )}
      <ol className="featured">
        {featured.map((p, i) => (
          <li key={p.id} style={{ '--c': COLORS[i % COLORS.length] }}>
            <p className="room__no">
              {String(i + 1).padStart(2, '0')} · {p.category}
              {p.status === 'live' && <span className="badge badge--live">live</span>}
            </p>
            <h3 className="featured__title">
              <Link to={p.live_url?.startsWith('/') ? p.live_url : `/projects/${p.slug}`}>{p.title}</Link>
            </h3>
            <p className="room__tagline">{p.tagline}</p>
          </li>
        ))}
      </ol>
      {count > 0 && (
        <div className="actions">
          <Link className="btn" to="/projects">
            All {count} projects, by area
          </Link>
        </div>
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
      <p>Open to full-time roles in health data science, scientific research and software engineering.</p>
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
        <Featured projects={projects.data || []} error={projects.error} loading={projects.loading} />
        <Inventory profile={p} />
        <Contact profile={p} />
      </div>
    </div>
  )
}
