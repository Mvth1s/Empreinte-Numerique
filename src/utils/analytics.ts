// Google Analytics 4 chargé uniquement après consentement explicite (RGPD / recommandations CNIL).
// Tant que le visiteur n'a pas accepté, aucun script Google n'est téléchargé et aucun cookie n'est posé.

export const GA_ID = 'G-X83M1WF7KK'
const CONSENT_KEY = 'en-consent'

export type Consent = 'granted' | 'denied'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

function saveConsent(c: Consent) {
  try { localStorage.setItem(CONSENT_KEY, c) } catch { /* stockage indisponible : on redemandera */ }
}

let loaded = false

function loadAnalytics() {
  if (loaded) return
  loaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag.js attend l'objet `arguments`, pas un tableau.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, { anonymize_ip: true })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
}

// Supprime les cookies _ga / _ga_* posés sur le domaine courant et ses parents.
function clearGaCookies() {
  const names = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n.startsWith('_ga'))
  const parts = location.hostname.split('.')
  const domains = [''].concat(parts.map((_, i) => '; domain=.' + parts.slice(i).join('.')))
  for (const name of names) {
    for (const d of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`
  }
}

export function setConsent(c: Consent) {
  saveConsent(c)
  if (c === 'granted') {
    loadAnalytics()
  } else {
    if (loaded) window.gtag('consent', 'update', { analytics_storage: 'denied' })
    clearGaCookies()
  }
}

// À appeler au démarrage : charge GA si le visiteur a déjà accepté lors d'une visite précédente.
export function initAnalytics() {
  if (readConsent() === 'granted') loadAnalytics()
}
