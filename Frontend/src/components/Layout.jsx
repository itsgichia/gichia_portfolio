import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Cursors, LiveProvider, useLive } from './live'
import { HitCounter, Marquee, Rain, Sparkles, Virion } from './Retro'
import { SettingsProvider } from './settings'

export function Banner() {
  const { online, status } = useLive()
  return (
    <header className="banner">
      <Link to="/" className="banner__home" aria-label="gichia's lab, home">
        <Virion size={72} className="bob" />
        <span className="banner__title">
          gichia<span className="banner__apos">'</span>s lab
        </span>
      </Link>
      <p className="banner__sub">health data science ☾ epidemic models ☾ things for the web</p>
      <p className="banner__online" aria-live="polite">
        <i className={`dot dot--${status}`} aria-hidden="true" />
        {status === 'open' ? `${online} ${online === 1 ? 'visitor' : 'visitors'} here now` : 'the lab is waking up…'}
      </p>
    </header>
  )
}

export function Nav() {
  return (
    <nav className="topnav" aria-label="Main">
      <ul>
        <li>
          <NavLink to="/" end>
            ✩ lobby
          </NavLink>
        </li>
        <li>
          <a href="/#work">✩ projects</a>
        </li>
        <li>
          <NavLink to="/lab/rsv">✩ rsv lab</NavLink>
        </li>
        <li>
          <a href="/#cv">✩ résumé</a>
        </li>
        <li>
          <a href="/#guestbook">✩ guestbook</a>
        </li>
        <li>
          <a href="/#contact">✩ contact</a>
        </li>
      </ul>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <HitCounter />
      <p>
        © 2026 Gichia Muiruri ☾ hand-built with React + FastAPI ☾ best viewed at any resolution ☾{' '}
        <Link to="/admin">staff only</Link>
      </p>
    </footer>
  )
}

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function Layout() {
  return (
    <SettingsProvider>
      <LiveProvider>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <ScrollManager />
        <Rain />
        <Sparkles />
        <div className="hotel">
          <Banner />
          <Nav />
          <Marquee>
            ✩ welcome to the lab, please wipe your feet ✩ now modelling: RSV in Australian infants ✩ open to full-time
            roles in health data science ✩ say hi in the chat box, or sign the guestbook before you go ✩
          </Marquee>
          <main id="main">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Cursors />
      </LiveProvider>
    </SettingsProvider>
  )
}
