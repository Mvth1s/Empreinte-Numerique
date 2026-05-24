import { ref } from 'vue'

interface Connection {
  type?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

declare global {
  interface Navigator { connection?: Connection }
}

export function useConnectivity() {
  const conn = (navigator as Navigator).connection
  const connectionType = ref(conn?.type ?? null)
  const effectiveType = ref(conn?.effectiveType ?? null)
  const downlink = ref(conn?.downlink ?? null)
  const rtt = ref(conn?.rtt ?? null)
  const saveData = ref(conn?.saveData ?? null)
  const online = ref(navigator.onLine)

  return { connectionType, effectiveType, downlink, rtt, saveData, online }
}
