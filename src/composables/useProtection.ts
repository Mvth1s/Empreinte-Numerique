import { ref, computed, onMounted } from 'vue'

// Détecte quand le navigateur ment volontairement pour protéger la vie privée, afin de ne jamais
// présenter une valeur falsifiée comme réelle.
//
// Méthode : on demande au navigateur un résultat dont on connaît la réponse exacte (un carré de couleur
// unie, un signal audio constant, un fond WebGL uni). S'il renvoie autre chose, il brouille la lecture.
// Comparer deux rendus ne suffit pas : Brave et Safari génèrent le même bruit pendant toute une session.

// Donnée que le navigateur refuse de fournir (API absente ou désactivée).
export const NOT_GIVEN = 'Votre navigateur ne fournit pas cette information : le site ne l\'apprend pas.'

export type Readback = 'ok' | 'noise' | 'blocked' | 'unsupported'

export interface ProtectionReport {
  brave: boolean
  firefox: boolean
  canvas: Readback
  audio: Readback
  webgl: Readback
}

// Écran : Firefox (resistFingerprinting) et Tor Browser annoncent la taille de la fenêtre
// comme taille d'écran. Fenêtre ≠ plein écran (barres du navigateur visibles) mais écran = fenêtre : impossible
// sur un vrai écran.
export function isScreenSpoofed(): boolean {
  return screen.width === innerWidth && screen.height === innerHeight && outerHeight > innerHeight
}

// Fuseau : Firefox resistFingerprinting et Tor forcent UTC. Suspect seulement si l'IP indique un autre fuseau.
export function isTimezoneSpoofed(timezone: string, ipTimezone: string | null): boolean {
  if (!/^(Etc\/)?(UTC|GMT|Universal|Zulu)$/i.test(timezone) || !ipTimezone) return false
  const off = (tz: string) => {
    try {
      const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date())
      return p.find(x => x.type === 'timeZoneName')?.value ?? ''
    } catch { return '' }
  }
  return off(ipTimezone) !== off('UTC')
}

// Liste normalisée renvoyée par tous les navigateurs modernes : tout autre nom est inventé (Brave).
export const STANDARD_PLUGINS = ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer', 'Microsoft Edge PDF Viewer', 'WebKit built-in PDF']

function checkCanvas(): Readback {
  try {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 32
    const ctx = c.getContext('2d')
    if (!ctx) return 'unsupported'
    ctx.fillStyle = 'rgb(10, 200, 30)'
    ctx.fillRect(0, 0, 64, 32)
    const d = ctx.getImageData(0, 0, 64, 32).data
    let exact = true, blank = true
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] !== 10 || d[i + 1] !== 200 || d[i + 2] !== 30 || d[i + 3] !== 255) exact = false
      if (!(d[i] === d[i + 1] && d[i + 1] === d[i + 2] && (d[i] === 255 || d[i] === 0))) blank = false
    }
    return exact ? 'ok' : blank ? 'blocked' : 'noise'
  } catch { return 'blocked' }
}

async function checkAudio(): Promise<Readback> {
  try {
    if (typeof OfflineAudioContext === 'undefined') return 'unsupported'
    const ctx = new OfflineAudioContext(1, 1024, 44100)
    const src = ctx.createConstantSource()
    src.offset.value = 0.5
    src.connect(ctx.destination)
    src.start()
    const data = (await ctx.startRendering()).getChannelData(0)
    for (let i = 0; i < data.length; i++) if (data[i] !== 0.5) return 'noise'
    return 'ok'
  } catch { return 'blocked' }
}

function checkWebGL(): Readback {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return 'unsupported'
    gl.clearColor(0.2, 0.4, 0.6, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const px = new Uint8Array(4)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px)
    return px[0] === 51 && px[1] === 102 && px[2] === 153 && px[3] === 255 ? 'ok' : 'noise'
  } catch { return 'blocked' }
}

let _report: Promise<ProtectionReport> | null = null

export function detectProtection(): Promise<ProtectionReport> {
  _report ??= (async () => {
    let brave = false
    try { brave = !!(await (navigator as { brave?: { isBrave(): Promise<boolean> } }).brave?.isBrave()) } catch { /* ignore */ }
    return {
      brave,
      firefox: /Firefox\//.test(navigator.userAgent),
      canvas: checkCanvas(),
      audio: await checkAudio(),
      webgl: checkWebGL(),
    }
  })()
  return _report
}

export function useProtection() {
  const report = ref<ProtectionReport | null>(null)
  onMounted(async () => { report.value = await detectProtection() })

  const tampered = (r: Readback | undefined) => r === 'noise' || r === 'blocked'
  // Brave n'altère les valeurs que si sa protection anti-empreinte est active : le brouillage du canvas le prouve.
  const braveFarbling = computed(() => !!report.value?.brave && (tampered(report.value.canvas) || tampered(report.value.audio) || tampered(report.value.webgl)))

  const screenSpoofed = ref(isScreenSpoofed())
  // Firefox « resistFingerprinting » / Tor Browser : écran ramené à la fenêtre ou lecture du canvas bloquée.
  const firefoxResist = computed(() => !!report.value?.firefox && (screenSpoofed.value || report.value.canvas === 'blocked'))

  return {
    report,
    canvasTampered: computed(() => tampered(report.value?.canvas)),
    canvasBlocked: computed(() => report.value?.canvas === 'blocked'),
    audioTampered: computed(() => tampered(report.value?.audio)),
    webglTampered: computed(() => tampered(report.value?.webgl)),
    braveFarbling,
    firefoxResist,
    screenSpoofed,
  }
}
