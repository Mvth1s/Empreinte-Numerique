<template>
  <div>
    <BackgroundCanvas :kind="bgKind" />

    <!-- Welcome modal -->
    <div :class="['welcome', { hidden: !showWelcome }]" id="welcome">
      <div class="welcome-inner">
        <img src="/logo.png" alt="Empreinte Numérique" class="welcome-logo" />
        <h1>Vous pensez être <em>anonyme</em>.<br/>Ce site sait déjà beaucoup sur vous.</h1>
        <p>
          Sans cookie, sans login, sans la moindre autorisation, un site web peut reconstruire votre identité technique en moins de deux secondes. Cette démo vous montre <strong style="color:var(--fg)">tout ce qu'il découvre</strong>, en langage clair.
        </p>
        <ul>
          <li><b>12</b>catégories</li>
          <li><b>~140</b>signaux</li>
          <li><b>0</b>permission</li>
        </ul>
        <button class="welcome-btn" @click="dismissWelcome">▸ Lancer l'analyse</button>
        <div class="welcome-foot">Projet éducatif · open-source · aucune donnée n'est envoyée</div>
      </div>
    </div>

    <div class="app">
      <!-- Header -->
      <header class="top">
        <div class="brand">
          <img src="/logo.png" alt="logo" class="brand-logo" />
          <div>
            <h1>EMPREINTE NUMÉRIQUE</h1>
            <div class="tag">Ce que chaque site sait sur vous</div>
          </div>
        </div>
        <div class="top-right">
          <button class="mobile-btn" @click="mobileNavOpen = true" aria-label="Ouvrir le menu">☰ Catégories</button>
          <div class="trace-score">
            <div class="ts-bar"><div class="ts-fill" :style="{ width: traceScore + '%', background: scoreColor }"></div></div>
            <div class="ts-meta">
              <span :style="{ color: scoreColor }">{{ traceScore }}<small>/100</small></span>
              <span class="ts-lbl">Traçabilité</span>
            </div>
          </div>
          <button class="share-btn" @click="openShare">📤 Partager</button>
          <div class="session">
            <div><span class="dot"></span>SESSION ACTIVE</div>
            <div style="opacity:.6">{{ sessionDate }}</div>
          </div>
        </div>
      </header>

      <!-- Progress -->
      <div class="progress-wrap">
        <span class="progress-label">Collecte</span>
        <div class="progress-track">
          <div class="progress-bar" id="global-progress" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="progress-stat" id="progress-label">{{ seenCount }} / 12 catégories explorées</span>
      </div>

      <!-- Tab bar (desktop) -->
      <div class="tab-bar-wrap" role="tablist">
        <div class="tab-bar" id="tab-bar" ref="tabBarEl">
          <div class="tab-slider" id="tab-slider" ref="sliderEl" aria-hidden="true"></div>
          <button
            v-for="tab in TABS"
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            :ref="el => { if (el) tabRefs[tab.id] = el as HTMLElement }"
            @click="switchTab(tab.id)"
          >
            <span class="tab-ico">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.short }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <div :class="['mobile-nav', { open: mobileNavOpen }]" id="mobile-nav">
        <div class="mobile-nav-head">
          <span class="lbl">// Choisir une catégorie</span>
          <button class="mobile-nav-close" id="mobile-close" @click="mobileNavOpen = false" aria-label="Fermer">×</button>
        </div>
        <div class="tab-grid" id="tab-grid">
          <div
            v-for="tab in TABS"
            :key="tab.id"
            :class="['tab-cell', { active: activeTab === tab.id }]"
            @click="switchTab(tab.id); mobileNavOpen = false"
          >
            <span class="ico">{{ tab.icon }}</span>
            <span class="lbl">{{ tab.short }}</span>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <main class="main">
        <LoadOverlay
          :visible="loading"
          :kind="loadKind"
          :text="loadText"
          :loader-data="loaderData"
          @skip="skipLoad"
        />

        <div id="content" :style="{ opacity: loading ? 0 : 1 }">
          <component :is="activeComponent" v-if="!showWelcome" />
          <div v-else class="empty-state" style="text-align:center; padding: 80px 20px; color: var(--mute);">
            <div style="font-family: var(--mono); font-size: 12px; letter-spacing: .25em; text-transform: uppercase;">
              Choisissez une catégorie ci-dessus pour commencer
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Share modal -->
    <div :class="['share-modal', { visible: shareOpen }]" id="share-modal" role="dialog" aria-modal="true" @click.self="shareOpen = false">
      <div class="share-inner">
        <h2>Partager mon résultat</h2>
        <p>Un résumé textuel non sensible — copiez-le où vous voulez (Mastodon, mail, conversation…).</p>
        <textarea id="share-text" readonly :value="shareText"></textarea>
        <div class="share-actions">
          <button id="share-close" @click="shareOpen = false">Fermer</button>
          <button id="share-copy" class="primary" @click="copyShare">{{ copyLabel }}</button>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div class="tip" ref="tipEl"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, defineAsyncComponent } from 'vue'
import BackgroundCanvas from './components/BackgroundCanvas.vue'
import LoadOverlay from './components/LoadOverlay.vue'

import { useNetwork } from './composables/useNetwork'
import { useFingerprint } from './composables/useFingerprint'
import { useScreen } from './composables/useScreen'
import { useGPU } from './composables/useGPU'
import { useConnectivity } from './composables/useConnectivity'

const network = useNetwork()
const fingerprint = useFingerprint()
const screen = useScreen()
const gpu = useGPU()
const conn = useConnectivity()

const TABS = [
  { id: 'network',      icon: '🌐', label: 'Réseau & IP',        short: 'Réseau',        loader: { kind: 'radar',       text: 'Localisation de votre IP en cours' },     bg: 'radar' as const },
  { id: 'browser',      icon: '🖥️', label: 'Navigateur & OS',    short: 'Navigateur',    loader: { kind: 'terminal',    text: 'Lecture de votre navigateur' },            bg: 'flow' as const },
  { id: 'timezone',     icon: '🕐', label: 'Fuseau horaire',      short: 'Fuseau',        loader: { kind: 'clock',       text: 'Détection de votre position temporelle' }, bg: 'clock' as const },
  { id: 'hardware',     icon: '💻', label: 'Écran & Matériel',    short: 'Matériel',      loader: { kind: 'scanner',     text: 'Analyse de votre matériel' },              bg: 'scan' as const },
  { id: 'gpu',          icon: '🎮', label: 'GPU & Rendu',         short: 'GPU',           loader: { kind: 'wireframe',   text: 'Interrogation de votre GPU' },             bg: 'tron' as const },
  { id: 'fingerprint',  icon: '🖐️', label: 'Fingerprinting',      short: 'Empreinte',     loader: { kind: 'hexrain',     text: 'Calcul de votre empreinte unique' },       bg: 'hexrain' as const },
  { id: 'storage',      icon: '💾', label: 'Stockage',            short: 'Stockage',      loader: { kind: 'diskbar',     text: 'Inspection du stockage local' },           bg: 'blocks' as const },
  { id: 'connectivity', icon: '📡', label: 'Connectivité',        short: 'Connexion',     loader: { kind: 'wifi',        text: 'Test de votre connexion' },                bg: 'wave' as const },
  { id: 'permissions',  icon: '🔐', label: 'Permissions',         short: 'Permissions',   loader: { kind: 'permissions', text: 'Vérification de vos permissions' },        bg: 'rings' as const },
  { id: 'behavior',     icon: '🖱️', label: 'Comportement',        short: 'Comportement',  loader: { kind: 'cursor',      text: 'Observation de votre comportement' },      bg: 'cursor' as const },
  { id: 'location',     icon: '📍', label: 'Localisation',        short: 'Localisation',  loader: { kind: 'mapzoom',     text: 'Triangulation de votre position' },        bg: 'map' as const },
  { id: 'conclusion',   icon: '🛡️', label: 'Se protéger',         short: 'Protection',    loader: { kind: 'shield',      text: 'Analyse de vos protections' },             bg: 'particles' as const },
]

type TabId = typeof TABS[number]['id']
type BgKind = 'particles' | 'radar' | 'hexrain' | 'tron' | 'cursor' | 'terminal' | 'clock' | 'scan' | 'blocks' | 'wave' | 'rings' | 'map' | 'flow'

const sections: Record<TabId, ReturnType<typeof defineAsyncComponent>> = {
  network:      defineAsyncComponent(() => import('./components/sections/NetworkSection.vue')),
  browser:      defineAsyncComponent(() => import('./components/sections/BrowserSection.vue')),
  timezone:     defineAsyncComponent(() => import('./components/sections/TimezoneSection.vue')),
  hardware:     defineAsyncComponent(() => import('./components/sections/ScreenSection.vue')),
  gpu:          defineAsyncComponent(() => import('./components/sections/GPUSection.vue')),
  fingerprint:  defineAsyncComponent(() => import('./components/sections/FingerprintSection.vue')),
  storage:      defineAsyncComponent(() => import('./components/sections/StorageSection.vue')),
  connectivity: defineAsyncComponent(() => import('./components/sections/ConnectivitySection.vue')),
  permissions:  defineAsyncComponent(() => import('./components/sections/PermissionsSection.vue')),
  behavior:     defineAsyncComponent(() => import('./components/sections/BehaviorSection.vue')),
  location:     defineAsyncComponent(() => import('./components/sections/LocationSection.vue')),
  conclusion:   defineAsyncComponent(() => import('./components/sections/ConclusionSection.vue')),
}

const activeTab = ref<TabId>('network')
const bgKind = ref<BgKind>('particles')
const loading = ref(false)
const loadKind = ref('radar')
const loadText = ref('')
const showWelcome = ref(true)
const mobileNavOpen = ref(false)
const shareOpen = ref(false)
const seenTabs = ref(new Set<TabId>())
const copyLabel = ref('📋 Copier')

const tabBarEl = ref<HTMLElement | null>(null)
const sliderEl = ref<HTMLElement | null>(null)
const tabRefs: Record<string, HTMLElement | null> = {}
const tipEl = ref<HTMLElement | null>(null)

const seenCount = computed(() => seenTabs.value.size)
const progressPct = computed(() => (seenTabs.value.size / TABS.length) * 100)

const activeComponent = computed(() => sections[activeTab.value])

const traceScore = computed(() => {
  let s = 20 // UA, écran, navigateur, timezone — toujours lisibles sans permission
  if (network.publicIP.value) s += 15
  if (network.city.value) s += 10
  if (network.localIPs.value.length > 0) s += 15
  if (fingerprint.canvasHash.value) s += 15
  if (fingerprint.audioHash.value) s += 10
  if (gpu.renderer.value) s += 8
  if (fingerprint.detectedFonts.value.length > 5) s += 7
  return Math.min(s, 100)
})
const scoreColor = computed(() => {
  const s = traceScore.value
  if (s >= 80) return 'var(--red)'
  if (s >= 50) return 'var(--yellow)'
  return 'var(--green)'
})

