import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Cursors, LiveProvider, useLive } from './live'
import { HitCounter, Rain, Sparkles, Virion } from './Retro'
import { SettingsProvider } from './settings'

export function Banner() {
  const { online, status } = useLive()
  return (
    <header className="banner">
      <Link to="/" className="banner__home" aria-label="Gichia Muiruri, home">
        <Virion size={56} className="bob" />
        <span className="banner__title">Gichia Muiruri</span>
      </Link>
      <p className="banner__sub">Health data science · epidemic modelling · software</p>
      <p className="banner__online" aria-live="polite">
        <i className={`dot dot--${status}`} aria-hidden="true" />
        {status === 'open' ? `${online} ${online === 1 ? 'visitor' : 'visitors'} online` : 'connecting…'}
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
            Home
          </NavLink>
        </li>
        <li>
          <a href="/#work">Projects</a>
        </li>
        <li>
          <NavLink to="/lab/rsv">RSV Lab</NavLink>
        </li>
        <li>
          <a href="/#cv">Résumé</a>
        </li>
        <li>
          <a href="/#guestbook">Guestbook</a>
        </li>
        <li>
          <a href="/#contact">Contact</a>
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
        © 2026 Gichia Muiruri · built with React and FastAPI · <Link to="/admin">Admin</Link>
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
