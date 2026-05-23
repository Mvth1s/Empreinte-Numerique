import { ref, onMounted } from 'vue'

interface BatteryInfo {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

declare global {
  interface Navigator {
    deviceMemory?: number
    getBattery?: () => Promise<BatteryInfo>
  }
  interface Performance {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number; totalJSHeapSize: number }
  }
  interface Screen {
    isExtended?: boolean
  }
}

export function useScreen() {
  const resolution = ref(`${screen.width} × ${screen.height}`)
  const availResolution = ref(`${screen.availWidth} × ${screen.availHeight}`)
  const colorDepth = ref(screen.colorDepth)
  const pixelRatio = ref(window.devicePixelRatio)
  const cores = ref(navigator.hardwareConcurrency ?? null)
  const memory = ref<number | null>(navigator.deviceMemory ?? null)
  const battery = ref<BatteryInfo | null>(null)
  const hdr = ref(window.matchMedia('(color-gamut: p3)').matches)
  const prefersColorScheme = ref(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const refreshRate = ref<number | null>(null)
  const touchPoints = ref(navigator.maxTouchPoints)

  const heapUsed = ref<number | null>(
    performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null
  )
  const heapLimit = ref<number | null>(
    performance.memory ? Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) : null
  )
  const isExtended = ref<boolean | null>(screen.isExtended ?? null)

  function measureRefreshRate() {
    let start = 0, count = 0
    function frame(t: number) {
      if (!start) start = t
      count++
      if (t - start < 1000) requestAnimationFrame(frame)
      else refreshRate.value = Math.round(count * 1000 / (t - start))
    }
    requestAnimationFrame(frame)
  }

  onMounted(async () => {
    measureRefreshRate()
    try {
      if (navigator.getBattery) {
        const b = await navigator.getBattery()
        battery.value = {
          level: Math.round(b.level * 100),
          charging: b.charging,
          chargingTime: b.chargingTime,
          dischargingTime: b.dischargingTime,
        }
      }
    } catch { /* API non supportée */ }
    if (performance.memory) {
      heapUsed.value = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      heapLimit.value = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    }
  })

  return { resolution, availResolution, colorDepth, pixelRatio, cores, memory, battery, hdr, prefersColorScheme, refreshRate, touchPoints, heapUsed, heapLimit, isExtended }
}
