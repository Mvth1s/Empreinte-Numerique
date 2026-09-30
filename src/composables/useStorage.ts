import { ref, onMounted } from 'vue'

async function estimateStorageQuota(): Promise<string> {
  try {
    const est = await navigator.storage?.estimate()
    if (est?.quota) return `${Math.round(est.quota / 1024 / 1024)} MB`
  } catch { /* ignore */ }
  return 'Inconnu'
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

  function testIndexedDB(): boolean {
    return 'indexedDB' in window
  }

  onMounted(async () => {
    localStorageAvail.value = testLocalStorage()
    sessionStorageAvail.value = testSessionStorage()
    indexedDBAvail.value = testIndexedDB()
    storageQuota.value = await estimateStorageQuota()
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

  return { localStorageAvail, sessionStorageAvail, indexedDBAvail, cookiesEnabled, serviceWorkerAvail, cacheAPIAvail, storageQuota, cacheTimings, cacheTesting, runCacheTest }
}
