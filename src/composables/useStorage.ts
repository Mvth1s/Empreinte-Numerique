import { ref, onMounted } from 'vue'

function formatBytes(b: number): string {
  if (b >= 1024 ** 4) return `${(b / 1024 ** 4).toFixed(1)} To`
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(1)} Go`
  return `${Math.round(b / 1024 ** 2)} Mo`
}

// Les navigateurs Chromium accordent à une origine ~60 % de la taille totale du disque :
// quota / 0,6 donne donc la capacité du disque. Firefox et Safari utilisent d'autres règles.
const CHROMIUM_QUOTA_RATIO = 0.6

interface QuotaInfo { quota: string; usage: string; disk: string | null; ephemeral: boolean }

async function estimateStorageQuota(): Promise<QuotaInfo | null> {
  try {
    const est = await navigator.storage?.estimate()
    if (!est?.quota) return null
    const chromium = !!navigator.userAgentData?.brands.some(b => b.brand === 'Chromium')
    // En navigation privée (profil en mémoire), Chromium accorde un quota fixe, multiple exact du Gio,
    // sans rapport avec le disque. Un quota calculé sur le disque ne tombe jamais pile sur un Gio.
    const ephemeral = chromium && est.quota % 1024 ** 3 === 0
    return {
      quota: formatBytes(est.quota),
      usage: formatBytes(est.usage ?? 0),
      disk: chromium && !ephemeral ? formatBytes(est.quota / CHROMIUM_QUOTA_RATIO) : null,
      ephemeral,
    }
  } catch { return null }
}

// 'indexedDB' in window ne prouve rien : certains modes privés exposent l'objet mais refusent l'ouverture.
function testIndexedDB(): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const req = indexedDB.open('__en_test')
      req.onsuccess = () => { req.result.close(); indexedDB.deleteDatabase('__en_test'); resolve(true) }
      req.onerror = () => resolve(false)
      setTimeout(() => resolve(false), 2000)
    } catch { resolve(false) }
  })
}

export const CACHE_TEST_TARGETS = [
  { url: 'https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js', name: 'jQuery (jsDelivr)', host: 'cdn.jsdelivr.net' },
  { url: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap', name: 'Google Fonts (Roboto)', host: 'fonts.googleapis.com' },
  { url: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js', name: 'Lodash (Cloudflare)', host: 'cdnjs.cloudflare.com' },
]

async function testCacheHit(url: string): Promise<number> {
  const start = performance.now()
  try { await fetch(url, { mode: 'no-cors', cache: 'force-cache' }) } catch { /* ignore */ }
  return performance.now() - start
}

export function useStorage() {
  const localStorageAvail = ref(false)
  const sessionStorageAvail = ref(false)
  const indexedDBAvail = ref(false)
  const cookiesEnabled = ref(navigator.cookieEnabled)
  const serviceWorkerAvail = ref('serviceWorker' in navigator)
  const cacheAPIAvail = ref('caches' in window)
  const storageQuota = ref<string | null>(null)
  const storageUsage = ref<string | null>(null)
  const diskEstimate = ref<string | null>(null)
  const persisted = ref<boolean | null>(null)
  const ephemeralProfile = ref(false)
  const cacheTimings = ref<{ url: string; ms: number; cached: boolean }[]>([])
  const cacheTesting = ref(false)

  function testLocalStorage(): boolean {
    try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); return true }
    catch { return false }
  }

  function testSessionStorage(): boolean {
    try { sessionStorage.setItem('_test', '1'); sessionStorage.removeItem('_test'); return true }
    catch { return false }
  }

  onMounted(async () => {
    localStorageAvail.value = testLocalStorage()
    sessionStorageAvail.value = testSessionStorage()
    const [idb, q, p] = await Promise.all([
      testIndexedDB(),
      estimateStorageQuota(),
      navigator.storage?.persisted?.().catch(() => null) ?? null,
    ])
    indexedDBAvail.value = idb
    storageQuota.value = q?.quota ?? 'Inconnu'
    storageUsage.value = q?.usage ?? null
    diskEstimate.value = q?.disk ?? null
    ephemeralProfile.value = q?.ephemeral ?? false
    persisted.value = p
  })

  // Lancé uniquement à la demande : contacte des CDN tiers, qui voient alors l'IP du visiteur.
  async function runCacheTest() {
    if (cacheTesting.value) return
    cacheTesting.value = true
    const timings = await Promise.all(CACHE_TEST_TARGETS.map(async c => {
      const ms = await testCacheHit(c.url)
      return { url: c.name, ms: Math.round(ms), cached: ms < 20 }
    }))
    cacheTimings.value = timings
    cacheTesting.value = false
  }

  return {
    localStorageAvail, sessionStorageAvail, indexedDBAvail, cookiesEnabled, serviceWorkerAvail, cacheAPIAvail,
    storageQuota, storageUsage, diskEstimate, ephemeralProfile, persisted, cacheTimings, cacheTesting, runCacheTest,
  }
}
