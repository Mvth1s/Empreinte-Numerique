<template>
  <div>
    <BackgroundCanvas :kind="bgKind" />

    <!-- Welcome modal -->
    <div :class="['welcome', { hidden: !showWelcome }]">
      <div class="welcome-inner">
        <img src="/logo.svg" alt="Empreinte Numérique" class="welcome-logo" />
        <h1>Votre empreinte numérique <em>révélée</em></h1>
        <p>Ce site collecte passivement des dizaines de données sur vous&nbsp;— sans cookies, sans permission, sans que vous ne le sachiez. Découvrez ce que chaque site web peut savoir sur vous.</p>
        <ul>
          <li><b>{{ dataPoints }}</b> points de données</li>
          <li><b>11</b> catégories</li>
          <li><b>100%</b> client-side</li>
        </ul>
        <button class="welcome-btn" @click="dismissWelcome">▶ LANCER L'ANALYSE</button>
        <p class="welcome-foot">AUCUNE DONNÉE N'EST TRANSMISE À UN SERVEUR TIERS</p>
      </div>
    </div>

    <div class="app">
      <!-- Header -->
      <header class="top">
        <div class="brand">
          <img src="/logo.svg" alt="logo" class="brand-logo" />
          <div>
            <h1>EMPREINTE NUMÉRIQUE</h1>
            <div class="tag">AUDIT DE TRAÇABILITÉ EN TEMPS RÉEL</div>
          </div>
        </div>
        <div class="top-right">
          <button class="share-btn" @click="openShare">↗ Partager</button>
          <div class="session">
            <span class="dot"></span>SESSION ACTIVE
          </div>
        </div>
      </header>

      <!-- Progress -->
      <div class="progress-wrap">
        <span class="progress-label">Progression</span>
        <div class="progress-track">
          <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
        </div>
        <span class="progress-stat">{{ seenCount }}/11</span>
      </div>

      <!-- Tab bar (desktop) -->
      <div class="tab-bar-wrap">
        <div class="tab-bar" ref="tabBarEl">
          <div class="tab-slider" ref="sliderEl"></div>
          <button
            v-for="tab in TABS"
            :key="tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
            :ref="el => tabRefs[tab.id] = el as HTMLElement"
            @click="switchTab(tab.id)"
          >
            <span class="tab-ico">{{ tab.icon }}</span>
            {{ tab.short }}
          </button>
        </div>
        <button class="mobile-btn" @click="mobileNavOpen = true">☰ Navigation</button>
      </div>

      <!-- Mobile nav -->
      <div :class="['mobile-nav', { open: mobileNavOpen }]">
        <div class="mobile-nav-head">
          <span class="lbl">SECTIONS</span>
          <button class="mobile-nav-close" @click="mobileNavOpen = false">✕</button>
        </div>
        <div class="tab-grid">
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
          @skip="skipLoad"
        />

        <div id="content" :style="{ opacity: loading ? 0 : 1 }">
          <component :is="activeComponent" />
        </div>
      </main>
    </div>

    <!-- Share modal -->
    <div :class="['share-modal', { visible: shareOpen }]">
      <div class="share-inner">
        <h2>Partager mon empreinte</h2>
        <p>Copiez ce résumé et partagez-le pour montrer ce qu'un site peut collecter passivement.</p>
        <textarea readonly :value="shareText"></textarea>
        <div class="share-actions">
          <button @click="shareOpen = false">Fermer</button>
          <button class="primary" @click="copyShare">📋 Copier</button>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div class="tip" ref="tipEl"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineAsyncComponent } from 'vue'
import BackgroundCanvas from './components/BackgroundCanvas.vue'
import LoadOverlay from './components/LoadOverlay.vue'

import { useNetwork } from './composables/useNetwork'
import { useFingerprint } from './composables/useFingerprint'
import { useScreen } from './composables/useScreen'
import { useGPU } from './composables/useGPU'

const network = useNetwork()
const fingerprint = useFingerprint()
const screen = useScreen()
const gpu = useGPU()

const dataPoints = computed(() => {
  let n = 8
  if (network.publicIP.value) n++
  if (network.city.value) n++
  if (network.isp.value) n++
  if (network.localIPs.value.length) n++
  if (fingerprint.canvasHash.value) n++
  if (fingerprint.audioHash.value) n++
  if (fingerprint.detectedFonts.value.length) n++
  if (gpu.renderer.value) n++
  if (screen.cores.value) n++
  if (screen.memory.value) n++
  return n
})