const sessionDate = computed(() => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const months = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC']
  const month = months[now.getMonth()]
  const year = now.getFullYear()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} · ${h}:${m} UTC`
})

let loadTimer: ReturnType<typeof setTimeout> | null = null
const LOAD_DURATION = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 2800

const loaderData = computed((): Record<string, string> => {
  const off = -new Date().getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0')
  const mm = String(Math.abs(off) % 60).padStart(2, '0')
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const ua = navigator.userAgent
  return {
    ip: network.publicIP.value ?? '…',
    cityCountry: `${network.city.value ?? '…'} · ${network.country.value ?? '…'}`,
    country: network.country.value ?? '…',
    city: network.city.value ?? '…',
    isp: network.isp.value ?? '…',
    tz: `${tz} · UTC ${sign}${hh}:${mm}`,
    screen: screen.resolution.value ?? '…',
    dpr: String(screen.pixelRatio.value ?? '…'),
    colorDepth: `${screen.colorDepth.value ?? '…'} bits`,
    touch: screen.touchPoints.value === 0 ? 'non' : String(screen.touchPoints.value),
    cores: screen.cores.value ? `${screen.cores.value} cœurs` : 'N/A',
    ram: screen.memory.value ? `${screen.memory.value} Go` : 'N/A',
    gpu: gpu.renderer.value ?? 'N/A',
    glVersion: gpu.webgl2.value ? 'WebGL 2.0' : 'WebGL 1.0',
    glVendor: gpu.vendor.value ?? 'ANGLE',
    glRenderer: gpu.renderer.value ?? '…',
    connType: conn.effectiveType.value ?? conn.connectionType.value ?? '4G',
    rtt: conn.rtt.value !== null ? `${conn.rtt.value} ms` : '…',
    downlink: conn.downlink.value !== null ? `${conn.downlink.value} Mbps` : '…',
    ua: ua.length > 55 ? ua.slice(0, 52) + '…' : ua,
    platform: navigator.platform,
    languages: navigator.languages?.join(', ') ?? navigator.language,
    concurrency: String(navigator.hardwareConcurrency ?? 'N/A'),
    deviceMemory: String((navigator as { deviceMemory?: number }).deviceMemory ?? 'N/A'),
    cookies: String(navigator.cookieEnabled),
    touch2: String(navigator.maxTouchPoints),
    dnt: navigator.doNotTrack ?? 'null',
    screenRes: `${window.screen.width} × ${window.screen.height}`,
    screenColor: String(window.screen.colorDepth),
    plugins: String(navigator.plugins?.length ?? 0),
  }
})

function dismissWelcome() {
  showWelcome.value = false
  switchTab('network', true)
}

async function switchTab(id: TabId, force = false) {
  if (!force && id === activeTab.value && !showWelcome.value && !loading.value) return
  const tab = TABS.find(t => t.id === id)!

  activeTab.value = id
  bgKind.value = tab.bg as BgKind
  loadKind.value = tab.loader.kind
  loadText.value = tab.loader.text
  seenTabs.value = new Set([...seenTabs.value, id])

  loading.value = true
  await nextTick()
  updateSlider()

  // Scroll active tab into view on mobile
  const activeBtn = tabRefs[id]
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })

  if (loadTimer) clearTimeout(loadTimer)
  loadTimer = setTimeout(() => { loading.value = false }, LOAD_DURATION)
}

function skipLoad() {
  if (loadTimer) clearTimeout(loadTimer)
  loading.value = false
}

function updateSlider() {
  nextTick(() => {
    const el = tabRefs[activeTab.value]
    const slider = sliderEl.value
    if (!el || !slider) return
    slider.style.transform = `translateX(${el.offsetLeft}px)`
    slider.style.width = `${el.offsetWidth}px`
  })
}

/* ---- Share modal ---- */
const shareText = computed(() => {
  const lines = [
    '🔍 EMPREINTE NUMÉRIQUE — résultat de mon analyse',
    '',
    '8 personnes sur 10 peuvent être identifiées avec ce profil.',
    '',
    `🌐 Navigateur   : ${navigator.userAgent.slice(0, 60)}`,
    `🕐 Fuseau       : ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `📱 Matériel     : ${screen.cores.value ?? '?'} cœurs · ${screen.memory.value ?? '?'} Go · ${screen.resolution.value}`,
    `🎮 GPU          : ${gpu.renderer.value ?? '—'}`,
    `📡 IP publique  : ${network.publicIP.value ?? '—'}`,
    `📍 Localisation : ${network.city.value ?? '—'}, ${network.country.value ?? '—'}`,
    `🖐️ Empreinte    : ${fingerprint.combinedHash.value ?? '—'}`,
    '',
    'Toutes ces données ont été collectées sans aucune permission.',
    '→ empreinte-numerique.fr'
  ]
  return lines.join('\n')
})

function openShare() { shareOpen.value = true }

function copyShare() {
  navigator.clipboard?.writeText(shareText.value)
  copyLabel.value = '✓ Copié'
  setTimeout(() => { copyLabel.value = '📋 Copier' }, 1500)
}

/* ---- Scroll lock during loading ---- */
watch(loading, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

/* ---- Tooltip ---- */
onMounted(() => {
  window.addEventListener('resize', updateSlider)

  document.addEventListener('mouseover', (e) => {
    const el = (e.target as HTMLElement).closest('[data-tip]') as HTMLElement | null
    if (!el || !tipEl.value) return
    const r = el.getBoundingClientRect()
    tipEl.value.textContent = el.dataset.tip ?? ''
    tipEl.value.style.left = (r.left + r.width / 2) + 'px'
    tipEl.value.style.top = (r.top - 8) + 'px'
    tipEl.value.classList.add('show')
  })
  document.addEventListener('mouseout', () => {
    tipEl.value?.classList.remove('show')
  })
})
</script>
