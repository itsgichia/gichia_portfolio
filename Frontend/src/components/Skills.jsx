import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const SKILLS = [
  {
    category: 'Languages',
    color: '#4fffb0',
    items: ['Python', 'R', 'SAS', 'SQL', 'JavaScript'],
  },
  {
    category: 'Data & ML',
    color: '#4fa8ff',
    items: ['Pandas', 'NumPy', 'SciPy', 'scikit-learn', 'tidyverse', 'ggplot2', 'Plotly', 'Matplotlib'],
  },
  {
    category: 'Databases & Cloud',
    color: '#ffd166',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'AWS', 'ETL'],
  },
  {
    category: 'Web & Tools',
    color: '#ff6b9d',
    items: ['React', 'FastAPI', 'Flask', 'Vite', 'GSAP', 'Three.js', 'Git'],
  },
  {
    category: 'Clinical & Research',
    color: '#a8ff78',
    items: ['Clinical Data Management', 'Bioinformatics','Biostatistics', 'Predictive Modelling', 'Data Validation', 'GLP', 'ICH Guidelines', 'Epidemiology'],
  },
]

export default function Skills() {
  const ref = useRef()

  useEffect(() => {
    const els = Array.from(ref.current?.querySelectorAll('.skill-group') || [])
    if (!els.length) return
    gsap.from(els, {
      y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true }
    })
  }, [])

  return (
    <section id="skills" ref={ref} style={{ padding: '6rem 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <p style={eyebrow}>Toolkit</p>
        <h2 style={sectionH2}>Skills</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SKILLS.map(({ category, color, items }) => (
          <div key={category} className="skill-group" style={{
            display: 'grid', gridTemplateColumns: '160px 1fr',
            gap: '1.5rem', alignItems: 'center',
            padding: '1.5rem', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg1)',
          }}>
            <div>
              <div style={{ width: 4, height: 20, background: color, borderRadius: 2, marginBottom: '0.6rem' }} />
              <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: color, letterSpacing: '0.06em', fontWeight: 500 }}>
                {category}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {items.map(item => (
                <span key={item} style={{
                  fontSize: '0.8rem', fontWeight: 500,
                  padding: '5px 14px', borderRadius: 20,
                  background: `${color}10`,
                  border: `1px solid ${color}25`,
                  color: 'var(--text)',
                  transition: 'background 0.15s, border-color 0.15s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}50` }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}25` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const eyebrow = { fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }
const sectionH2 = { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em' }
