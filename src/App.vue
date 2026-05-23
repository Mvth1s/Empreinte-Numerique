<template>
  <div>
    <BackgroundCanvas :kind="bgKind" />

    <!-- Welcome modal -->
    <div :class="['welcome', { hidden: !showWelcome }]" id="welcome">
      <div class="welcome-inner">
        <img src="/logo.svg" alt="Empreinte Numérique" class="welcome-logo" />
        <h1>Vous pensez être <em>anonyme</em>.<br/>Ce site sait déjà beaucoup sur vous.</h1>
        <p>
          Sans cookie, sans login, sans la moindre autorisation, un site web peut reconstruire votre identité technique en moins de deux secondes. Cette démo vous montre <strong style="color:var(--fg)">tout ce qu'il découvre</strong>, en langage clair.
        </p>
        <ul>
          <li><b>11</b>catégories</li>
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
          <img src="/logo.svg" alt="logo" class="brand-logo" />
          <div>
            <h1>EMPREINTE NUMÉRIQUE</h1>
            <div class="tag">Ce que chaque site sait sur vous</div>
          </div>
        </div>
        <div class="top-right">
          <button class="mobile-btn" @click="mobileNavOpen = true" aria-label="Ouvrir le menu">☰ Catégories</button>
          <button class="share-btn" @click="openShare">📤 Partager mon résultat</button>
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
        <span class="progress-stat" id="progress-label">{{ seenCount }} / 11 catégories explorées</span>
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

const TABS = [
  { id: 'network',      icon: '🌐', label: 'Réseau & IP',        short: 'Réseau',        loader: { kind: 'radar',       text: 'Localisation de votre IP en cours' },     bg: 'radar' as const },
  { id: 'browser',      icon: '🖥️', label: 'Navigateur & OS',    short: 'Navigateur',    loader: { kind: 'terminal',    text: 'Lecture de votre navigateur' },            bg: 'particles' as const },
  { id: 'timezone',     icon: '🕐', label: 'Fuseau horaire',      short: 'Fuseau',        loader: { kind: 'clock',       text: 'Détection de votre position temporelle' }, bg: 'particles' as const },
  { id: 'hardware',     icon: '📱', label: 'Écran & Matériel',    short: 'Matériel',      loader: { kind: 'scanner',     text: 'Analyse de votre matériel' },              bg: 'particles' as const },
  { id: 'gpu',          icon: '🎮', label: 'GPU & Rendu',         short: 'GPU',           loader: { kind: 'wireframe',   text: 'Interrogation de votre GPU' },             bg: 'tron' as const },
  { id: 'fingerprint',  icon: '🔑', label: 'Fingerprinting',      short: 'Empreinte',     loader: { kind: 'hexrain',     text: 'Calcul de votre empreinte unique' },       bg: 'hexrain' as const },
  { id: 'storage',      icon: '💾', label: 'Stockage',            short: 'Stockage',      loader: { kind: 'diskbar',     text: 'Inspection du stockage local' },           bg: 'particles' as const },
  { id: 'connectivity', icon: '📡', label: 'Connectivité',        short: 'Connexion',     loader: { kind: 'wifi',        text: 'Test de votre connexion' },                bg: 'particles' as const },
  { id: 'permissions',  icon: '🎙️', label: 'Permissions',         short: 'Permissions',   loader: { kind: 'permissions', text: 'Vérification de vos permissions' },        bg: 'particles' as const },
  { id: 'behavior',     icon: '🖱️', label: 'Comportement',        short: 'Comportement',  loader: { kind: 'cursor',      text: 'Observation de votre comportement' },      bg: 'cursor' as const },
  { id: 'location',     icon: '📍', label: 'Localisation',        short: 'Localisation',  loader: { kind: 'mapzoom',     text: 'Triangulation de votre position' },        bg: 'particles' as const },
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

function dismissWelcome() {
  showWelcome.value = false
  switchTab('network')
}

async function switchTab(id: TabId) {
  if (id === activeTab.value && !showWelcome.value && !loading.value) return
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
    `🔑 Empreinte    : ${fingerprint.combinedHash.value ?? '—'}`,
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
