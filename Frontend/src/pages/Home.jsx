import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import HeroFigure from '../components/HeroFigure'
import { useLive } from '../components/live'
import { AnzhfrMock, RhipMock } from '../components/ProjectMocks'
import { ButtonWall, SydneyClock, Toggles, Virion, Win } from '../components/Retro'
import useApi from '../components/useApi'

const COLORS = ['#ff77a8', '#7fdbff', '#ffd36e', '#a6ff8f', '#c3a6ff', '#ff9e5e']
const NAME_KEY = 'lab_chat_name'

const readName = () => {
  try {
    return localStorage.getItem(NAME_KEY) || ''
  } catch {
    return ''
  }
}

/* ------------------------------------------------------------------ left */

function Stars() {
  const links = [
    ['#welcome', 'welcome'],
    ['#work', 'projects'],
    ['/lab/rsv', 'rsv lab', true],
    ['#cv', 'résumé'],
    ['#skills', 'inventory'],
    ['#guestbook', 'guestbook'],
    ['#contact', 'contact'],
  ]
  return (
    <Win title="stars" icon="✩">
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

function SystemStatus({ guestbookOk }) {
  const { status } = useLive()
  const apiOk = useCheck(api.health)
  const rsvOk = useCheck(api.rsvDefaults)
  const rows = [
    ['lab.api', apiOk],
    ['rsv.model', rsvOk],
    ['guestbook.db', guestbookOk],
    ['live.socket', status === 'open' ? true : status === 'closed' ? false : null],
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

/* ---------------------------------------------------------------- centre */

function Welcome({ profile }) {
  return (
    <Win title="welcome!" icon="☾" id="welcome">
      <div className="welcome">
        <div>
          <h1 className="welcome__name">{profile?.name || 'Gichia Muiruri'}</h1>
          <p className="welcome__headline">{profile?.headline}</p>
          <p>{profile?.bio}</p>
          <p className="welcome__note">
            This is my little corner of the web. Have a look around the rooms, poke the{' '}
            <Link to="/lab/rsv">RSV model</Link>, and leave a note in the guestbook. The pink blob is a respiratory
            syncytial virus. It's friendly here.
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
  return (
    <article id={p.slug} className="room" style={{ '--c': color }}>
      <p className="room__no">
        room {String(n).padStart(3, '0')} ☾ {p.category}
        {p.status === 'live' && <span className="badge badge--live">live!</span>}
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
          (live.startsWith('/') ? (
            <Link className="btn" to={live}>
              ▶ open live app
            </Link>
          ) : (
            <a className="btn" href={live} target="_blank" rel="noreferrer">
              ▶ open live app
            </a>
          ))}
        <Link className="btn btn--ghost" to={`/projects/${p.slug}`}>
          read more
        </Link>
        {p.repo_url && (
          <a className="btn btn--ghost" href={p.repo_url} target="_blank" rel="noreferrer">
            {'</>'} code
          </a>
        )}
      </div>
    </article>
  )
}

function Projects({ projects, error }) {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)
  return (
    <Win title="projects" icon="✩" id="work">
      {error && <p className="notice notice--error">Couldn't load projects: {error.message}</p>}
      <div className="rooms">
        {featured.map((p, i) => (
          <Room key={p.id} p={p} n={101 + i} color={COLORS[i % COLORS.length]} />
        ))}
      </div>
      {rest.length > 0 && (
        <>
          <h3 className="subhead">☾ research archive</h3>
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

function Resume() {
  const exp = useApi(api.experience)
  const edu = useApi(api.education)
  return (
    <Win title="résumé.txt" icon="✎" id="cv">
      <h3 className="subhead">☾ experience</h3>
      <ul className="log">
        {(exp.data || []).map((e) => (
          <li key={e.id}>
            <details>
              <summary>
                <span className="log__when">{e.period}</span> <strong>{e.title}</strong> @ {e.org}
              </summary>
              {e.location && <p className="muted">{e.location}</p>}
              <ul className="plain">
                {e.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
      <h3 className="subhead">☾ education</h3>
      <ul className="log">
        {(edu.data || []).map((e) => (
          <li key={e.id}>
            <span className="log__when">{e.period}</span> <strong>{e.title}</strong>, {e.institution}
            {e.detail && <p className="muted">{e.detail}</p>}
          </li>
        ))}
      </ul>
    </Win>
  )
}

function Inventory({ profile }) {
  if (!profile?.skills?.length) return null
  return (
    <Win title="inventory" icon="⚗" id="skills">
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

function Guestbook({ entries, reload }) {
  const [form, setForm] = useState({ name: '', site: '', message: '', website: '' })
  const [state, setState] = useState({ busy: false, error: null, done: false })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, error: null, done: false })
    try {
      await api.signGuestbook({ ...form, site: form.site.trim() || null })
      setForm({ name: '', site: '', message: '', website: '' })
      setState({ busy: false, error: null, done: true })
      reload()
    } catch (err) {
      setState({ busy: false, error: err.message, done: false })
    }
  }

  return (
    <Win title="guestbook" icon="✉" id="guestbook">
      <form className="form form--retro" onSubmit={submit}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="gb-name">name</label>
            <input id="gb-name" required maxLength={60} value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="gb-site">your site (optional)</label>
            <input id="gb-site" type="url" placeholder="https://" maxLength={200} value={form.site} onChange={set('site')} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="gb-msg">message</label>
          <textarea id="gb-msg" required minLength={2} maxLength={1000} value={form.message} onChange={set('message')} />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor="gb-website">Leave this empty</label>
          <input id="gb-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </div>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
        {state.done && <p className="notice" role="status">Thank you for signing! ✩</p>}
        <div>
          <button className="btn" type="submit" disabled={state.busy}>
            {state.busy ? 'signing…' : '✎ sign the guestbook'}
          </button>
        </div>
      </form>
      <ol className="entries">
        {entries.length === 0 && <li className="muted">No entries yet. Be the first!</li>}
        {entries.map((g) => (
          <li key={g.id} className="entry">
            <p className="entry__head">
              <strong>
                {g.site ? (
                  <a href={g.site} target="_blank" rel="noreferrer nofollow ugc">
                    {g.name}
                  </a>
                ) : (
                  g.name
                )}
              </strong>{' '}
              <span className="muted">{new Date(g.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </p>
            <p className="entry__msg">{g.message}</p>
          </li>
        ))}
      </ol>
    </Win>
  )
}

function Contact({ profile }) {
  const [form, setForm] = useState({ name: '', email: '', organisation: '', body: '', website: '' })
  const [state, setState] = useState({ busy: false, error: null, done: false })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setState({ busy: true, error: null, done: false })
    try {
      await api.contact(form)
      setForm({ name: '', email: '', organisation: '', body: '', website: '' })
      setState({ busy: false, error: null, done: true })
    } catch (err) {
      setState({ busy: false, error: err.message, done: false })
    }
  }
  const links = [
    { label: 'email', value: profile?.email, href: profile?.email && `mailto:${profile.email}` },
    { label: 'linkedin', value: 'gichia-muiruri', href: profile?.linkedin },
    { label: 'github', value: 'itsgichia', href: profile?.github },
  ].filter((l) => l.value && l.href)

  return (
    <Win title="contact" icon="☎" id="contact">
      <p>
        Open to full-time roles in health data science, biostatistics, research and software engineering. Email is
        quickest, or send a message from here.
      </p>
      <ul className="stars stars--inline">
        {links.map((l) => (
          <li key={l.label}>
            {l.label}:{' '}
            <a href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
              {l.value}
            </a>
          </li>
        ))}
      </ul>
      <form className="form form--retro" onSubmit={submit}>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="c-name">name</label>
            <input id="c-name" required maxLength={120} value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="c-email">email</label>
            <input id="c-email" type="email" required value={form.email} onChange={set('email')} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="c-org">organisation (optional)</label>
          <input id="c-org" maxLength={200} value={form.organisation} onChange={set('organisation')} />
        </div>
        <div className="field">
          <label htmlFor="c-body">message</label>
          <textarea id="c-body" required minLength={5} maxLength={4000} value={form.body} onChange={set('body')} />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor="c-website">Leave this empty</label>
          <input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
        </div>
        {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
        {state.done && <p className="notice" role="status">Message sent. I'll get back to you soon.</p>}
        <div>
          <button className="btn" type="submit" disabled={state.busy}>
            {state.busy ? 'sending…' : '✉ send message'}
          </button>
        </div>
      </form>
    </Win>
  )
}

/* ----------------------------------------------------------------- right */

function Chat() {
  const { status, online, messages, notice, sendChat } = useLive()
  const [name, setName] = useState(readName)
  const [text, setText] = useState('')
  const logRef = useRef()

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      localStorage.setItem(NAME_KEY, name)
    } catch {
      /* fine */
    }
    sendChat(name, text)
    setText('')
  }

  return (
    <Win title="chat" icon="☁">
      <p className="muted chat__online">{status === 'open' ? `${online} online` : 'chat is asleep zzz'}</p>
      <ol className="chat" ref={logRef} aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && <li className="muted">it's quiet in here…</li>}
        {messages.map((m) => (
          <li key={`${m.at}-${m.name}-${m.text}`}>
            <b style={{ color: m.color }}>{m.name}:</b> {m.text}
          </li>
        ))}
      </ol>
      <form className="chat__form" onSubmit={submit}>
        <label className="sr-only" htmlFor="chat-name">
          Your name
        </label>
        <input id="chat-name" placeholder="name" maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
        <label className="sr-only" htmlFor="chat-text">
          Message
        </label>
        <input id="chat-text" placeholder="say something nice" maxLength={280} value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn--small" type="submit" disabled={status !== 'open'}>
          send
        </button>
      </form>
      {notice && <p className="muted">{notice}</p>}
      <p className="muted chat__rules">be kind ☾ messages vanish when the server restarts</p>
    </Win>
  )
}

function Elsewhere({ profile }) {
  return (
    <Win title="elsewhere" icon="✈">
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

export default function Home() {
  const profile = useApi(api.profile)
  const projects = useApi(api.projects)
  const [gbTick, setGbTick] = useState(0)
  const guestbook = useApi(api.guestbook, [gbTick])
  const p = profile.data

  return (
    <div className="lobby">
      <aside className="lobby__left">
        <Stars />
        <CurrentStatus profile={p} />
        <SystemStatus guestbookOk={guestbook.loading ? null : !guestbook.error} />
        <Win title="toggles" icon="⚑">
          <Toggles />
        </Win>
      </aside>

      <div className="lobby__main">
        <Welcome profile={p} />
        <Projects projects={projects.data || []} error={projects.error} />
        <Resume />
        <Inventory profile={p} />
        <Guestbook entries={guestbook.data || []} reload={() => setGbTick((t) => t + 1)} />
        <Contact profile={p} />
      </div>

      <aside className="lobby__right">
        <Chat />
        <Elsewhere profile={p} />
        <Win title="buttons" icon="▣">
          <ButtonWall />
          <p className="muted">↑ made with, made of, made by hand</p>
        </Win>
      </aside>
    </div>
  )
}
