// Small decorative building blocks for the retro "lab" look.
import { useEffect, useRef, useState } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A Win98-style panel. The "_" button really does roll the window up. */
export function Win({ title, icon = '✩', id, className = '', children, actions }) {
  const [open, setOpen] = useState(true)
  return (
    <section id={id} className={`win ${className}`}>
      <header className="win__bar">
        <h2 className="win__title">
          <span aria-hidden="true">{icon}</span> {title}
        </h2>
        <div className="win__btns">
          {actions}
          <button type="button" aria-expanded={open} aria-label={open ? `Collapse ${title}` : `Expand ${title}`} onClick={() => setOpen((o) => !o)}>
            {open ? '_' : '□'}
          </button>
        </div>
      </header>
      {open && <div className="win__body">{children}</div>}
    </section>
  )
}

const mirror = (rows) => rows.map((r) => r + [...r].reverse().join(''))

// A friendly RSV virion: the left half is drawn and mirrored for symmetry.
const VIRION = mirror([
  '....s..s',
  '.....o.o',
  '...ooooo',
  '..obbbbb',
  '.obhhbbb',
  'sobhbbbb',
  '.obbbweb',
  '.obbbeeb',
  'sobbbbbb',
  '.obbpbbb',
  '.obbbbmb',
  '..obbbbm',
  '...ooooo',
  '.....o.o',
  '....s..s',
])
const VIRION_COLORS = { o: '#0f2a3a', b: '#2dd4bf', h: '#b8f5ec', s: '#f5b84a', e: '#0b1220', w: '#ffffff', p: '#14b8a6', m: '#0b1220' }

export function Virion({ size = 64, className = '' }) {
  const h = VIRION.length
  const w = VIRION[0].length
  return (
    <svg className={`sprite ${className}`} width={size} height={(size * h) / w} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges" aria-hidden="true">
      {VIRION.flatMap((row, y) =>
        [...row].map((ch, x) => (VIRION_COLORS[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={VIRION_COLORS[ch]} /> : null)),
      )}
    </svg>
  )
}

/** Classic 88x31 web buttons, drawn in CSS rather than borrowed GIFs. */
const BUTTONS = [
  { a: 'PYTHON', b: 'powered', bg: '#1e3a5f', fg: '#f5b84a' },
  { a: 'R', b: 'stats inside', bg: '#1f4e8c', fg: '#ffffff' },
  { a: 'FastAPI', b: 'served', bg: '#0f766e', fg: '#ffffff' },
  { a: 'REACT', b: 'v19', bg: '#1b2640', fg: '#7cc4f8' },
  { a: 'SQL', b: 'inside', bg: '#8a5a1b', fg: '#ffffff' },
  { a: 'SEIRS', b: 'model ok', bg: '#2dd4bf', fg: '#0b1220' },
  { a: 'UNSW', b: 'HDS 2026', bg: '#f5b84a', fg: '#0b1220' },
  { a: 'NO', b: 'trackers', bg: '#0b1220', fg: '#6ee7a8' },
  { a: 'ANY', b: 'browser', bg: '#9fb3d1', fg: '#0b1220' },
  { a: 'HAND', b: 'made', bg: '#334155', fg: '#ffffff' },
  { a: 'PYTORCH', b: 'tensors', bg: '#7a2f1c', fg: '#ffffff' },
  { a: 'RDKit', b: 'molecules', bg: '#1f4e3d', fg: '#6ee7a8' },
  { a: 'DOCKER', b: 'shipped', bg: '#14467a', fg: '#7cc4f8' },
  { a: 'PYTEST', b: 'all green', bg: '#1b2640', fg: '#6ee7a8' },
  { a: 'CSS', b: 'by hand', bg: '#4a2a6a', fg: '#ffffff' },
  { a: 'SQLITE', b: 'embedded', bg: '#1e3a5f', fg: '#9fb3d1' },
  { a: 'VITE', b: 'bundled', bg: '#3b2a7a', fg: '#f5b84a' },
  { a: 'REDUCED', b: 'motion ok', bg: '#2a3a57', fg: '#6ee7a8' },
  { a: 'NO', b: 'cookies', bg: '#6b1f2e', fg: '#ffffff' },
  { a: '800x600', b: 'friendly', bg: '#9fb3d1', fg: '#0b1220' },
]

export function ButtonWall() {
  return (
    <ul className="buttons" aria-label="Things this site is made with">
      {BUTTONS.map((b) => (
        <li key={b.a} className="b88" style={{ '--bg': b.bg, '--fg': b.fg }}>
          <strong>{b.a}</strong>
          <span>{b.b}</span>
        </li>
      ))}
    </ul>
  )
}

/** Canvas rain across the whole window, drawn behind content. Off for reduced-motion users. */
export function Rain() {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reducedMotion()) return
    const ctx = canvas.getContext('2d')
    let drops = []
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const n = Math.round((canvas.width * canvas.height) / 9000)
      drops = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        v: 4 + Math.random() * 5,
        l: 6 + Math.random() * 10,
      }))
    }
    resize()
    window.addEventListener('resize', resize)
    let frame
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(160, 190, 255, 0.25)'
      for (const d of drops) {
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, d.l)
        d.y += d.v
        d.x -= d.v * 0.15
        if (d.y > canvas.height) {
          d.y = -d.l
          d.x = Math.random() * (canvas.width + 100)
        }
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="rain" aria-hidden="true" />
}

/** A short-lived sparkle trail behind the pointer (mouse users only). */
export function Sparkles() {
  useEffect(() => {
    if (reducedMotion() || !window.matchMedia('(pointer: fine)').matches) return
    const glyphs = ['✦', '✧', '⋆', '·']
    const colors = ['#f5b84a', '#2dd4bf', '#7cc4f8', '#ffffff']
    let last = 0
    const onMove = (e) => {
      const now = performance.now()
      if (now - last < 45) return
      last = now
      const s = document.createElement('span')
      s.className = 'sparkle'
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)]
      s.style.left = `${e.pageX}px`
      s.style.top = `${e.pageY}px`
      s.style.color = colors[Math.floor(Math.random() * colors.length)]
      document.body.appendChild(s)
      setTimeout(() => s.remove(), 800)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return null
}

/** Sydney local time, ticking. */
export function SydneyClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <time dateTime={now.toISOString()}>
      {now.toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </time>
  )
}