const TABS = [
  { id: 'network',      icon: '🌐', label: 'Réseau & IP',        short: 'Réseau',       loader: { kind: 'radar',       text: 'Analyse réseau' }, bg: 'radar' as const },
  { id: 'browser',      icon: '🔍', label: 'Navigateur',         short: 'Navigateur',   loader: { kind: 'terminal',    text: 'Lecture navigateur' }, bg: 'particles' as const },
  { id: 'timezone',     icon: '🕐', label: 'Fuseau horaire',     short: 'Fuseau',       loader: { kind: 'clock',       text: 'Détection fuseau' }, bg: 'particles' as const },
  { id: 'hardware',     icon: '💻', label: 'Matériel',           short: 'Matériel',     loader: { kind: 'scanner',     text: 'Scan matériel' }, bg: 'tron' as const },
  { id: 'gpu',          icon: '🎮', label: 'GPU',                short: 'GPU',          loader: { kind: 'wireframe',   text: 'Analyse GPU' }, bg: 'tron' as const },
  { id: 'fingerprint',  icon: '☠️', label: 'Empreinte',          short: 'Empreinte',    loader: { kind: 'hexrain',     text: 'Calcul empreinte' }, bg: 'hexrain' as const },
  { id: 'storage',      icon: '💾', label: 'Stockage',           short: 'Stockage',     loader: { kind: 'diskbar',     text: 'Scan stockage' }, bg: 'tron' as const },
  { id: 'connectivity', icon: '📡', label: 'Connectivité',       short: 'Réseau+',      loader: { kind: 'wifi',        text: 'Test connectivité' }, bg: 'radar' as const },
  { id: 'permissions',  icon: '🔐', label: 'Permissions',        short: 'Perms',        loader: { kind: 'permissions', text: 'Vérif. permissions' }, bg: 'particles' as const },
  { id: 'behavior',     icon: '🖱️', label: 'Comportement',       short: 'Comportement', loader: { kind: 'cursor',      text: 'Analyse comportement' }, bg: 'cursor' as const },
  { id: 'location',     icon: '📍', label: 'Localisation',       short: 'Localisation', loader: { kind: 'mapzoom',     text: 'Géolocalisation' }, bg: 'radar' as const },
]

type TabId = typeof TABS[number]['id']
type BgKind = 'particles' | 'radar' | 'hexrain' | 'tron' | 'cursor'

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
}

const activeTab = ref<TabId>('network')
const bgKind = ref<BgKind>('radar')
const loading = ref(false)
const loadKind = ref('radar')
const loadText = ref('Analyse réseau')
const showWelcome = ref(true)
const mobileNavOpen = ref(false)
const shareOpen = ref(false)
const seenTabs = ref(new Set<TabId>(['network']))

const tabBarEl = ref<HTMLElement | null>(null)
const sliderEl = ref<HTMLElement | null>(null)
const tabRefs: Record<string, HTMLElement | null> = {}
const tipEl = ref<HTMLElement | null>(null)

const seenCount = computed(() => seenTabs.value.size)
const progressPct = computed(() => (seenTabs.value.size / TABS.length) * 100)
const activeComponent = computed(() => sections[activeTab.value])

let loadTimer: ReturnType<typeof setTimeout> | null = null
const LOAD_DURATION = 2200

function dismissWelcome() {
  showWelcome.value = false
  updateSlider()
}

async function switchTab(id: TabId) {
  if (id === activeTab.value && !loading.value) return
  const tab = TABS.find(t => t.id === id)!

  activeTab.value = id
  bgKind.value = tab.bg as BgKind
  loadKind.value = tab.loader.kind
  loadText.value = tab.loader.text
  seenTabs.value = new Set([...seenTabs.value, id])

  loading.value = true
  await nextTick()
  updateSlider()

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
    '=== EMPREINTE NUMÉRIQUE ===',
    `IP publique : ${network.publicIP.value || '—'}`,
    `Localisation : ${network.city.value || '—'}, ${network.country.value || '—'}`,
    `FAI : ${network.isp.value || '—'}`,
    `Navigateur : ${navigator.userAgent.slice(0, 80)}`,
    `Écran : ${screen.resolution.value || '—'}`,
    `GPU : ${gpu.renderer.value || '—'}`,
    `Canvas hash : ${fingerprint.canvasHash.value?.slice(0, 16) || '—'}`,
    `Audio hash : ${fingerprint.audioHash.value?.slice(0, 16) || '—'}`,
    `Polices détectées : ${fingerprint.detectedFonts.value.length}`,
    '',
    'Généré par empreinte-numerique.fr',
  ]
  return lines.join('\n')
})

function openShare() { shareOpen.value = true }

function copyShare() {
  navigator.clipboard.writeText(shareText.value).catch(() => {})
}

/* ---- Tooltip ---- */
onMounted(() => {
  document.addEventListener('mouseover', (e) => {
    const el = (e.target as HTMLElement).closest('[title]') as HTMLElement | null
    if (!el || !tipEl.value) return
    tipEl.value.textContent = el.title
    tipEl.value.classList.add('show')
  })
  document.addEventListener('mouseout', () => {
    tipEl.value?.classList.remove('show')
  })
  document.addEventListener('mousemove', (e) => {
    if (tipEl.value) {
      tipEl.value.style.left = e.clientX + 'px'
      tipEl.value.style.top = (e.clientY - 8) + 'px'
    }
  })

  updateSlider()
})
</script>
