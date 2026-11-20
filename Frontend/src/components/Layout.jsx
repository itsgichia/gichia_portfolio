import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap">
        <Link to="/" className="nav__name">
          Gichia<span>.</span>
        </Link>
        <nav aria-label="Main">
          <ul className="nav__links">
            <li>
              <a href="/#work">Projects</a>
            </li>
            <li>
              <NavLink to="/lab/rsv">RSV Lab</NavLink>
            </li>
            <li>
              <a href="/#contact">Contact</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <p>© 2026 Gichia Muiruri</p>
        <p>React, FastAPI, Three.js</p>
        <p>
          <Link to="/admin">Admin</Link>
        </p>
      </div>
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
      <Nav />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
