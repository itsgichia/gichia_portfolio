import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const STATUS_COLORS = {
  completed: { bg: 'rgba(79,255,176,0.1)', color: '#4fffb0', border: 'rgba(79,255,176,0.2)', label: 'Completed' },
  'in-progress': { bg: 'rgba(79,168,255,0.1)', color: '#4fa8ff', border: 'rgba(79,168,255,0.2)', label: 'In Progress' },
  planned: { bg: 'rgba(90,99,128,0.2)', color: '#8891aa', border: 'rgba(90,99,128,0.3)', label: 'Planned' },
}

const FILTERS = ['All', 'Completed', 'In Progress', 'Planned']

export default function Projects({ projects }) {
  const sectionRef = useRef()
  const gridRef = useRef()
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)

  const filtered = projects.filter(p => {
    if (filter === 'All') return true
    const map = { 'Completed': 'completed', 'In Progress': 'in-progress', 'Planned': 'planned' }
    return p.status === map[filter]
  })

  useEffect(() => {
    const cards = Array.from(gridRef.current?.querySelectorAll('.proj-card') || [])
    if (!cards.length) return
    gsap.from(cards, {
      y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: gridRef.current, start: 'top 80%', once: true }
    })
  }, [filter])

  return (
    <section id="work" ref={sectionRef} style={{ padding: '6rem 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <p style={eyebrow}>Selected Work</p>
        <h2 style={sectionH2}>Projects</h2>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: 'var(--mono)', fontSize: '0.72rem',
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
            background: filter === f ? 'var(--accent)' : 'var(--bg2)',
            color: filter === f ? '#000' : 'var(--muted)',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
            fontWeight: filter === f ? 600 : 400,
            transition: 'all 0.15s',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Project grid */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {filtered.map((p) => {
          const st = STATUS_COLORS[p.status] || STATUS_COLORS.completed
          const isOpen = expanded === p.id
          return (
            <div key={p.id} className="proj-card" onClick={() => setExpanded(isOpen ? null : p.id)} style={{
              background: 'var(--bg)',
              padding: '1.75rem',
              cursor: 'pointer',
              transition: 'background 0.15s',
              display: 'flex', flexDirection: 'column', gap: '0.85rem',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
              onMouseLeave={e => e.currentTarget.style.background = isOpen ? 'var(--bg2)' : 'var(--bg)'}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: `${p.image_color}18`,
                  border: `1px solid ${p.image_color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: p.image_color, fontWeight: 600 }}>
                    {p.title.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', padding: '2px 8px', borderRadius: 3, background: st.bg, color: st.color, border: `1px solid ${st.border}`, whiteSpace: 'nowrap' }}>
                  {st.label}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  {p.tagline}
                </p>
              </div>

              {/* Expanded description */}
              {isOpen && (
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.75, borderTop: '1px solid var(--border)', paddingTop: '1rem', animation: 'fadeIn 0.2s ease' }}>
                  {p.description}
                </p>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {p.tags.map(t => (
                  <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', padding: '2px 8px', borderRadius: 3, background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Links */}
              {isOpen && (p.link || p.github) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 5 }}>Live ↗</a>}
                  {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>GitHub ↗</a>}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--dim)' }}>
                  {isOpen ? 'Click to collapse' : 'Click to expand'}
                </span>
                <span style={{ color: 'var(--dim)', fontSize: '0.7rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
    </section>
  )
}

const eyebrow = { fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }
const sectionH2 = { fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.04em' }
