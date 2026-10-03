import { ref, computed, onMounted } from 'vue'

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

interface BatteryManager extends EventTarget {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

declare global {
  interface Navigator {
    deviceMemory?: number
    getBattery?: () => Promise<BatteryManager>
  }
  interface Performance {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number; totalJSHeapSize: number }
  }
  interface Screen {
    isExtended?: boolean
  }
}

// navigator.deviceMemory est volontairement imprécis (spec Device Memory) : arrondi à une puissance de 2
// et plafonné. Le plafond historique est 8 Go (16 ou 32 Go de RAM renvoient 8) ; Chrome récent monte à 32.
const DEVICE_MEMORY_CAPS = [8, 32]

const COMMON_RATES = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 170, 180, 200, 240, 280, 360, 480, 500]

export function useScreen() {
  const resolution = ref(`${screen.width} × ${screen.height}`)
  const physicalResolution = ref(`${Math.round(screen.width * devicePixelRatio)} × ${Math.round(screen.height * devicePixelRatio)}`)
  const availResolution = ref(`${screen.availWidth} × ${screen.availHeight}`)
  const colorDepth = ref(screen.colorDepth)
  const pixelRatio = ref(Math.round(window.devicePixelRatio * 100) / 100)
  const cores = ref(navigator.hardwareConcurrency ?? null)
  const memory = ref<number | null>(navigator.deviceMemory ?? null)
  const battery = ref<BatteryInfo | null>(null)
  const hdr = ref(window.matchMedia('(dynamic-range: high)').matches)
  const colorGamut = ref(
    window.matchMedia('(color-gamut: rec2020)').matches ? 'Rec.2020'
      : window.matchMedia('(color-gamut: p3)').matches ? 'Display P3'
      : window.matchMedia('(color-gamut: srgb)').matches ? 'sRGB' : 'inconnu'
  )
  const prefersColorScheme = ref(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const refreshRate = ref<number | null>(null)
  const touchPoints = ref(navigator.maxTouchPoints)

  const memoryCapped = computed(() => memory.value !== null && (DEVICE_MEMORY_CAPS.includes(memory.value) || memory.value > 32))
  const memoryLabel = computed(() => {
    const m = memory.value
    if (m === null) return null
    if (memoryCapped.value) return `${m} Go ou plus`
    return m < 1 ? `≈ ${m * 1024} Mo` : `≈ ${m} Go`
  })

  const heapUsed = ref<number | null>(null)
  const heapLimit = ref<number | null>(null)
  const isExtended = ref<boolean | null>(screen.isExtended ?? null)

  // Médiane des intervalles entre frames (robuste aux à-coups), recalée sur la fréquence standard la plus proche.
  function measureRefreshRate() {
    const deltas: number[] = []
    let last = 0
    function frame(t: number) {
      if (last) deltas.push(t - last)
      last = t
      if (deltas.length < 90) { requestAnimationFrame(frame); return }
      deltas.sort((a, b) => a - b)
      const hz = 1000 / deltas[Math.floor(deltas.length / 2)]
      const snap = COMMON_RATES.reduce((p, c) => Math.abs(c - hz) < Math.abs(p - hz) ? c : p)
      refreshRate.value = Math.abs(snap - hz) / snap < 0.04 ? snap : Math.round(hz)
    }
    requestAnimationFrame(frame)
  }

  function readHeap() {
    if (!performance.memory) return
    heapUsed.value = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
    heapLimit.value = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
  }

  onMounted(async () => {
    measureRefreshRate()
    readHeap()
    try {
      if (navigator.getBattery) {
        const b = await navigator.getBattery()
        const sync = () => {
          battery.value = {
            level: Math.round(b.level * 100),
            charging: b.charging,
            chargingTime: b.chargingTime,
            dischargingTime: b.dischargingTime,
          }
        }
        sync()
        b.addEventListener('levelchange', sync)
        b.addEventListener('chargingchange', sync)
      }
    } catch { /* API non supportée */ }
  })

  return {
    resolution, physicalResolution, availResolution, colorDepth, pixelRatio, cores, memory, memoryCapped, memoryLabel,
    battery, hdr, colorGamut, prefersColorScheme, refreshRate, touchPoints, heapUsed, heapLimit, isExtended,
  }
}
