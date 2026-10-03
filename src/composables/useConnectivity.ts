import { ref, onMounted, onUnmounted } from 'vue'

interface Connection extends EventTarget {
  type?: string
  effectiveType?: string
  downlink?: number
  downlinkMax?: number
  rtt?: number
  saveData?: boolean
}

declare global {
  interface Navigator { connection?: Connection }
}

// Network Information API : Chrome plafonne downlink à 10 Mb/s (arrondi à 25 kb/s) et arrondit rtt à 25 ms,
// pour limiter le fingerprinting. Une fibre à 1 Gb/s s'affiche donc "10 Mb/s".
export const DOWNLINK_CAP = 10

export const SPEED_TEST_HOST = 'speed.cloudflare.com'
const SPEED_URL = `https://${SPEED_TEST_HOST}/__down`

export interface SpeedResult {
  pingMs: number
  jitterMs: number
  downMbps: number
  colo: string | null
  city: string | null
}

// Résultat partagé au niveau module : la mesure n'est faite qu'une fois par visite.
let _speedPromise: Promise<SpeedResult | null> | null = null

async function timedFetch(bytes: number) {
  const t0 = performance.now()
  const res = await fetch(`${SPEED_URL}?bytes=${bytes}&r=${Math.random()}`, { cache: 'no-store', credentials: 'omit' })
  const buf = await res.arrayBuffer()
  return { ms: performance.now() - t0, size: buf.byteLength, res }
}

export function useConnectivity() {
  const conn = navigator.connection
  const connectionType = ref(conn?.type ?? null)
  const effectiveType = ref(conn?.effectiveType ?? null)
  const downlink = ref(conn?.downlink ?? null)
  const rtt = ref(conn?.rtt ?? null)
  const saveData = ref(conn?.saveData ?? null)
  const online = ref(navigator.onLine)

  const speed = ref<SpeedResult | null>(null)
  const speedTesting = ref(false)
  const speedError = ref(false)

  function sync() {
    connectionType.value = conn?.type ?? null
    effectiveType.value = conn?.effectiveType ?? null
    downlink.value = conn?.downlink ?? null
    rtt.value = conn?.rtt ?? null
    saveData.value = conn?.saveData ?? null
  }
  const onOnline = () => { online.value = navigator.onLine }

  // Mesure réelle lancée à l'ouverture de l'onglet : contacte speed.cloudflare.com (qui voit donc l'IP du visiteur).
  // force = relance manuelle (bouton), sinon on réutilise la mesure déjà faite.
  async function runSpeedTest(force = false) {
    if (speedTesting.value) return
    speedTesting.value = true
    speedError.value = false
    if (force || !_speedPromise) _speedPromise = measure()
    const r = await _speedPromise
    if (r) speed.value = r
    else { speedError.value = true; _speedPromise = null }
    speedTesting.value = false
  }

  async function measure(): Promise<SpeedResult | null> {
    try {
      const pings: number[] = []
      let colo: string | null = null, city: string | null = null
      for (let i = 0; i < 6; i++) {
        const r = await timedFetch(0)
        if (i === 0) {
          colo = r.res.headers.get('cf-meta-colo')
          city = r.res.headers.get('cf-meta-city')
          continue // la 1re requête inclut DNS + TLS
        }
        pings.push(r.ms)
      }
      // Gigue = écart moyen entre mesures consécutives (ordre chronologique), latence = médiane.
      const jitterMs = pings.slice(1).reduce((s, p, i) => s + Math.abs(p - pings[i]), 0) / (pings.length - 1)
      const pingMs = [...pings].sort((a, b) => a - b)[Math.floor(pings.length / 2)]

      // Taille croissante (1 → 4 → 16 Mo) jusqu'à ~1 s de transfert pour ne pas sous-estimer les connexions rapides.
      // En données mobiles ou mode économie, on s'arrête à 1 Mo pour ne pas consommer le forfait.
      const light = conn?.saveData || conn?.type === 'cellular'
      let bytes = 1_000_000, best = 0
      for (let i = 0; i < (light ? 1 : 3); i++) {
        const r = await timedFetch(bytes)
        const transferMs = Math.max(r.ms - pingMs, 1)
        best = Math.max(best, (r.size * 8) / (transferMs / 1000) / 1e6)
        if (r.ms > 1000) break
        bytes *= 4
      }
      return { pingMs: Math.round(pingMs), jitterMs: Math.round(jitterMs), downMbps: Math.round(best * 10) / 10, colo, city }
    } catch {
      return null
    }
  }

  onMounted(() => {
    conn?.addEventListener('change', sync)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOnline)
  })
  onUnmounted(() => {
    conn?.removeEventListener('change', sync)
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOnline)
  })

  return { connectionType, effectiveType, downlink, rtt, saveData, online, speed, speedTesting, speedError, runSpeedTest }
}
