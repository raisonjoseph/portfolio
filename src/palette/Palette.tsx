import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { ABOUT, ACHIEVEMENTS, CONTACT_EMAIL, EXPERIENCE, GITHUB_URL, LINKEDIN_URL, PHONE, PHONE_HREF, PROJECTS, ROLE, SKILLS } from '../data'
import './palette.css'

const ease = [0.22, 1, 0.36, 1] as const

type Item = {
  id: string
  group: 'About' | 'Experience' | 'Side projects' | 'Links'
  title: string
  sub: string
  detail: string[]
  href?: string
  search: string
}

const ITEMS: Item[] = [
  {
    id: 'about',
    group: 'About',
    title: 'About me',
    sub: 'Who I am and what I work on',
    detail: ABOUT,
    search: ('about me bio who ' + ABOUT.join(' ')).toLowerCase(),
  },
  ...EXPERIENCE.map((j) => ({
    id: j.id,
    group: 'Experience' as const,
    title: j.company,
    sub: `${j.role}${j.end ? `, ${j.start} – ${j.end}` : ''}`,
    detail: j.points,
    search: [j.company, j.role, j.note, j.place, ...j.points].join(' ').toLowerCase(),
  })),
  ...PROJECTS.map((p) => ({
    id: p.id,
    group: 'Side projects' as const,
    title: p.name,
    sub: p.domain ?? '',
    detail: [p.detail],
    href: p.url,
    search: [p.name, p.line, p.detail, p.domain].join(' ').toLowerCase(),
  })),
  { id: 'email', group: 'Links', title: 'Email', sub: CONTACT_EMAIL, detail: ['The quickest way to reach me.'], href: `mailto:${CONTACT_EMAIL}`, search: 'email contact mail hire' },
  { id: 'phone', group: 'Links', title: 'Phone', sub: PHONE, detail: ['Call or message me.'], href: PHONE_HREF, search: 'phone call number mobile whatsapp contact' },
  { id: 'linkedin', group: 'Links', title: 'LinkedIn', sub: 'raison-joseph', detail: ['My profile and full work history.'], href: LINKEDIN_URL, search: 'linkedin profile cv resume' },
  { id: 'github', group: 'Links', title: 'GitHub', sub: 'raisonjoseph', detail: ['Code and side projects.'], href: GITHUB_URL, search: 'github code repos' },
]

const SUGGESTIONS = ['billing', 'video player', 'Next.js', 'Shopify', 'editor', 'typing']

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

