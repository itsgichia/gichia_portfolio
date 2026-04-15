import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export default function Contact({ profile }) {
  const ref = useRef()

  useEffect(() => {
    const els = Array.from(ref.current?.querySelectorAll('.contact-item') || [])
    if (!els.length) return
    gsap.from(els, {
      y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true }
    })
  }, [])

  const links = [
    { label: 'Email', value: profile?.email, href: `mailto:${profile?.email}` },
    { label: 'LinkedIn', value: 'gichia-muiruri', href: profile?.linkedin },
    { label: 'GitHub', value: 'itsgichia', href: profile?.github },
    { label: 'Location', value: profile?.location, href: null },
  ].filter(l => l.value)

  return (
    <section id="contact" ref={ref} style={{
      padding: '6rem 2.5rem 4rem',
      borderTop: '1px solid var(--border)',
      maxWidth: 1200, margin: '0 auto',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        <div>
          <p style={eyebrow}>Get in touch</p>
          <h2 style={{ ...sectionH2, marginBottom: '1rem' }}>Contact</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: 380 }}>
            Open to full-time roles, internships, and part-time positions in health data science, software engineering, and research.
          </p>
          <a href={`mailto:${profile?.email}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            marginTop: '1.75rem', background: 'var(--accent)', color: '#000',
            padding: '10px 24px', borderRadius: 6, fontWeight: 700,
            fontSize: '0.85rem', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Send a message →
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {links.map(({ label, value, href }) => (
            <div key={label} className="contact-item" style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              padding: '0.9rem 1.25rem', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg1)',
              transition: 'border-color 0.15s, background 0.15s',
              cursor: href ? 'pointer' : 'default',
            }}
              onClick={() => href && window.open(href, '_blank')}
              onMouseEnter={e => { if(href){ e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg2)' }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg1)' }}
            >
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--muted)', minWidth: 64 }}>{label}</span>
              <span style={{ fontSize: '0.85rem', color: href ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
              {href && <span style={{ marginLeft: 'auto', color: 'var(--dim)', fontSize: '0.75rem' }}>↗</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--dim)' }}>
          © 2026 {profile?.name || 'Gichia Muiruri'}
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--dim)' }}>
          React · FastAPI · Three.js · GSAP
        </p>
        <a href="/login" style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--dim)', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
        >
          admin ↗
        </a>
      </div>
    </section>
  )
}

const eyebrow = { fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }
const sectionH2 = { fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.04em' }
