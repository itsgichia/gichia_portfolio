// Small decorative building blocks for the retro "lab" look.
import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { useSettings } from './settings'

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
const VIRION_COLORS = { o: '#3a1d6e', b: '#ff77a8', h: '#ffd0e4', s: '#ffd36e', e: '#1a1033', w: '#ffffff', p: '#ff4f8b', m: '#1a1033' }

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

export function Marquee({ children }) {
  return (
    <div className="marquee" role="marquee" aria-label="News ticker">
      <div className="marquee__track">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </div>
    </div>
  )
}

/** Classic 88x31 web buttons, drawn in CSS rather than borrowed GIFs. */
const BUTTONS = [
  { a: 'PYTHON', b: 'powered', bg: '#3572a5', fg: '#ffd43b' },
  { a: 'R', b: 'stats inside', bg: '#1f65b7', fg: '#ffffff' },
  { a: 'FastAPI', b: 'served', bg: '#05998b', fg: '#ffffff' },
  { a: 'REACT', b: 'v19', bg: '#20232a', fg: '#61dafb' },
  { a: 'SQL', b: 'is a vibe', bg: '#e48e00', fg: '#1a1033' },
  { a: 'SEIRS', b: 'model ok', bg: '#ff77a8', fg: '#1a1033' },
  { a: 'UNSW', b: 'HDS 2026', bg: '#ffd36e', fg: '#1a1033' },
  { a: 'NO', b: 'cookies', bg: '#1a1033', fg: '#a6ff8f' },
  { a: 'ANY', b: 'browser', bg: '#c3a6ff', fg: '#1a1033' },
  { a: 'HAND', b: 'made', bg: '#7fdbff', fg: '#1a1033' },
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

export function HitCounter() {
  const [count, setCount] = useState(null)
  useEffect(() => {
    api.visit().then((r) => setCount(r.count)).catch(() => setCount(null))
  }, [])
  if (count == null) return null
  return (
    <p className="hits">
      you are visitor{' '}
      <span className="hits__digits" aria-label={String(count)}>
        {String(count).padStart(6, '0').split('').map((d, i) => (
          <b key={i} aria-hidden="true">{d}</b>
        ))}
      </span>
    </p>
  )
}

/** Canvas rain across the whole window, drawn behind content. */
export function Rain() {
  const [{ rain }] = useSettings()
  const ref = useRef()
  useEffect(() => {
    if (!rain) return
    const canvas = ref.current
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
      ctx.fillStyle = 'rgba(160, 190, 255, 0.35)'
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
  }, [rain])
  return rain ? <canvas ref={ref} className="rain" aria-hidden="true" /> : null
}

/** A short-lived sparkle trail behind the pointer. */
export function Sparkles() {
  const [{ sparkles }] = useSettings()
  useEffect(() => {
    if (!sparkles || !window.matchMedia('(pointer: fine)').matches) return
    const glyphs = ['✦', '✧', '⋆', '·']
    const colors = ['#ffd36e', '#ff77a8', '#7fdbff', '#ffffff']
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
  }, [sparkles])
  return null
}

export function Toggles() {
  const [settings, toggle] = useSettings()
  const rows = [
    ['rain', 'Rain'],
    ['sparkles', 'Cursor sparkles'],
    ['hideMyCursor', 'Hide my cursor from others'],
    ['hideOthers', "Hide others' cursors"],
  ]
  return (
    <ul className="toggles">
      {rows.map(([k, label]) => (
        <li key={k}>
          <label>
            <input type="checkbox" checked={settings[k]} onChange={() => toggle(k)} />
            <span>{label}</span>
          </label>
        </li>
      ))}
    </ul>
  )
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
