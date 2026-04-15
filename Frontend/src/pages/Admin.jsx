import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, getProfile, createProject, updateProject, deleteProject, updateProfile, logout, isAdmin } from '../api'

const iStyle = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 12px', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '0.82rem', outline: 'none', transition: 'border-color 0.2s' }
const lStyle = { display: 'block', fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.35rem' }

const empty = { title: '', tagline: '', description: '', tags: '', link: '', github: '', status: 'completed', featured: false, order_index: 0, image_color: '#4fffb0' }

export default function Admin() {
  const nav = useNavigate()
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState({})
  const [tab, setTab] = useState('projects')
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [profForm, setProfForm] = useState({})
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin()) { nav('/login'); return }
    Promise.all([getProjects(), getProfile()]).then(([p, pr]) => { setProjects(p); setProfile(pr); setProfForm(pr) })
  }, [])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500) }

  async function saveProject(e) {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), order_index: Number(form.order_index), featured: Boolean(form.featured) }
      if (editId) { await updateProject(editId, payload); flash('Updated ✓') }
      else { await createProject(payload); flash('Created ✓') }
      const fresh = await getProjects(); setProjects(fresh)
      setForm(empty); setEditId(null)
    } catch { flash('Error saving') }
    setSaving(false)
  }

  function startEdit(p) {
    setForm({ ...p, tags: p.tags.join(', ') }); setEditId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    await deleteProject(id)
    setProjects(p => p.filter(x => x.id !== id))
    flash('Deleted')
  }

  async function saveProfile(e) {
    e.preventDefault(); setSaving(true)
    try { await updateProfile(profForm); flash('Profile saved ✓') }
    catch { flash('Error') }
    setSaving(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Admin</p>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => nav('/')} style={ghostBtn}>← Portfolio</button>
            <button onClick={() => { logout(); nav('/') }} style={ghostBtn}>Logout</button>
          </div>
        </div>

        {msg && <div style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: 6, padding: '0.6rem 1rem', color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
          {['projects', 'profile'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', padding: '0.6rem 1.25rem', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', color: tab === t ? 'var(--text)' : 'var(--muted)', borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`, marginBottom: -1, textTransform: 'capitalize', transition: 'color 0.15s' }}>{t}</button>
          ))}
        </div>

        {tab === 'projects' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
            <form onSubmit={saveProject} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>{editId ? 'Edit' : 'Add'} project</h2>
              {[['title','Title *',true], ['tagline','Tagline',''], ['link','Live URL',''], ['github','GitHub URL','']].map(([k,l,req]) => (
                <div key={k}><label style={lStyle}>{l}</label><input required={!!req} style={iStyle} value={form[k]||''} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--border2)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
              ))}
              <div><label style={lStyle}>Tags (comma-separated)</label><input style={iStyle} value={form.tags||''} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--border2)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><label style={lStyle}>Status</label><select style={iStyle} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                  {['completed','in-progress','planned'].map(s=><option key={s} value={s}>{s}</option>)}
                </select></div>
                <div><label style={lStyle}>Accent colour</label><input type="color" style={{...iStyle,height:38,padding:'4px'}} value={form.image_color} onChange={e=>setForm(f=>({...f,image_color:e.target.value}))}/></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                <div><label style={lStyle}>Order</label><input type="number" style={iStyle} value={form.order_index} onChange={e=>setForm(f=>({...f,order_index:e.target.value}))}/></div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', cursor: 'pointer', paddingTop: '1.2rem' }}>
                  <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} /> Featured
                </label>
              </div>
              <div><label style={lStyle}>Description</label><textarea style={{ ...iStyle, resize: 'vertical', minHeight: 80 }} value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--border2)'} onBlur={e=>e.target.style.borderColor='var(--border)'} /></div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '0.7rem', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? '...' : (editId ? 'Save' : 'Add project')}</button>
                {editId && <button type="button" onClick={() => { setForm(empty); setEditId(null) }} style={{ ...ghostBtn, padding: '0.7rem 1rem' }}>Cancel</button>}
              </div>
            </form>

            <div>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem' }}>Projects — {projects.length}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {projects.map(p => (
                  <div key={p.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title} {p.featured && <span style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>★</span>}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)} style={{ ...ghostBtn, padding: '3px 10px', fontSize: '0.68rem' }}>edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 10px', fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--muted)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ff6b9d'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>del</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[['name','Name'],['role','Role / Title'],['bio','Bio'],['location','Location'],['email','Email'],['github','GitHub URL'],['linkedin','LinkedIn URL']].map(([k,l]) => (
              <div key={k}><label style={lStyle}>{l}</label><input style={iStyle} value={profForm[k]||''} onChange={e=>setProfForm(f=>({...f,[k]:e.target.value}))} onFocus={e=>e.target.style.borderColor='var(--border2)'} onBlur={e=>e.target.style.borderColor='var(--border)'}/></div>
            ))}
            <button type="submit" disabled={saving} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '0.7rem', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem', opacity: saving ? 0.6 : 1, maxWidth: 200 }}>{saving ? '...' : 'Save profile'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

const ghostBtn = { background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 14px', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--muted)', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }
