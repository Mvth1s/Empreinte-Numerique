import { ref, onMounted, onUnmounted } from 'vue'

export function useBehavior() {
  const scrollDepth = ref(0)
  const timeOnPage = ref(0)
  const tabSwitches = ref(0)
  const mousePositions = ref<{ x: number; y: number }[]>([])
  const avgMouseSpeed = ref(0)
  const avgKeyInterval = ref<number | null>(null)
  const handedness = ref<string>('…')
  const startTime = Date.now()
  let timer: ReturnType<typeof setInterval> | null = null
  let lastPos: { x: number; y: number; t: number } | null = null
  let totalSpeed = 0, speedSamples = 0
  let lastKeyTime = 0
  const keyIntervals: number[] = []
  let xSum = 0, xCount = 0

  function onScroll() {
    const docH = document.documentElement.scrollHeight - window.innerHeight
    scrollDepth.value = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0
  }

  function onVisibilityChange() {
    if (document.hidden) tabSwitches.value++
  }

  function onMouseMove(e: MouseEvent) {
    const now = Date.now()
    mousePositions.value.push({ x: e.clientX, y: e.clientY })
    if (mousePositions.value.length > 500) mousePositions.value.shift()

    if (lastPos) {
      const dx = e.clientX - lastPos.x
      const dy = e.clientY - lastPos.y
      const dt = (now - lastPos.t) / 1000
      if (dt > 0) {
        const speed = Math.sqrt(dx * dx + dy * dy) / dt
        totalSpeed += speed; speedSamples++
        avgMouseSpeed.value = Math.round(totalSpeed / speedSamples)
      }
    }
    lastPos = { x: e.clientX, y: e.clientY, t: now }

    // Handedness: track average X position relative to viewport width
    xSum += e.clientX / window.innerWidth
    xCount++
    if (xCount >= 30) {
      const mean = xSum / xCount
      if (mean > 0.55) handedness.value = 'droitier probable'
      else if (mean < 0.45) handedness.value = 'gaucher probable'
      else handedness.value = 'indéterminé'
    }
  }

  function onKeyDown() {
    const now = Date.now()
    if (lastKeyTime > 0) {
      const interval = now - lastKeyTime
      if (interval > 30 && interval < 2000) {
        keyIntervals.push(interval)
        if (keyIntervals.length > 50) keyIntervals.shift()
        const sum = keyIntervals.reduce((a, b) => a + b, 0)
        avgKeyInterval.value = Math.round(sum / keyIntervals.length)
      }
    }
    lastKeyTime = now
  }

  onMounted(() => {
    timer = setInterval(() => {
      timeOnPage.value = Math.round((Date.now() - startTime) / 1000)
    }, 1000)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('keydown', onKeyDown)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('keydown', onKeyDown)
  })

  return { scrollDepth, timeOnPage, tabSwitches, mousePositions, avgMouseSpeed, avgKeyInterval, handedness }
}
