import { Link } from 'react-router-dom'
import { api } from '../api'
import HeroFigure from '../components/HeroFigure'
import { AnzhfrMock, RhipMock } from '../components/ProjectMocks'
import ThreeBackground from '../components/ThreeBackground'
import useApi from '../components/useApi'

const COLORS = ['#4fffb0', '#4fa8ff', '#ffd166', '#ff6b9d', '#a8ff78', '#c8f135']

function Hero({ profile, projects }) {
  const featured = projects.filter((p) => p.featured)
  return (
    <section className="hero">
      <ThreeBackground />
      <div className="wrap hero__content">
        <div>
          {profile?.availability && <p className="hero__status">{profile.availability}</p>}
          <h1 className="hero__name">{profile?.name || 'Gichia Muiruri'}</h1>
          <p className="hero__headline">{profile?.headline}</p>
          <p className="hero__bio">{profile?.bio}</p>
          <div className="hero__actions">
            <a className="btn" href="#work">
              View projects
            </a>
            <a className="btn btn--ghost" href="#contact">
              Contact
            </a>
          </div>
        </div>
        {featured.length > 0 && (
          <nav className="hero__index" aria-label="Featured projects">
            {featured.map((p) => (
              <a key={p.id} href={`#${p.slug}`}>
                <span>
                  <strong>{p.title}</strong>
                  <em>{p.category}</em>
                </span>
                {p.status === 'live' && <span className="badge">Live</span>}
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  )
}

function ProjectVisual({ p, color }) {
  if (p.image_url) return <img className="product__shot" src={p.image_url} alt={`Screenshot of ${p.title}`} loading="lazy" />
  if (p.slug === 'rsv-transmission-lab') return <HeroFigure />
  if (p.slug === 'rhip-connect') return <RhipMock />
  if (p.slug === 'anzhfr-cohort-builder') return <AnzhfrMock />
  return (
    <div className="product__blank" style={{ '--c': color }} aria-hidden="true">
      <span>{p.title}</span>
    </div>
  )
}

function ProductCard({ p, color, flip }) {
  const live = p.live_url
  return (
    <article id={p.slug} className={`product${flip ? ' product--flip' : ''}`}>
      <div className="product__text">
        <p className="product__kind">
          {p.category}
          {p.status === 'live' && <span className="badge">Live</span>}
        </p>
        <h3 className="product__title">{p.title}</h3>
        <p className="product__tagline">{p.tagline}</p>
        <p className="product__body">{p.approach}</p>
        <ul className="tags">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="product__actions">
          {live &&
            (live.startsWith('/') ? (
              <Link className="btn" to={live}>
                Open live app
              </Link>
            ) : (
              <a className="btn" href={live} target="_blank" rel="noreferrer">
                Open live app
              </a>
            ))}
          <Link className="btn btn--ghost" to={`/projects/${p.slug}`}>
            Read more
          </Link>
          {p.repo_url && (
            <a className="btn btn--ghost" href={p.repo_url} target="_blank" rel="noreferrer">
              Code
            </a>
          )}
        </div>
      </div>
      <div className="product__visual">
        <ProjectVisual p={p} color={color} />
      </div>
    </article>
  )
}

function Projects({ projects }) {
  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)
  return (
    <section className="section" id="work">
      <div className="wrap">
        <p className="eyebrow">Selected work</p>
        <h2 className="section__title">Projects</h2>
        <div className="products">
          {featured.map((p, i) => (
            <ProductCard key={p.id} p={p} color={COLORS[i % COLORS.length]} flip={i % 2 === 1} />
          ))}
        </div>
        {rest.length > 0 && (
          <>
            <h3 className="more__title">Research</h3>
            <div className="more">
            {rest.map((p) => (
              <Link key={p.id} to={`/projects/${p.slug}`} className="more__item">
                <span className="product__kind">{p.category}</span>
                <strong>{p.title}</strong>
                <span>{p.tagline}</span>
              </Link>
            ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function Contact({ profile }) {
  const links = [
    { label: 'Email', value: profile?.email, href: profile?.email && `mailto:${profile.email}` },
    { label: 'LinkedIn', value: 'gichia-muiruri', href: profile?.linkedin },
    { label: 'GitHub', value: 'itsgichia', href: profile?.github },
    { label: 'Location', value: profile?.location, href: null },
  ].filter((l) => l.value)
  return (
    <section className="section" id="contact">
      <div className="wrap contact">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h2 className="section__title">Contact</h2>
          <p className="section__intro">
            Open to full-time roles in health data science, biostatistics, research and software engineering. The
            quickest way to reach me is email.
          </p>
          {profile?.email && (
            <a className="btn" href={`mailto:${profile.email}`} style={{ marginTop: '1.75rem' }}>
              Send an email
            </a>
          )}
        </div>
        <ul className="contact__rows">
          {links.map((l) => (
            <li key={l.label}>
              <span className="contact__label">{l.label}</span>
              {l.href ? (
                <a href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer">
                  {l.value}
                </a>
              ) : (
                <span>{l.value}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  const profile = useApi(api.profile)
  const projects = useApi(api.projects)
  const p = profile.data

  return (
    <>
      <Hero profile={p} projects={projects.data || []} />
      {projects.error && (
        <div className="wrap">
          <p className="notice notice--error" style={{ marginTop: '2rem' }}>
            Couldn't load projects: {projects.error.message}
          </p>
        </div>
      )}
      <Projects projects={projects.data || []} />
      <Contact profile={p} />
    </>
  )
}
