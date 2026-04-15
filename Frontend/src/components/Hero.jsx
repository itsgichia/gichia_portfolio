import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ThreeBackground from './ThreeBackground'

const STATS = [
  { value: 'HD', label: 'WAM — UNSW'},
  { value: '97500+', label: 'Patients analysed' },
  { value: '4th', label: 'UNSW Datathon', suffix: '/20' },
  { value: '95%+', label: 'Query optimisation' },
]

export default function Hero({ profile }) {
  const contentRef = useRef()
  const statsRef = useRef()

  useEffect(() => {
    const reveals = contentRef.current?.querySelectorAll('.reveal')
    const stats = statsRef.current?.children

    if (reveals?.length) {
      gsap.from(Array.from(reveals), {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.12,
        ease: 'power3.out', delay: 0.3
      })
    }
    if (stats?.length) {
      gsap.from(Array.from(stats), {
        y: 20, opacity: 0, duration: 0.6, stagger: 0.08,
        ease: 'power2.out', delay: 0.7
      })
    }
  }, [])

  return (
    <section id="work" style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', overflow: 'hidden',
    }}>
      <ThreeBackground />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, rgba(5,5,8,0.25) 100%)',
        pointerEvents: 'none',
      }} />

      <div ref={contentRef} style={{ position: 'relative', zIndex: 2, padding: '0 2.5rem', maxWidth: 860 }}>

        <p className="reveal" style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
          color: '#c8f135', letterSpacing: '0.2em', textTransform: 'uppercase',
          marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: '#c8f135',
            display: 'inline-block', animation: 'pulse 2s infinite',
          }} />
          Available — Sydney, NSW
        </p>

        <h1 className="reveal" style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 800, lineHeight: 1.05,
          letterSpacing: '-0.04em', color: '#f0f2ff',
          marginBottom: '0.85rem',
        }}>
          {profile?.name || 'Gichia Muiruri'}
        </h1>

        <p className="reveal" style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#b0bacf', fontWeight: 500,
          marginBottom: '1rem', letterSpacing: '-0.01em',
        }}>
          {profile?.role || 'Health Data Scientist & Full-Stack Developer'}
        </p>

        <p className="reveal" style={{
          fontSize: '0.92rem', color: '#b0bacf',
          maxWidth: 500, lineHeight: 1.8, marginBottom: '2rem',
        }}>
          {profile?.bio || 'Data professional leveraging technology for healthcare innovation.'}
        </p>

        <div className="reveal" style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
          <a
            href={profile?.github || 'https://github.com/itsgichia'}
            target="_blank" rel="noopener noreferrer"
            style={{ background: '#c8f135', color: '#000', padding: '9px 22px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', display: 'inline-block', transition: 'opacity 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            GitHub ↗
          </a>
          <a
            href={profile?.linkedin || 'https://linkedin.com/in/gichia-muiruri'}
            target="_blank" rel="noopener noreferrer"
            style={{ background: 'none', border: '1px solid #2e3a60', color: '#f0f2ff', padding: '9px 22px', borderRadius: 6, fontWeight: 500, fontSize: '0.85rem', display: 'inline-block', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4fa8ff'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2e3a60'}
          >
            LinkedIn ↗
          </a>
          <a
            href={`mailto:${profile?.email || 'gichiamuiruri@gmail.com'}`}
            style={{ background: 'none', border: '1px solid #2e3a60', color: '#f0f2ff', padding: '9px 22px', borderRadius: 6, fontWeight: 500, fontSize: '0.85rem', display: 'inline-block', transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c8f135'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2e3a60'}
          >
            Contact
          </a>
        </div>
      </div>

      <div ref={statsRef} style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexWrap: 'wrap',
        borderTop: '1px solid #1e2540',
        marginTop: '4rem',
      }}>
        {STATS.map(({ value, label, suffix }, i) => (
          <div key={label} style={{
            flex: 1, minWidth: 150,
            padding: '1.25rem 2.5rem',
            borderRight: i < STATS.length - 1 ? '1px solid #1e2540' : 'none',
          }}>
            <p style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#c8f135', marginBottom: '0.2rem' }}>
              {value}<span style={{ fontSize: '0.65em', opacity: 0.6 }}>{suffix}</span>
            </p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#b0bacf', letterSpacing: '0.05em' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.4; transform:scale(0.8); }
        }
      `}</style>
    </section>
  )
}
