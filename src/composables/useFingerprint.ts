import { ref, onMounted } from 'vue'
import { sha256, shortHash } from '../utils/hash'

const FONTS = [
  'Arial','Arial Black','Arial Narrow','Bahnschrift','Calibri','Cambria','Cambria Math',
  'Candara','Comic Sans MS','Consolas','Constantia','Corbel','Courier New',
  'Franklin Gothic Medium','Gabriola','Georgia','Impact','Ink Free','Lucida Console',
  'Lucida Sans Unicode','Microsoft Sans Serif','Palatino Linotype','Segoe Print',
  'Segoe Script','Segoe UI','Segoe UI Historic','Sylfaen','Symbol','Tahoma',
  'Times New Roman','Trebuchet MS','Verdana','Webdings','Wingdings','Yu Gothic',
  'American Typewriter','Andale Mono','Apple Chancery','Chalkboard SE','Cochin',
  'Copperplate','Courier','Futura','Geneva','Gill Sans','Helvetica','Helvetica Neue',
  'Herculanum','Hoefler Text','Lucida Grande','Marker Felt','Menlo','Monaco',
  'Optima','Papyrus','Rockwell','Snell Roundhand','Times','Zapfino',
  'DejaVu Sans','DejaVu Sans Mono','DejaVu Serif','Liberation Mono','Liberation Sans',
  'Liberation Serif','Noto Sans','Noto Serif','Ubuntu','Ubuntu Mono',
  'Roboto','Open Sans','Lato','Montserrat','Oswald','Raleway','Nunito',
  'Playfair Display','Merriweather','Source Code Pro','Fira Code','JetBrains Mono',
  'Space Mono','IBM Plex Mono','IBM Plex Sans','Inter','DM Sans',
  'Myriad Pro','Minion Pro','Garamond','Century Gothic','Baskerville','Didot',
  'Gill Sans MT','Bodoni MT','Trajan','Book Antiqua','Bookman Old Style',
]

function detectFonts(): string[] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  const TEXT = 'mmmmwwwwiiiiWWW'
  const SIZE = '72px'

  const measure = (font: string) => {
    ctx.font = `${SIZE} ${font}`
    return ctx.measureText(TEXT).width
  }
  const base = { mono: measure('monospace'), sans: measure('sans-serif'), serif: measure('serif') }

  return FONTS.filter(f => {
    const w = { mono: measure(`'${f}',monospace`), sans: measure(`'${f}',sans-serif`), serif: measure(`'${f}',serif`) }
    return w.mono !== base.mono || w.sans !== base.sans || w.serif !== base.serif
  })
}

async function canvasFingerprint(): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 240; canvas.height = 60
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f60'
  ctx.fillRect(110, 2, 120, 30)
  ctx.fillStyle = '#069'
  ctx.font = '13px "Arial"'
  ctx.fillText('Cwm fjordbank glyphs vext quiz, \u{1F310}', 2, 20)
  ctx.fillStyle = 'rgba(102,204,0,0.3)'
  ctx.font = '17px "Times New Roman"'
  ctx.fillText('Cwm fjordbank', 4, 45)
  ctx.strokeStyle = 'rgba(0,229,255,0.5)'
  ctx.arc(60, 30, 20, 0, Math.PI * 2)
  ctx.stroke()
  return shortHash(await sha256(canvas.toDataURL()))
}

async function audioFingerprint(): Promise<string> {
  return new Promise(resolve => {
    try {
      const ctx = new OfflineAudioContext(1, 44100, 44100)
      const osc = ctx.createOscillator()
      const comp = ctx.createDynamicsCompressor()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(10000, ctx.currentTime)
      comp.threshold.setValueAtTime(-50, ctx.currentTime)
      comp.knee.setValueAtTime(40, ctx.currentTime)
      comp.ratio.setValueAtTime(12, ctx.currentTime)
      comp.attack.setValueAtTime(0, ctx.currentTime)
      comp.release.setValueAtTime(0.25, ctx.currentTime)
      osc.connect(comp); comp.connect(ctx.destination)
      osc.start(0)
      ctx.startRendering().then(async buf => {
        const data = buf.getChannelData(0)
        let sum = 0
        for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i])
        resolve(shortHash(await sha256(sum.toFixed(12))))
      }).catch(() => resolve(''))
    } catch { resolve('') }
  })
}

function cssMediaFingerprint(): string {
  const checks: Record<string, string> = {
    'prefers-color-scheme:dark': window.matchMedia('(prefers-color-scheme: dark)').matches ? '1' : '0',
    'prefers-color-scheme:light': window.matchMedia('(prefers-color-scheme: light)').matches ? '1' : '0',
    'prefers-reduced-motion': window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '1' : '0',
    'prefers-contrast:high': window.matchMedia('(prefers-contrast: high)').matches ? '1' : '0',
    'forced-colors': window.matchMedia('(forced-colors: active)').matches ? '1' : '0',
    'pointer:fine': window.matchMedia('(pointer: fine)').matches ? '1' : '0',
    'pointer:coarse': window.matchMedia('(pointer: coarse)').matches ? '1' : '0',
    'hover': window.matchMedia('(hover: hover)').matches ? '1' : '0',
    'color-gamut:p3': window.matchMedia('(color-gamut: p3)').matches ? '1' : '0',
    'display-mode:standalone': window.matchMedia('(display-mode: standalone)').matches ? '1' : '0',
  }
  return Object.values(checks).join('')
}

function getPlugins(): string[] {
  return Array.from(navigator.plugins).map(p => p.name).filter(Boolean)
}

function getCodecs(): Record<string, string> {
  const v = document.createElement('video')
  const a = document.createElement('audio')
  const test = (el: HTMLMediaElement, type: string) => el.canPlayType(type) || 'non'
  return {
    'H.264': test(v, 'video/mp4; codecs="avc1.42E01E"'),
    'H.265/HEVC': test(v, 'video/mp4; codecs="hev1.1.6.L93.90"'),
    'VP9': test(v, 'video/webm; codecs="vp9"'),
    'AV1': test(v, 'video/mp4; codecs="av01.0.00M.08"'),
    'MP3': test(a, 'audio/mpeg'),
    'AAC': test(a, 'audio/aac'),
    'Opus': test(a, 'audio/ogg; codecs="opus"'),
    'FLAC': test(a, 'audio/flac'),
  }
}

export function useFingerprint() {
  const canvasHash = ref<string | null>(null)
  const audioHash = ref<string | null>(null)
  const cssMedia = ref<string | null>(null)
  const detectedFonts = ref<string[]>([])
  const plugins = ref<string[]>([])
  const codecs = ref<Record<string, string>>({})
  const combinedHash = ref<string | null>(null)
  const loading = ref(true)

  onMounted(async () => {
    cssMedia.value = cssMediaFingerprint()
    plugins.value = getPlugins()
    codecs.value = getCodecs()

    const [cvs, aud] = await Promise.all([canvasFingerprint(), audioFingerprint()])
    canvasHash.value = cvs || null
    audioHash.value = aud || null

    detectedFonts.value = detectFonts()

    const combined = [cvs, aud, cssMedia.value, detectedFonts.value.join(',')].join('|')
    combinedHash.value = shortHash(await sha256(combined))
    loading.value = false
  })

  return { canvasHash, audioHash, cssMedia, detectedFonts, plugins, codecs, combinedHash, loading }
}
