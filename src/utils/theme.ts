// Thème clair / sombre. Par défaut le site suit le réglage du système (prefers-color-scheme) ;
// un choix explicite est posé en data-theme sur <html> et mémorisé dans localStorage['en-theme'].
// public/theme-init.js l'applique avant le premier rendu pour éviter un flash de l'autre thème.

export type Theme = 'light' | 'dark'

const KEY = 'en-theme'
const hasDom = typeof document !== 'undefined'

// Couleurs des canvas (fond animé, écrans de chargement), en "r, g, b" pour composer des rgba().
// Relues depuis les variables CSS à chaque changement de thème.
export const P = {
  accent: '0, 229, 255',
  bg: '10, 10, 15',
  panel: '8, 8, 13',
  ink: '255, 255, 255',
  ok: '108, 217, 154',
  bad: '255, 59, 48',
  cyan: '#00e5ff',
  faint: 'rgba(0, 229, 255, 0.35)',
  dim: 'rgba(0, 229, 255, 0.12)',
}

export function refreshPalette() {
  if (!hasDom) return
  const cs = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  P.accent = read('--accent-rgb', P.accent)
  P.bg = read('--bg-rgb', P.bg)
  P.panel = read('--panel-rgb', P.panel)
  P.ink = read('--ink-rgb', P.ink)
  P.ok = read('--ok-rgb', P.ok)
  P.bad = read('--bad-rgb', P.bad)
  P.cyan = `rgb(${P.accent})`
  P.faint = `rgba(${P.accent}, 0.35)`
  P.dim = `rgba(${P.accent}, 0.12)`
}

export function currentTheme(): Theme {
  const t = document.documentElement.dataset.theme
  if (t === 'light' || t === 'dark') return t
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  try { localStorage.setItem(KEY, t) } catch { /* stockage indisponible : choix valable pour la page seulement */ }
  refreshPalette()
}

if (hasDom) {
  refreshPalette()
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', refreshPalette)
}
