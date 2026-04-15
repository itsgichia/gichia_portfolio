import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const EXPERIENCE = [
  {
    role: 'Health Data Scientist',
    type: 'WIL Placement',
    org: 'Hunter Medical Research Institute',
    location: 'Newcastle, NSW',
    period: 'Jan 2026 — Present',
    color: '#4fffb0',
    bullets: [
      'Developing and validating predictive models for infant respiratory outcomes using linked administrative datasets (GP, ED, PBS, RBDM)',
      'Systematic data extraction, feature engineering, and validation across multiple clinical sources',
      'Collaborating with clinician researchers to translate findings into clinical decision support',
    ]
  },
  {
    role: 'Software Engineer',
    type: 'Contract',
    org: 'CloudFactory',
    location: 'Remote (Kenya)',
    period: '2023 — 2024',
    color: '#4fa8ff',
    bullets: [
      'Developed and maintained database systems using PostgreSQL and AWS, optimising query performance by 70%',
      'Built automated reporting solutions and data processing pipelines across 3 time zones',
    ]
  },
  {
    role: 'Research Assistant',
    type: 'Research',
    org: 'International Medical University',
    location: 'Kuala Lumpur, Malaysia',
    period: '2021 — 2022',
    color: '#ffd166',
    bullets: [
      'Quantitative data analysis and technical reports following Good Laboratory Practice (GLP) standards',
      'Maintained comprehensive research documentation with strong data integrity',
    ]
  },
  {
    role: 'R&D Intern',
    type: 'Internship',
    org: 'Research Centre for Crystalline Material',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Apr — Oct 2021',
    color: '#ff6b9d',
    bullets: [
      'Systematic data collection and qualitative/quantitative analysis with rigorous quality control',
    ]
  },
]

const EDUCATION = [
  {
    degree: 'Master of Science — Health Data Science',
    school: 'University of New South Wales',
    period: '2025 — Present',
    color: '#4fffb0',
  },
  {
    degree: 'BS Pharmaceutical Chemistry',
    school: 'International Medical University',
    period: '2019 — 2022',
    color: '#4fa8ff',
  },
]

export default function Experience() {
  const ref = useRef()

  useEffect(() => {
    const els = Array.from(ref.current?.querySelectorAll('.exp-item') || [])
    if (!els.length) return
    gsap.from(els, {
      x: -30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true }
    })
  }, [])

  return (
    <section id="experience" ref={ref} style={{ padding: '6rem 2.5rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '5rem', alignItems: 'start' }}>

        {/* Experience */}
        <div>
          <p style={eyebrow}>Career</p>
          <h2 style={sectionH2}>Experience</h2>
          <div style={{ marginTop: '2.5rem', position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: 0, top: 8, bottom: 0, width: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {EXPERIENCE.map((e, i) => (
                <div key={i} className="exp-item" style={{ paddingLeft: '2rem', paddingBottom: '2.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -4, top: 6, width: 8, height: 8, borderRadius: '50%', background: e.color, border: '1px solid var(--bg)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
                        {e.role}
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: e.color, background: `${e.color}15`, border: `1px solid ${e.color}25`, padding: '1px 7px', borderRadius: 3, marginLeft: '0.6rem' }}>
                          {e.type}
                        </span>
                      </h3>
                      <p style={{ fontSize: '0.82rem', color: e.color, fontWeight: 500 }}>{e.org}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{e.location}</p>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--muted)', whiteSpace: 'nowrap', paddingTop: 2 }}>{e.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {e.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, paddingLeft: '1rem', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--dim)' }}>—</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education */}
        <div>
          <p style={eyebrow}>Academic</p>
          <h2 style={sectionH2}>Education</h2>
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {EDUCATION.map((e, i) => (
              <div key={i} className="exp-item" style={{
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '1.25rem 1.5rem',
                background: 'var(--bg1)',
                borderLeft: `3px solid ${e.color}`,
                borderRadius: '0 10px 10px 0',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--muted)', display: 'block', marginBottom: '0.5rem' }}>{e.period}</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>{e.degree}</h3>
                <p style={{ fontSize: '0.8rem', color: e.color, marginBottom: '0.25rem' }}>{e.school}</p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>{e.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const eyebrow = { fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }
const sectionH2 = { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em' }
