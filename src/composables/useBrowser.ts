import { ref, onMounted } from 'vue'

// Le User-Agent est "gelé" par Chrome, Edge, Firefox et Safari : Windows 11 s'annonce "Windows NT 10.0",
// macOS reste bloqué sur 10_15_7 et Android sur "Android 10; K". On ne s'en sert qu'en dernier recours.
function parseUA(ua: string) {
  let os = 'Inconnu'
  let browser = 'Inconnu'
  let browserVersion = ''
  let frozen = false

  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  if (/Windows NT 10/.test(ua)) { os = 'Windows 10 ou 11'; frozen = true }
  else if (/Windows NT 6.3/.test(ua)) os = 'Windows 8.1'
  else if (/Windows NT 6.1/.test(ua)) os = 'Windows 7'
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${ua.match(/iPhone OS ([\d_]+)/)?.[1].replace(/_/g, '.') ?? ''}`
  else if (isIPadOS || /iPad; CPU OS ([\d_]+)/.test(ua)) os = `iPadOS ${ua.match(/(?:CPU OS|Version\/)([\d_.]+)/)?.[1].replace(/_/g, '.') ?? ''}`.trim()
  else if (/Mac OS X ([\d_]+)/.test(ua)) {
    const v = ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, '.') ?? ''
    frozen = v === '10.15.7'
    os = frozen ? 'macOS (version masquée)' : `macOS ${v}`
  }
  else if (/Android ([\d.]+)/.test(ua)) { os = `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ''}`; frozen = /Android 10; K\b/.test(ua) }
  else if (/CrOS/.test(ua)) os = 'ChromeOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  const m = (re: RegExp) => ua.match(re)?.[1] ?? ''
  if (/Firefox\/([\d.]+)/.test(ua)) { browser = 'Firefox'; browserVersion = m(/Firefox\/([\d.]+)/) }
  else if (/Edg\/([\d.]+)/.test(ua)) { browser = 'Edge'; browserVersion = m(/Edg\/([\d.]+)/) }
  else if (/OPR\/([\d.]+)/.test(ua)) { browser = 'Opera'; browserVersion = m(/OPR\/([\d.]+)/) }
  else if (/Vivaldi\/([\d.]+)/.test(ua)) { browser = 'Vivaldi'; browserVersion = m(/Vivaldi\/([\d.]+)/) }
  else if (/SamsungBrowser\/([\d.]+)/.test(ua)) { browser = 'Samsung Internet'; browserVersion = m(/SamsungBrowser\/([\d.]+)/) }
  else if (/Chrome\/([\d.]+)/.test(ua)) { browser = 'Chrome'; browserVersion = m(/Chrome\/([\d.]+)/) }
  else if (/Safari\/([\d.]+)/.test(ua)) { browser = 'Safari'; browserVersion = m(/Version\/([\d.]+)/) }

  return { os, browser, browserVersion, frozen }
}

function isHeadless(): boolean {
  const nav = navigator as unknown as Record<string, unknown>
  if (navigator.webdriver) return true
  if (/HeadlessChrome/.test(navigator.userAgent)) return true
  if (navigator.userAgentData?.brands.some(b => /Headless/i.test(b.brand))) return true
  if (!window.chrome && /Chrome/.test(navigator.userAgent) && !/Edg|OPR/.test(navigator.userAgent)) return true
  if (nav['__nightmare'] || nav['_selenium'] || nav['callPhantom']) return true
  return false
}

interface HighEntropy {
  platform?: string
  platformVersion?: string
  architecture?: string
  bitness?: string
  model?: string
  wow64?: boolean
  formFactors?: string[]
  fullVersionList?: { brand: string; version: string }[]
}

declare global {
  interface Navigator {
    userAgentData?: {
      brands: { brand: string; version: string }[]
      mobile: boolean
      platform: string
      getHighEntropyValues(hints: string[]): Promise<HighEntropy>
    }
    brave?: { isBrave(): Promise<boolean> }
    pdfViewerEnabled?: boolean
    globalPrivacyControl?: boolean
  }
  interface Window { chrome?: unknown }
}

// UA-CH haute entropie : la vraie version de l'OS, l'architecture CPU et le modèle d'appareil.
function osFromHints(h: HighEntropy): string | null {
  const v = h.platformVersion ?? ''
  const major = parseInt(v, 10)
  switch (h.platform) {
    case 'Windows':
      if (!v) return null
      // platformVersion ≥ 13 = Windows 11, 1–10 = Windows 10, 0 = Windows 7/8/8.1
      return major >= 13 ? 'Windows 11' : major > 0 ? 'Windows 10' : 'Windows 7/8'
    case 'macOS': return v ? `macOS ${v.replace(/\.0$/, '')}` : null
    case 'Android': return `Android ${v}${h.model ? ` · ${h.model}` : ''}`
    case 'Chrome OS': return `ChromeOS ${v}`
    case 'Linux': return 'Linux'
    default: return h.platform ? `${h.platform} ${v}`.trim() : null
  }
}

function browserFromHints(list: { brand: string; version: string }[]): string | null {
  const real = list.filter(b => !/Not.?A.?Brand|Chromium/i.test(b.brand))
  const pick = real.find(b => b.brand !== 'Google Chrome') ?? real[0]
  return pick ? `${pick.brand.replace('Microsoft ', '').replace('Google ', '')} ${pick.version}` : null
}

export function useBrowser() {
  const userAgent = ref(navigator.userAgent)
  const parsed = parseUA(navigator.userAgent)
  const detectedOS = ref(parsed.os)
  const detectedBrowser = ref(`${parsed.browser} ${parsed.browserVersion}`.trim())
  const osSource = ref<'ua' | 'ua-ch'>('ua')
  const uaFrozen = ref(parsed.frozen)
  const architecture = ref<string | null>(null)
  const deviceModel = ref<string | null>(null)
  const isBrave = ref(false)
  const language = ref(navigator.language)
  const languages = ref([...navigator.languages])
  const platform = ref(navigator.userAgentData?.platform || navigator.platform)
  const doNotTrack = ref(navigator.doNotTrack)
  const cookiesEnabled = ref(navigator.cookieEnabled)
  const headless = ref(isHeadless())

  const uad = navigator.userAgentData
  const clientHintBrands = ref<string | null>(
    uad ? uad.brands.filter(b => !/Not.?A.?Brand/i.test(b.brand)).map(b => `${b.brand} ${b.version}`).join(', ') : null
  )
  const clientHintMobile = ref<boolean | null>(uad?.mobile ?? null)
  const clientHintPlatform = ref<string | null>(uad?.platform ?? null)

  const pdfViewerEnabled = ref<boolean | null>(navigator.pdfViewerEnabled ?? null)
  const globalPrivacyControl = ref<boolean | null>(navigator.globalPrivacyControl ?? null)

  const chromeSizeW = ref(window.outerWidth - window.innerWidth)
  const chromeSizeH = ref(window.outerHeight - window.innerHeight)

  onMounted(async () => {
    chromeSizeW.value = window.outerWidth - window.innerWidth
    chromeSizeH.value = window.outerHeight - window.innerHeight

    if (uad?.getHighEntropyValues) {
      try {
        const h = await uad.getHighEntropyValues(['platformVersion', 'architecture', 'bitness', 'model', 'wow64', 'formFactors', 'fullVersionList'])
        const os = osFromHints(h)
        if (os) { detectedOS.value = os; osSource.value = 'ua-ch' }
        const br = h.fullVersionList && browserFromHints(h.fullVersionList)
        if (br) detectedBrowser.value = br
        if (h.architecture) architecture.value = `${h.architecture === 'arm' ? 'ARM' : 'x86'}${h.bitness ? ` ${h.bitness} bits` : ''}${h.wow64 ? ' (WoW64)' : ''}`
        if (h.model) deviceModel.value = h.model
      } catch { /* hints refusés */ }
    }

    // Brave se fait passer pour Chrome dans l'UA et les Client Hints, mais expose navigator.brave.
    try {
      if (await navigator.brave?.isBrave()) {
        isBrave.value = true
        detectedBrowser.value = detectedBrowser.value.replace(/^(Google )?Chrome/, 'Brave')
        if (!detectedBrowser.value.startsWith('Brave')) detectedBrowser.value = `Brave (${detectedBrowser.value})`
      }
    } catch { /* ignore */ }
  })

  return {
    userAgent, detectedOS, detectedBrowser, osSource, uaFrozen, architecture, deviceModel, isBrave,
    language, languages, platform, doNotTrack, cookiesEnabled, headless,
    clientHintBrands, clientHintMobile, clientHintPlatform,
    pdfViewerEnabled, globalPrivacyControl,
    chromeSizeW, chromeSizeH,
  }
}
