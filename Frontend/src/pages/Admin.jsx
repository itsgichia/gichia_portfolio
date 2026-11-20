import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

/* ---------- helpers to edit lists as plain text ---------- */
const statsToText = (list = []) => list.map((m) => `${m.value} | ${m.label}`).join('\n')
const textToStats = (t) =>
  t
    .split('\n')
    .map((l) => l.split('|').map((s) => s.trim()))
    .filter(([v, l]) => v && l)
    .map(([value, label]) => ({ value, label }))
const skillsToText = (list = []) => list.map((g) => `${g.group}: ${g.items.join(', ')}`).join('\n')
const textToSkills = (t) =>
  t
    .split('\n')
    .map((l) => l.split(':'))
    .filter((p) => p.length > 1 && p[0].trim())
    .map(([group, ...rest]) => ({
      group: group.trim(),
      items: rest.join(':').split(',').map((s) => s.trim()).filter(Boolean),
    }))

const BLANK = {
  slug: '',
  title: '',
  tagline: '',
  category: '',
  role: '',
  year: '',
  status: 'completed',
  situation: '',
  approach: '',
  outcome: '',
  tags: [],
  metrics: [],
  live_url: '',
  repo_url: '',
  image_url: '',
  featured: false,
  published: false,
  order_index: 99,
}