function Palette({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [q, setQ] = useState(initial)
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const query = q.trim().toLowerCase()
  const results = useMemo(() => (query ? ITEMS.filter((i) => i.search.includes(query)) : ITEMS), [query])
  const current = results[Math.min(sel, results.length - 1)]

  useEffect(() => inputRef.current?.focus(), [])
  useEffect(() => setSel(0), [query])

  const open = (item?: Item) => {
    if (item?.href) window.open(item.href, /^(mailto|tel):/.test(item.href) ? '_self' : '_blank', 'noreferrer')
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(results.length - 1, s + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter') open(current)
  }

  let lastGroup = ''
  return (
    <motion.div className="k-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div
        className="k-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search my work"
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -6 }}
        transition={{ duration: 0.22, ease }}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="k-input-row">
          <svg viewBox="0 0 24 24" aria-hidden className="k-search-icon">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="k-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search companies, skills, projects…"
            aria-label="Search"
            aria-controls="k-results"
          />
          <kbd className="k-esc">esc</kbd>
        </div>
        <div className="k-body">
          <ul className="k-results" id="k-results" role="listbox">
            {results.length === 0 && <li className="k-empty">Nothing matches “{q}”. Try React, billing or Poptin.</li>}
            {results.map((item, i) => {
              const header = item.group !== lastGroup
              lastGroup = item.group
              return (
                <Fragment key={item.id}>
                  {header && <li className="k-group">{item.group}</li>}
                  <li
                    role="option"
                    aria-selected={i === sel}
                    className={'k-item' + (i === sel ? ' sel' : '')}
                    onMouseMove={() => setSel(i)}
                    onClick={() => open(item)}
                  >
                    {i === sel && <motion.span layoutId="k-sel" className="k-sel" transition={{ duration: 0.15 }} />}
                    <span className="k-item-title">
                      <Highlight text={item.title} q={query} />
                    </span>
                    <span className="k-item-sub">{item.sub}</span>
                  </li>
                </Fragment>
              )
            })}
          </ul>
          <div className="k-preview" aria-live="polite">
            {current && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="k-prev-group">{current.group}</p>
                  <h3 className="k-prev-title">{current.title}</h3>
                  <p className="k-prev-sub">{current.sub}</p>
                  <ul className="k-prev-points">
                    {current.detail.map((d) => (
                      <li key={d}>
                        <Highlight text={d} q={query} />
                      </li>
                    ))}
                  </ul>
                  {current.href && <p className="k-prev-hint">Press Enter to open</p>}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function useTypedHint() {
  const [text, setText] = useState('')
  useEffect(() => {
    let word = 0
    let len = 0
    let deleting = false
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      const w = SUGGESTIONS[word]
      if (!deleting) {
        len++
        setText(w.slice(0, len))
        if (len === w.length) {
          deleting = true
          t = setTimeout(tick, 1400)
          return
        }
      } else {
        len--
        setText(w.slice(0, len))
        if (len === 0) {
          deleting = false
          word = (word + 1) % SUGGESTIONS.length
        }
      }
      t = setTimeout(tick, deleting ? 40 : 90)
    }
    t = setTimeout(tick, 900)
    return () => clearTimeout(t)
  }, [])
  return text
}

export default function PalettePage() {
  const [open, setOpen] = useState<string | null>(null)
  const hint = useTypedHint()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => (o === null ? '' : null))
      } else if (e.key === '/' && open === null && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        setOpen('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <MotionConfig reducedMotion="user">
      <div className="k-page">
        <header className="k-nav">
          <span className="k-mark" aria-hidden>
            RJ
          </span>
          <nav className="k-nav-links" aria-label="Links">
            <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>Email</a>
            <a href={PHONE_HREF}>{PHONE}</a>
          </nav>
        </header>

        <main>
          <section className="k-hero">
            <motion.h1
              className="k-name"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              Raison Joseph
            </motion.h1>
            <motion.p
              className="k-role"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              {ROLE} with seven years across React, Vue and TypeScript. Currently at Poptin.
            </motion.p>

            <motion.button
              className="k-trigger"
              onClick={() => setOpen('')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease }}
              whileHover={{ y: -2 }}
            >
              <svg viewBox="0 0 24 24" aria-hidden className="k-search-icon">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="k-trigger-text">
                Search my work for <span className="k-typed">{hint}</span>
                <span className="k-caret" aria-hidden />
              </span>
              <kbd className="k-kbd">⌘K</kbd>
            </motion.button>

            <motion.div
              className="k-chips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {['about', 'Poptin', 'billing', 'video', 'side projects'].map((c) => (
                <button key={c} className="k-chip" onClick={() => setOpen(c === 'side projects' ? 'practice' : c)}>
                  {c}
                </button>
              ))}
            </motion.div>
          </section>

          <section className="k-resume" aria-label="Résumé">
            <h2 className="k-h2">Or read it the usual way</h2>
            <div className="k-about">
              {ABOUT.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            <div className="k-cols">
              <div>
                <h3 className="k-h3">Experience</h3>
                <ul className="k-lines">
                  {EXPERIENCE.map((j) => (
                    <li key={j.id}>
                      <span className="k-line-main">
                        {j.company}
                        <span className="k-line-role">{j.role}</span>
                      </span>
                      <span className="k-line-date">{j.end ? `${j.start} – ${j.end}` : j.start}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="k-h3">Side projects</h3>
                <ul className="k-lines">
                  {PROJECTS.map((p) => (
                    <li key={p.id}>
                      <a className="k-line-main" href={p.url} target="_blank" rel="noreferrer">
                        {p.name}
                        <span className="k-line-role">{p.line}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <h3 className="k-h3 spaced">Skills</h3>
                <p className="k-muted">{SKILLS.join(', ')}</p>
                <h3 className="k-h3 spaced">Recognition</h3>
                <ul className="k-ach">
                  {ACHIEVEMENTS.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </main>

        <footer className="k-footer">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href={PHONE_HREF}>{PHONE}</a>
          <span>© {new Date().getFullYear()} Raison Joseph</span>
        </footer>

        <AnimatePresence>{open !== null && <Palette initial={open} onClose={() => setOpen(null)} />}</AnimatePresence>
      </div>
    </MotionConfig>
  )
}
