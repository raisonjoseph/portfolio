import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CASE_STUDIES, type CaseStudy } from '../data'

const ease = [0.22, 1, 0.36, 1] as const

/* Line illustrations in the exercise-book style. On the card they are static; when a case study
   opens (`play`), each one draws itself in a sequence that matches the story. */
function Art({ id, play = false }: { id: string; play?: boolean }) {
  const ink = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const red = { ...ink, stroke: 'var(--margin)' }
  const soft = { ...ink, stroke: 'var(--rule)' }
  const T0 = 0.35 // wait for the card to finish opening

  // Strokes draw on; shapes pop; groups rise. All no-ops when not playing.
  const draw = (d: number, dur = 0.6) =>
    play
      ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { delay: T0 + d, duration: dur, ease } }
      : {}
  const pop = (d: number) =>
    play
      ? {
          initial: { opacity: 0, scale: 0.85 },
          animate: { opacity: 1, scale: 1 },
          transition: { delay: T0 + d, duration: 0.45, ease },
          style: { transformBox: 'fill-box' as const, transformOrigin: 'center' },
        }
      : {}
  const rise = (d: number, y = 18) =>
    play
      ? { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { delay: T0 + d, duration: 0.55, ease } }
      : {}
  const fade = (d: number) =>
    play ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: T0 + d, duration: 0.4 } } : {}
  const grow = (d: number, dur = 0.6) =>
    play
      ? {
          initial: { scaleX: 0 },
          animate: { scaleX: 1 },
          transition: { delay: T0 + d, duration: dur, ease },
          style: { transformBox: 'fill-box' as const, transformOrigin: 'left center' },
        }
      : {}

  if (id === 'billing')
    return (
      <svg viewBox="0 0 320 180" className="cs-art" aria-hidden>
        {/* Basic plan */}
        <motion.rect x="34" y="34" width="110" height="118" rx="10" {...ink} {...draw(0)} />
        <motion.path d="M52 58h50M52 74h74M52 116h74M52 128h56" {...soft} {...draw(0.25, 0.5)} />
        <motion.rect x="52" y="88" width="40" height="12" rx="3" {...ink} {...pop(0.4)} />
        {/* Growth plan lifts forward */}
        <motion.g {...rise(0.45, 14)}>
          <motion.rect x="170" y="22" width="116" height="136" rx="10" {...red} strokeWidth={2.5} {...draw(0.45)} />
          <motion.text x="188" y="52" className="cs-art-text red" {...fade(0.8)}>
            Growth
          </motion.text>
          <motion.path d="M188 66h64M188 110h78M188 122h60" {...soft} {...draw(0.85, 0.5)} />
          <motion.rect x="188" y="80" width="46" height="14" rx="3" {...red} {...pop(0.95)} />
          {/* Checkout button fills in */}
          <motion.rect x="188" y="134" width="80" height="14" rx="7" fill="var(--ink)" {...grow(1.1, 0.5)} />
        </motion.g>
      </svg>
    )

  if (id === 'canvas')
    return (
      <svg viewBox="0 0 320 180" className="cs-art" aria-hidden>
        {/* Trigger node */}
        <motion.g {...pop(0)}>
          <rect x="24" y="34" width="84" height="40" rx="8" {...ink} />
          <path d="M38 50h40M38 60h28" {...soft} />
        </motion.g>
        {/* Connection to the email step */}
        <motion.path d="M108 54 C150 54 150 130 192 130" {...ink} {...draw(0.3, 0.6)} />
        <motion.g {...pop(0.75)}>
          <rect x="192" y="110" width="96" height="40" rx="8" {...ink} />
          <path d="M206 124h20M206 134h56" {...soft} />
          <rect x="200" y="117" width="18" height="12" rx="2" {...ink} strokeWidth={1.5} />
        </motion.g>
        {/* Live branch with flowing dashes */}
        <motion.path
          d="M108 54 C150 54 150 40 192 40"
          {...red}
          strokeDasharray="5 6"
          {...(play
            ? {
                initial: { opacity: 0, strokeDashoffset: 0 },
                animate: { opacity: 1, strokeDashoffset: -44 },
                transition: {
                  opacity: { delay: T0 + 0.95, duration: 0.3 },
                  strokeDashoffset: { delay: T0 + 0.95, duration: 2, repeat: Infinity, ease: 'linear' },
                },
              }
            : {})}
        />
        <motion.g {...pop(1.1)}>
          <rect x="192" y="20" width="96" height="40" rx="8" {...red} />
          <path d="M206 36h50M206 46h34" {...soft} />
        </motion.g>
        <motion.circle cx="108" cy="54" r="4" {...ink} fill="var(--paper)" {...pop(0.25)} />
      </svg>
    )

  if (id === 'storepecker')
    return (
      <svg viewBox="0 0 320 180" className="cs-art" aria-hidden>
        {/* One codebase first, then storefronts grow out of it */}
        <motion.path d="M70 160h180" {...ink} {...draw(0, 0.5)} />
        <motion.text x="160" y="176" textAnchor="middle" className="cs-art-text" {...fade(0.3)}>
          one codebase
        </motion.text>
        {[0, 1, 2].map((i) => (
          <motion.g key={i} {...rise(0.5 + i * 0.18, 30)}>
            <g transform={`translate(${30 + i * 92} ${30 + (i % 2) * 14})`}>
              <rect width="80" height="108" rx="8" {...(i === 1 ? red : ink)} />
              <path d="M0 18h80" {...soft} />
              <motion.rect
                x="10"
                y="28"
                width="60"
                height="30"
                rx="4"
                fill={i === 0 ? 'var(--ink)' : i === 1 ? 'var(--margin)' : 'var(--rule)'}
                opacity={i === 2 ? 1 : 0.85}
                {...grow(0.8 + i * 0.18, 0.45)}
              />
              <path d="M10 70h40M10 80h56M10 92h30" {...soft} />
            </g>
          </motion.g>
        ))}
      </svg>
    )

  return (
    <svg viewBox="0 0 320 180" className="cs-art" aria-hidden>
      <motion.rect x="30" y="20" width="260" height="140" rx="12" {...ink} {...draw(0, 0.7)} />
      <motion.text x="50" y="44" className="cs-art-text" {...fade(0.4)}>
        HLS
      </motion.text>
      <motion.text x="86" y="44" className="cs-art-text red" {...fade(0.5)}>
        DASH
      </motion.text>
      <motion.path d="M150 70v40l34-20z" fill="var(--ink)" {...pop(0.5)} />
      <motion.path d="M50 138h220" {...soft} strokeWidth={4} {...draw(0.6, 0.4)} />
      {/* Playback: progress fills and the knob travels with it */}
      <motion.path d="M50 138h120" {...red} strokeWidth={4} {...draw(0.9, 1.2)} />
      <motion.circle
        cy="138"
        r="6"
        {...red}
        fill="var(--paper)"
        {...(play
          ? { initial: { cx: 50, opacity: 0 }, animate: { cx: 170, opacity: 1 }, transition: { delay: T0 + 0.9, duration: 1.2, ease } }
          : { cx: 170 })}
      />
    </svg>
  )
}

