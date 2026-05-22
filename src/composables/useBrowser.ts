import { ref, onMounted } from 'vue'

function parseUA(ua: string) {
  let os = 'Inconnu'
  let browser = 'Inconnu'
  let browserVersion = ''

  if (/Windows NT 10/.test(ua)) os = 'Windows 10/11'
  else if (/Windows NT 6.3/.test(ua)) os = 'Windows 8.1'
  else if (/Windows NT 6.1/.test(ua)) os = 'Windows 7'
  else if (/Mac OS X ([\d_]+)/.test(ua)) os = `macOS ${ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, '.') ?? ''}`
  else if (/Android ([\d.]+)/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ''}`
  else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${ua.match(/iPhone OS ([\d_]+)/)?.[1].replace(/_/g, '.') ?? ''}`
  else if (/Linux/.test(ua)) os = 'Linux'
  else if (/CrOS/.test(ua)) os = 'ChromeOS'

  if (/Firefox\/([\d.]+)/.test(ua)) { browser = 'Firefox'; browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '' }
  else if (/Edg\/([\d.]+)/.test(ua)) { browser = 'Edge'; browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '' }
  else if (/OPR\/([\d.]+)/.test(ua)) { browser = 'Opera'; browserVersion = ua.match(/OPR\/([\d.]+)/)?.[1] ?? '' }
  else if (/Brave/.test(ua)) { browser = 'Brave'; browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '' }
  else if (/Chrome\/([\d.]+)/.test(ua)) { browser = 'Chrome'; browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '' }
  else if (/Safari\/([\d.]+)/.test(ua)) { browser = 'Safari'; browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] ?? '' }

  return { os, browser, browserVersion }
}

function detectThirdPartyCookies(): Promise<boolean> {
  return new Promise(resolve => {
    try {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = 'about:blank'
      document.body.appendChild(iframe)
      const result = iframe.contentWindow?.navigator.cookieEnabled ?? false
      document.body.removeChild(iframe)
      resolve(result)
    } catch { resolve(false) }
  })
}

function isHeadless(): boolean {
  const nav = navigator as Record<string, unknown>
  if (navigator.webdriver) return true
  if (!window.chrome && /Chrome/.test(navigator.userAgent)) return true
  if (nav['__nightmare']) return true
  if (nav['_selenium']) return true
  if (nav['callPhantom']) return true
  return false
}

export function useBrowser() {
  const userAgent = ref(navigator.userAgent)
  const { os, browser, browserVersion } = parseUA(navigator.userAgent)
  const detectedOS = ref(os)
  const detectedBrowser = ref(`${browser} ${browserVersion}`)
  const language = ref(navigator.language)
  const languages = ref([...navigator.languages])
  const platform = ref(navigator.platform)
  const doNotTrack = ref(navigator.doNotTrack)
  const cookiesEnabled = ref(navigator.cookieEnabled)
  const thirdPartyCookies = ref<boolean | null>(null)
  const headless = ref(isHeadless())

  onMounted(async () => {
    thirdPartyCookies.value = await detectThirdPartyCookies()
  })

  return { userAgent, detectedOS, detectedBrowser, language, languages, platform, doNotTrack, cookiesEnabled, thirdPartyCookies, headless }
}
