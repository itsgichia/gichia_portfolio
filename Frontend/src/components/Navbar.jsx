import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { isAdmin } from '../api'

const LINKS = ['Work', 'Experience', 'Skills', 'Contact']

export default function Navbar({ profile, onNav }) {
  const ref = useRef()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('Work')

  useEffect(() => {
    const items = ref.current ? Array.from(ref.current.children) : []
    if (!items.length) return
    gsap.from(items, { y: -20, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 1.2 })
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(section) {
    setActive(section)
    const el = document.getElementById(section.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav ref={ref} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 2.5rem',
      background: scrolled ? 'rgba(5,5,8,0.92)' : 'transparent',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <button onClick={() => scrollTo('Work')} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.04em', color: 'var(--text)',
      }}>
        {profile?.name?.split(' ')[0] || 'Portfolio'}
        <span style={{ color: 'var(--accent)' }}>.</span>
      </button>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {LINKS.map(l => (
          <button key={l} onClick={() => scrollTo(l)} style={{
            background: active === l ? 'rgba(200,241,53,0.08)' : 'none',
            border: 'none', cursor: 'pointer',
            padding: '5px 14px', borderRadius: 20,
            fontSize: '0.8rem', fontWeight: 500,
            color: active === l ? 'var(--accent)' : 'var(--muted)',
            transition: 'all 0.15s', letterSpacing: '0.01em',
          }}>
            {l}
          </button>
        ))}
        {isAdmin() && (
          <button onClick={onNav} style={{
            marginLeft: '0.5rem', fontFamily: 'var(--mono)', fontSize: '0.7rem',
            color: 'var(--accent)', border: '1px solid rgba(200,241,53,0.3)',
            background: 'rgba(200,241,53,0.06)', borderRadius: 4,
            padding: '4px 12px', cursor: 'pointer',
          }}>
            admin
          </button>
        )}
      </div>
    </nav>
  )
}
