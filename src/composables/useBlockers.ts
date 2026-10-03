import { ref, computed, onMounted } from 'vue'

// Classes et ids présents dans les listes de filtrage génériques (EasyList, uBlock filters, AdGuard Base).
export const BAIT_CLASSES = 'adsbox ad-banner ad-placeholder adsbygoogle pub_300x250 pub_728x90 text-ad textAd banner_ad sponsored-ad'

export const AD_TEST_TARGETS = [
  { name: 'Google AdSense', kind: 'pub', url: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' },
  { name: 'Google Ad Manager', kind: 'pub', url: 'https://securepubads.g.doubleclick.net/tag/js/gpt.js' },
  { name: 'Amazon Ads', kind: 'pub', url: 'https://c.amazon-adsystem.com/aax2/apstag.js' },
  { name: 'Criteo', kind: 'pub', url: 'https://static.criteo.net/js/ld/publishertag.js' },
  { name: 'Taboola', kind: 'pub', url: 'https://cdn.taboola.com/libtrc/loader.js' },
  { name: 'Google Analytics', kind: 'traceur', url: 'https://www.google-analytics.com/analytics.js' },
  { name: 'Meta Pixel', kind: 'traceur', url: 'https://connect.facebook.net/en_US/fbevents.js' },
  { name: 'Hotjar', kind: 'traceur', url: 'https://static.hotjar.com/c/hotjar-0.js' },
] as const

// Témoin : domaine neutre, jamais filtré. S'il échoue aussi, on est hors ligne et le test n'est pas concluant.
const CONTROL_URL = 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.21/vue.global.prod.min.js'

export interface BlockTestResult { name: string; kind: string; blocked: boolean; ms: number }

let _cosmeticPromise: Promise<boolean> | null = null
let _networkPromise: Promise<{ control: boolean; results: BlockTestResult[] }> | null = null

function testNetwork() {
  if (_networkPromise) return _networkPromise
  _networkPromise = Promise.all([probe(CONTROL_URL), ...AD_TEST_TARGETS.map(t => probe(t.url))]).then(([control, ...probes]) => ({
    control: control.ok,
    results: AD_TEST_TARGETS.map((t, i) => ({ name: t.name, kind: t.kind, blocked: !probes[i].ok, ms: probes[i].ms })),
  }))
  return _networkPromise
}

function isHidden(el: HTMLElement): boolean {
  if (!el.isConnected) return true
  const cs = getComputedStyle(el)
  return el.offsetHeight === 0 || el.offsetParent === null || cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0'
}

// Un leurre hors écran porteur de classes "publicitaires" : un filtre cosmétique le masque ou le supprime.
function testCosmetic(): Promise<boolean> {
  if (_cosmeticPromise) return _cosmeticPromise
  _cosmeticPromise = new Promise(resolve => {
    const bait = document.createElement('div')
    bait.className = BAIT_CLASSES
    bait.id = 'ad_banner_bait'
    bait.setAttribute('aria-hidden', 'true')
    bait.style.cssText = 'position:absolute;left:-10000px;top:-10000px;width:300px;height:250px;'
    bait.textContent = '\u00a0'
    document.body.appendChild(bait)
    // Les bloqueurs appliquent leurs filtres génériques de façon asynchrone (MutationObserver).
    setTimeout(() => {
      const hidden = isHidden(bait)
      bait.remove()
      resolve(hidden)
    }, 1200)
  })
  return _cosmeticPromise
}

async function probe(url: string): Promise<{ ok: boolean; ms: number }> {
  const t0 = performance.now()
  try {
    await fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(6000) })
    return { ok: true, ms: Math.round(performance.now() - t0) }
  } catch {
    return { ok: false, ms: Math.round(performance.now() - t0) }
  }
}

export function useBlockers() {
  const cosmeticBlocked = ref<boolean | null>(null)
  const isBrave = ref(false)
  const networkResults = ref<BlockTestResult[]>([])
  const networkTesting = ref(false)
  const networkInconclusive = ref(false)

  const networkBlocked = computed(() => networkResults.value.length ? networkResults.value.filter(r => r.blocked).length : null)

  const verdict = computed(() => {
    const cos = cosmeticBlocked.value
    const net = networkBlocked.value
    if (cos === null) return 'Analyse…'
    if (cos && net) return 'Bloqueur complet actif (filtres cosmétiques + réseau)'
    if (cos && net === 0) return 'Filtrage cosmétique uniquement'
    if (cos) return 'Bloqueur de publicité détecté'
    if (net) return isBrave.value ? 'Brave Shields : blocage réseau' : 'Blocage réseau (DNS filtrant ou protection du navigateur)'
    if (net === 0) return 'Aucun bloqueur détecté'
    return isBrave.value ? 'Aucun filtre cosmétique (Brave Shields ?)' : 'Aucun filtre cosmétique détecté'
  })

  // Lancé automatiquement : contacte les serveurs publicitaires listés (sans cookie), qui voient alors l'IP du visiteur.
  async function runNetworkTest(force = false) {
    if (networkTesting.value) return
    networkTesting.value = true
    if (force) _networkPromise = null
    const r = await testNetwork()
    networkInconclusive.value = !r.control
    networkResults.value = r.results
    networkTesting.value = false
  }

  onMounted(async () => {
    runNetworkTest()
    try { isBrave.value = !!(await navigator.brave?.isBrave()) } catch { /* ignore */ }
    cosmeticBlocked.value = await testCosmetic()
  })

  return { cosmeticBlocked, isBrave, networkResults, networkBlocked, networkTesting, networkInconclusive, verdict, runNetworkTest, isHidden }
}