function Detail({ cs, onClose }: { cs: CaseStudy; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <motion.div className="cs-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.article
        layoutId={`cs-${cs.id}`}
        className="cs-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`cs-title-${cs.id}`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: 22 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        <button ref={closeRef} className="cs-close" onClick={onClose} aria-label="Close case study">
          <svg viewBox="0 0 20 20" aria-hidden>
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="cs-art-wrap big">
          <Art id={cs.id} play />
        </div>
        <motion.div
          className="cs-detail-body"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.35, ease }}
        >
          <p className="cs-meta">
            {cs.company}, {cs.year}
          </p>
          <h3 className="cs-detail-title" id={`cs-title-${cs.id}`}>
            {cs.title}
          </h3>
          <p className="cs-context">{cs.context}</p>
          <div className="cs-cols">
            <div>
              <h4 className="cs-h4">What I did</h4>
              <ul className="cs-built">
                {cs.built.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="cs-h4">Role</h4>
              <p className="cs-role">{cs.role}</p>
              <h4 className="cs-h4">Stack</h4>
              <ul className="cs-stack">
                {cs.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.article>
    </motion.div>
  )
}

export default function CaseStudies() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = CASE_STUDIES.find((c) => c.id === openId)

  return (
    <>
      <div className="cs-grid">
        {CASE_STUDIES.map((cs) => (
          <motion.button
            key={cs.id}
            layoutId={`cs-${cs.id}`}
            className="cs-card"
            onClick={() => setOpenId(cs.id)}
            style={{ borderRadius: 18 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            aria-haspopup="dialog"
          >
            <div className="cs-art-wrap">
              <Art id={cs.id} />
            </div>
            <span className="cs-meta">
              {cs.company}, {cs.year}
            </span>
            <span className="cs-title">{cs.title}</span>
            <span className="cs-summary">{cs.summary}</span>
            <span className="cs-read">Read case study</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>{open && <Detail key={open.id} cs={open} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </>
  )
}
