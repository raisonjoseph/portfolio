// Sends events to Google Tag Manager's dataLayer. In GTM, create a "Custom Event" trigger
// with the event name (e.g. cv_download) and attach a GA4 event tag to it.
type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] }

export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as DataLayerWindow
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...params })
}
