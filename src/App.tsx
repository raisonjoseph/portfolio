import { Suspense, lazy } from 'react'

// Other versions stay reachable by URL (/v2–/v7). `id` drives per-version body styles (html[data-v=...]).
const VERSIONS = [
  { path: '/', id: '1', fonts: '', Page: lazy(() => import('./v1/V1')) },
  { path: '/v2', id: '2', fonts: 'Onest:wght@400..800', Page: lazy(() => import('./v2/V2')) },
  { path: '/v3', id: '3', fonts: 'Instrument+Sans:wdth,wght@75..100,400..700', Page: lazy(() => import('./v3/V3')) },
  { path: '/v4', id: 'palette', fonts: 'Hanken+Grotesk:wght@400..800', Page: lazy(() => import('./palette/Palette')) },
  { path: '/v5', id: 'split', fonts: 'Plus+Jakarta+Sans:wght@400..800', Page: lazy(() => import('./split/Split')) },
  { path: '/v6', id: 'bento', fonts: 'Figtree:wght@400..800', Page: lazy(() => import('./bento/Bento')) },
  { path: '/v7', id: 'editorial', fonts: 'Archivo:wdth,wght@62..125,400..900&family=Inter+Tight:wght@400..700', Page: lazy(() => import('./editorial/Editorial')) },
]

function currentVersion() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return VERSIONS.find((v) => v.path === path) ?? VERSIONS[0]
}

// Same markup as the loader in index.html, shown while a version's code is loading.
function Loader() {
  return (
    <div className="boot" role="status" aria-label="Loading">
      <div className="boot-inner">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M10 34 C16 38 20 44 24 52 C32 34 42 20 58 8" />
        </svg>
        <span className="boot-name">Raison Joseph</span>
      </div>
    </div>
  )
}

export default function App() {
  const active = currentVersion()
  const { Page } = active
  document.documentElement.dataset.v = active.id

  // Alternate versions: load their own fonts, and keep them out of search results.
  if (active.fonts && !document.getElementById('version-fonts')) {
    const link = document.createElement('link')
    link.id = 'version-fonts'
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${active.fonts}&display=swap`
    document.head.appendChild(link)
  }
  const site = import.meta.env.VITE_SITE_URL as string | undefined
  if (site && !document.querySelector('link[rel="canonical"]')) {
    const link = document.createElement('link')
    link.rel = 'canonical'
    link.href = `${site}/`
    document.head.appendChild(link)
  }
  if (active.path !== '/' && !document.querySelector('meta[name="robots"]')) {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
  }

  return (
    <Suspense fallback={<Loader />}>
      <Page />
    </Suspense>
  )
}
