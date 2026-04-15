import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await login(pw); nav('/admin') }
    catch { setErr('Invalid password') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 360, border: '1px solid var(--border)', borderRadius: 12, padding: '2.5rem', background: 'var(--bg1)' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Admin Access</p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem' }}>Sign in</h1>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
            style={{ background: 'var(--bg)', border: `1px solid ${err ? '#ff6b9d' : 'var(--border)'}`, borderRadius: 6, padding: '0.75rem 1rem', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: '0.9rem', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = err ? '#ff6b9d' : 'var(--border2)'}
            onBlur={e => e.target.style.borderColor = err ? '#ff6b9d' : 'var(--border)'} />
          {err && <p style={{ color: '#ff6b9d', fontSize: '0.78rem', fontFamily: 'var(--mono)' }}>{err}</p>}
          <button type="submit" disabled={loading || !pw} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 6, padding: '0.75rem', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: loading || !pw ? 0.5 : 1 }}>
            {loading ? '...' : 'Enter'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Default: gichia2026</p>
      </div>
    </div>
  )
}
