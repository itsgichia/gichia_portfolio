import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import PixelName from './PixelName'
import { Rain, Sparkles, Virion } from './Retro'

export function Banner() {
  return (
    <header className="banner">
      <Link to="/" className="banner__home" aria-label="Gichia Muiruri, home">
        <Virion size={56} className="bob" />
        <PixelName text="Gichia Muiruri" />
        <span className="sr-only">Gichia Muiruri</span>
      </Link>
      <p className="banner__sub">Health data science · biostatistics · software</p>
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
          <NavLink to="/projects">Projects</NavLink>
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
    <>
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
    </>
  )
}
