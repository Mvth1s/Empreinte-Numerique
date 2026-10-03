import { ref, onMounted } from 'vue'

type PermState = 'granted' | 'denied' | 'prompt' | 'indisponible'

async function queryPerm(name: PermissionName): Promise<PermState> {
  try {
    const result = await navigator.permissions.query({ name })
    return result.state as PermState
  } catch { return 'indisponible' }
}

// 'DeviceMotionEvent' in window est vrai sur tous les PC : seul un évènement avec des mesures réelles prouve le capteur.
function detectMotionSensor(): Promise<boolean | null> {
  const DME = (window as unknown as { DeviceMotionEvent?: { requestPermission?: unknown } }).DeviceMotionEvent
  if (!DME) return Promise.resolve(false)
  if (typeof DME.requestPermission === 'function') return Promise.resolve(null)
  return new Promise(resolve => {
    const done = (v: boolean) => { window.removeEventListener('devicemotion', onMotion); resolve(v) }
    const onMotion = (e: DeviceMotionEvent) => {
      const r = e.rotationRate, a = e.accelerationIncludingGravity
      if ((r && r.alpha !== null) || (a && a.x !== null)) done(true)
    }
    window.addEventListener('devicemotion', onMotion)
    setTimeout(() => done(false), 1000)
  })
}

export function usePermissions() {
  const geolocation = ref<PermState>('indisponible')
  const camera = ref<PermState>('indisponible')
  const microphone = ref<PermState>('indisponible')
  const notifications = ref<PermState>('indisponible')
  const clipboard = ref<PermState>('indisponible')
  const persistentStorage = ref<PermState>('indisponible')
  const midi = ref<PermState>('indisponible')
  const touchPoints = ref(navigator.maxTouchPoints)
  // null = inconnu (iOS exige une permission avant tout évènement de mouvement)
  const hasGyroscope = ref<boolean | null>(null)
  const orientation = ref<string | null>(null)

  onMounted(async () => {
    orientation.value = screen.orientation?.type ?? null
    detectMotionSensor().then(v => { hasGyroscope.value = v })
    if (!('permissions' in navigator)) return

    const results = await Promise.allSettled([
      queryPerm('geolocation'),
      queryPerm('camera' as PermissionName),
      queryPerm('microphone' as PermissionName),
      queryPerm('notifications'),
      queryPerm('clipboard-read' as PermissionName),
      queryPerm('persistent-storage' as PermissionName),
      queryPerm('midi' as PermissionName),
    ])

    const vals = results.map(r => r.status === 'fulfilled' ? r.value : 'indisponible' as PermState)
    geolocation.value = vals[0]
    camera.value = vals[1]
    microphone.value = vals[2]
    notifications.value = vals[3]
    clipboard.value = vals[4]
    persistentStorage.value = vals[5]
    midi.value = vals[6]
  })

  return { geolocation, camera, microphone, notifications, clipboard, persistentStorage, midi, touchPoints, hasGyroscope, orientation }
}