function Field({ id, label, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

function ProjectForm({ initial, onSaved, onCancel }) {
  const [p, setP] = useState({ ...BLANK, ...initial, live_url: initial.live_url || '', repo_url: initial.repo_url || '', image_url: initial.image_url || '' })
  const [tags, setTags] = useState((initial.tags || []).join(', '))
  const [metrics, setMetrics] = useState(statsToText(initial.metrics))
  const [msg, setMsg] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (k) => (e) => setP({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = async (e) => {
    e.preventDefault()
    const body = {
      ...p,
      order_index: Number(p.order_index) || 0,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      metrics: textToStats(metrics),
      live_url: p.live_url || null,
      repo_url: p.repo_url || null,
      image_url: p.image_url || null,
    }
    delete body.id
    delete body.updated_at
    try {
      const saved = initial.id ? await api.admin.updateProject(initial.id, body) : await api.admin.createProject(body)
      onSaved(saved, initial.id ? 'Saved' : 'Created')
    } catch (err) {
      setMsg(err.message)
    }
  }

  const remove = async () => {
    try {
      await api.admin.deleteProject(initial.id)
      onSaved(null, 'Deleted')
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <form className="form" onSubmit={save}>
      <h2 style={{ fontSize: 'var(--s-25)' }}>{initial.id ? `Edit ${initial.title}` : 'New project'}</h2>
      <div className="grid-2">
        <Field id="p-title" label="Title">
          <input id="p-title" required value={p.title} onChange={set('title')} />
        </Field>
        <Field id="p-slug" label="Web address" hint="Lower case words joined by hyphens, e.g. rsv-transmission-lab">
          <input id="p-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={p.slug} onChange={set('slug')} />
        </Field>
      </div>
      <Field id="p-tagline" label="One-line summary">
        <input id="p-tagline" value={p.tagline} onChange={set('tagline')} />
      </Field>
      <div className="grid-2">
        <Field id="p-cat" label="Category">
          <input id="p-cat" value={p.category} onChange={set('category')} />
        </Field>
        <Field id="p-role" label="Your role">
          <input id="p-role" value={p.role} onChange={set('role')} />
        </Field>
        <Field id="p-year" label="Year">
          <input id="p-year" value={p.year} onChange={set('year')} />
        </Field>
        <Field id="p-status" label="Status">
          <select id="p-status" value={p.status} onChange={set('status')}>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In progress</option>
          </select>
        </Field>
      </div>
      <Field id="p-sit" label="The problem">
        <textarea id="p-sit" value={p.situation} onChange={set('situation')} />
      </Field>
      <Field id="p-app" label="What I did">
        <textarea id="p-app" value={p.approach} onChange={set('approach')} />
      </Field>
      <Field id="p-out" label="What came of it">
        <textarea id="p-out" value={p.outcome} onChange={set('outcome')} />
      </Field>
      <div className="grid-2">
        <Field id="p-tags" label="Tools and methods" hint="Separate with commas">
          <input id="p-tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>
        <Field id="p-metrics" label="Key numbers" hint="One per line: 0.82 | AUC">
          <textarea id="p-metrics" style={{ minHeight: 90 }} value={metrics} onChange={(e) => setMetrics(e.target.value)} />
        </Field>
        <Field id="p-live" label="Live link" hint="Full address, or /lab/rsv for a page on this site">
          <input id="p-live" value={p.live_url} onChange={set('live_url')} />
        </Field>
        <Field id="p-repo" label="Code link">
          <input id="p-repo" value={p.repo_url} onChange={set('repo_url')} />
        </Field>
        <Field id="p-img" label="Screenshot" hint="e.g. /shots/rhip-connect.png (file in Frontend/public/shots)">
          <input id="p-img" value={p.image_url} onChange={set('image_url')} />
        </Field>
        <Field id="p-order" label="Order" hint="Lower numbers show first">
          <input id="p-order" type="number" value={p.order_index} onChange={set('order_index')} />
        </Field>
      </div>
      <label className="check">
        <input type="checkbox" checked={p.featured} onChange={set('featured')} /> Feature at the top of Work
      </label>
      <label className="check">
        <input type="checkbox" checked={p.published} onChange={set('published')} /> Published (visible to visitors)
      </label>
      {msg && (
        <p className="notice notice--error" role="alert">
          {msg}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn" type="submit">
          {initial.id ? 'Save changes' : 'Create project'}
        </button>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        {initial.id &&
          (confirmDelete ? (
            <button className="btn btn--danger" type="button" onClick={remove}>
              Confirm delete
            </button>
          ) : (
            <button className="btn btn--danger" type="button" onClick={() => setConfirmDelete(true)}>
              Delete project
            </button>
          ))}
      </div>
    </form>
  )
}

function ProjectsTab({ flash }) {
  const [projects, setProjects] = useState([])
  const [editing, setEditing] = useState(null)
  const load = () => api.admin.projects().then(setProjects).catch((e) => flash(e.message, true))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (editing)
    return (
      <ProjectForm
        initial={editing}
        onCancel={() => setEditing(null)}
        onSaved={(_, verb) => {
          flash(`${verb}.`)
          setEditing(null)
          load()
        }}
      />
    )

  return (
    <>
      <button className="btn" onClick={() => setEditing({ ...BLANK })}>
        New project
      </button>
      <ul className="admin-list" style={{ marginTop: '1rem' }}>
        {projects.map((p) => (
          <li key={p.id}>
            <div>
              <strong>{p.title}</strong>
              <div className="muted">
                {p.category || 'No category'}
                {p.featured ? ', featured' : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className={`badge ${p.published ? '' : 'status-draft'}`}>{p.published ? 'Published' : 'Draft'}</span>
              <button className="btn btn--ghost btn--small" onClick={() => setEditing(p)}>
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function ProfileTab({ flash }) {
  const [p, setP] = useState(null)
  const [highlights, setHighlights] = useState('')
  const [skills, setSkills] = useState('')
  useEffect(() => {
    api.profile().then((d) => {
      setP(d)
      setHighlights(statsToText(d.highlights))
      setSkills(skillsToText(d.skills))
    })
  }, [])
  if (!p) return <p>Loading…</p>
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    try {
      await api.admin.updateProfile({ ...p, highlights: textToStats(highlights), skills: textToSkills(skills) })
      flash('Profile saved.')
    } catch (err) {
      flash(err.message, true)
    }
  }

  return (
    <form className="form" onSubmit={save}>
      <div className="grid-2">
        <Field id="f-name" label="Name">
          <input id="f-name" value={p.name} onChange={set('name')} />
        </Field>
        <Field id="f-avail" label="Availability">
          <input id="f-avail" value={p.availability} onChange={set('availability')} />
        </Field>
      </div>
      <Field id="f-head" label="Headline">
        <input id="f-head" value={p.headline} onChange={set('headline')} />
      </Field>
      <Field id="f-bio" label="About you">
        <textarea id="f-bio" value={p.bio} onChange={set('bio')} />
      </Field>
      <div className="grid-2">
        <Field id="f-email" label="Email">
          <input id="f-email" value={p.email} onChange={set('email')} />
        </Field>
        <Field id="f-loc" label="Location">
          <input id="f-loc" value={p.location} onChange={set('location')} />
        </Field>
        <Field id="f-li" label="LinkedIn">
          <input id="f-li" value={p.linkedin || ''} onChange={set('linkedin')} />
        </Field>
        <Field id="f-gh" label="GitHub">
          <input id="f-gh" value={p.github || ''} onChange={set('github')} />
        </Field>
      </div>
      <Field id="f-hl" label="Headline numbers" hint="One per line: 86.2 | WAM, High Distinction, UNSW">
        <textarea id="f-hl" value={highlights} onChange={(e) => setHighlights(e.target.value)} />
      </Field>
      <Field id="f-sk" label="Skills" hint="One group per line: Languages: Python, R, SQL">
        <textarea id="f-sk" style={{ minHeight: 180 }} value={skills} onChange={(e) => setSkills(e.target.value)} />
      </Field>
      <div>
        <button className="btn" type="submit">
          Save profile
        </button>
      </div>
    </form>
  )
}

function MessagesTab({ flash }) {
  const [msgs, setMsgs] = useState(null)
  const load = () => api.admin.messages().then(setMsgs).catch((e) => flash(e.message, true))
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (!msgs) return <p>Loading…</p>
  if (!msgs.length) return <p className="section__intro">No messages yet. Messages from the contact form will appear here.</p>
  return (
    <ul className="admin-list">
      {msgs.map((m) => (
        <li key={m.id} style={{ alignItems: 'start' }}>
          <div>
            <strong>
              {m.name} {m.organisation && `(${m.organisation})`}
            </strong>
            <div className="muted">
              <a href={`mailto:${m.email}`}>{m.email}</a>, {new Date(m.created_at).toLocaleString('en-AU')}
            </div>
            <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', maxWidth: '70ch' }}>{m.body}</p>
          </div>
          {m.read ? (
            <span className="badge">Read</span>
          ) : (
            <button className="btn btn--ghost btn--small" onClick={() => api.admin.markRead(m.id).then(load)}>
              Mark as read
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('projects')
  const [notice, setNotice] = useState(null)
  const flash = (text, isError = false) => {
    setNotice({ text, isError })
    if (isError && /sign in/i.test(text)) navigate('/admin/login')
  }

  useEffect(() => {
    if (!api.isSignedIn()) navigate('/admin/login', { replace: true })
  }, [navigate])

  if (!api.isSignedIn()) return null

  const tabs = [
    ['projects', 'Projects'],
    ['profile', 'Profile'],
    ['messages', 'Messages'],
  ]

  return (
    <div className="wrap admin">
      <div className="section__head">
        <h1 className="section__title">Site admin</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="btn btn--ghost btn--small" to="/">
            View site
          </Link>
          <button
            className="btn btn--ghost btn--small"
            onClick={() => {
              api.logout()
              navigate('/')
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      {notice && (
        <p className={`notice${notice.isError ? ' notice--error' : ''}`} role="status" style={{ marginBottom: '1rem' }}>
          {notice.text}
        </p>
      )}
      {tab === 'projects' && <ProjectsTab flash={flash} />}
      {tab === 'profile' && <ProfileTab flash={flash} />}
      {tab === 'messages' && <MessagesTab flash={flash} />}
    </div>
  )
}
