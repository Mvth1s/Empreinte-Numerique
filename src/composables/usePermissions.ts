import { ref, onMounted } from 'vue'

type PermState = 'granted' | 'denied' | 'prompt' | 'indisponible'

async function queryPerm(name: PermissionName): Promise<PermState> {
  try {
    const result = await navigator.permissions.query({ name })
    return result.state as PermState
  } catch { return 'indisponible' }
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
  const hasGyroscope = ref(false)
  const orientation = ref<string | null>(null)

  onMounted(async () => {
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

    // Gyroscope detection
    if ('DeviceMotionEvent' in window) {
      hasGyroscope.value = true
    }

    orientation.value = screen.orientation?.type ?? null
  })

  return { geolocation, camera, microphone, notifications, clipboard, persistentStorage, midi, touchPoints, hasGyroscope, orientation }
}
