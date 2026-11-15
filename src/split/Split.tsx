import { useEffect, useState } from 'react'
import { MotionConfig, motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import {
  ABOUT,
  ABOUT_SHORT,
  CONTACT_EMAIL,
  EXPERIENCE,
  GITHUB_URL,
  LINKEDIN_URL,
  PHONE,
  PHONE_HREF,
  PROJECTS,
  ROLE,
} from '../data'
import './split.css'

const ease = [0.22, 1, 0.36, 1] as const


const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
]

function useActiveSection() {
  const [active, setActive] = useState('about')
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id))
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
  return active
}

function Icon({ name }: { name: 'github' | 'linkedin' | 'mail' | 'phone' }) {
  const paths = {
    github:
      'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
    linkedin:
      'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
    mail: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-8 5.3-8-5.3ZM5.2 7 12 11.5 18.8 7H5.2Z',
    phone:
      'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1l-2.2 2.2Z',
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="s-icon">
      <path d={paths[name]} fill="currentColor" />
    </svg>
  )
}

export default function Split() {
  const active = useActiveSection()
  const mx = useMotionValue(-1000)
  const my = useMotionValue(-1000)
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${mx}px ${my}px, rgba(47, 84, 235, 0.09), transparent 70%)`

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="s-root"
        onPointerMove={(e) => {
          mx.set(e.clientX)
          my.set(e.clientY)
        }}
      >
        <motion.div className="s-spot" style={{ background: spotlight }} aria-hidden />
        <div className="s-layout">
          <header className="s-left">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
              <h1 className="s-name">Raison Joseph</h1>
              <p className="s-role">{ROLE}</p>
              <p className="s-tagline">{ABOUT_SHORT}</p>
            </motion.div>

            <nav className="s-nav" aria-label="Sections">
              {SECTIONS.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={`#${s.id}`}
                  className={'s-nav-link' + (active === s.id ? ' active' : '')}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease }}
                >
                  <span className="s-nav-line" />
                  {s.label}
                </motion.a>
              ))}
            </nav>

            <motion.ul
              className="s-social"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <Icon name="github" />
                </a>
              </li>
              <li>
                <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <Icon name="linkedin" />
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Email ${CONTACT_EMAIL}`}>
                  <Icon name="mail" />
                </a>
              </li>
              <li>
                <a href={PHONE_HREF} aria-label={`Call ${PHONE}`}>
                  <Icon name="phone" />
                </a>
              </li>
            </motion.ul>
          </header>

          <main className="s-right">
            <section id="about" className="s-section" aria-label="About">
              <h2 className="s-mobile-h">About</h2>
              {ABOUT.map((p) => (
                <p key={p.slice(0, 24)} className="s-about-p">
                  {p}
                </p>
              ))}
            </section>

            <section id="experience" className="s-section" aria-label="Experience">
              <h2 className="s-mobile-h">Experience</h2>
              <ol className="s-cards">
                {EXPERIENCE.map((j) => (
                  <li key={j.id} className="s-card">
                    <p className="s-card-date">{j.end ? `${j.start} – ${j.end}` : j.start}</p>
                    <div>
                      <h3 className="s-card-title">
                        {j.role}, <span>{j.company}</span>
                      </h3>
                      {j.note && <p className="s-card-note">{j.note}</p>}
                      <ul className="s-card-points">
                        {j.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <ul className="s-tags">
                        {j.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
              <a className="s-resume" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                Full history on LinkedIn
              </a>
            </section>

            <section id="projects" className="s-section" aria-label="Projects">
              <h2 className="s-mobile-h">Side projects</h2>
              <ul className="s-cards">
                {PROJECTS.map((p) => (
                  <li key={p.id} className="s-card">
                    <p className="s-card-date">{p.domain}</p>
                    <div>
                      <h3 className="s-card-title">
                        <a href={p.url} target="_blank" rel="noreferrer" className="s-card-link">
                          {p.name}
                        </a>
                      </h3>
                      <p className="s-card-text">{p.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <footer className="s-footer">
              <p>
                Reach me at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or <a href={PHONE_HREF}>{PHONE}</a>.
              </p>
              <p>Built with React and Framer Motion.</p>
            </footer>
          </main>
        </div>
      </div>
    </MotionConfig>
  )
}
