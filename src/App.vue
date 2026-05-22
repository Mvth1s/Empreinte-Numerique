<template>
  <div>
    <!-- Curseur crosshair personnalisé -->
    <div class="crosshair" ref="crosshairEl"></div>

    <!-- Écran de chargement -->
    <Transition name="fade">
      <LoadingScreen v-if="isLoading" :progress="loadingProgress" :logs="visibleLogs" @skip="isLoading = false" />
    </Transition>

    <!-- Contenu principal -->
    <div v-if="!isLoading">
      <HeaderSection :score="traceabilityScore" :data-points="dataPoints" :sensitive-count="sensitiveCount" />

      <div class="wrap">
        <div class="en-section-title en-section-overview">
          <span class="en-section-num">// 01–11</span>
          <h3>Détail de la collecte</h3>
          <div class="en-section-rule"></div>
          <div class="en-legend">
            Sensibilité&nbsp;:
            <span class="en-legend-sw" style="background:#6cd99a"></span>FAIBLE
            <span class="en-legend-sw" style="background:var(--yellow)"></span>MOYEN
            <span class="en-legend-sw" style="background:var(--red)"></span>ÉLEVÉ
            <span class="en-legend-sw" style="background:#fff"></span>CRITIQUE
          </div>
        </div>
      </div>

      <main>
        <NetworkSection />
        <BrowserSection />
        <TimezoneSection />
        <ScreenSection />
        <GPUSection />
        <FingerprintSection />
        <StorageSection />
        <ConnectivitySection />
        <PermissionsSection />
        <BehaviorSection />
        <LocationSection />
      </main>

      <CloserSection />
      <FooterSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

import LoadingScreen from './components/LoadingScreen.vue'
import HeaderSection from './components/HeaderSection.vue'
import NetworkSection from './components/sections/NetworkSection.vue'
import BrowserSection from './components/sections/BrowserSection.vue'
import TimezoneSection from './components/sections/TimezoneSection.vue'
import ScreenSection from './components/sections/ScreenSection.vue'
import GPUSection from './components/sections/GPUSection.vue'
import FingerprintSection from './components/sections/FingerprintSection.vue'
import StorageSection from './components/sections/StorageSection.vue'
import ConnectivitySection from './components/sections/ConnectivitySection.vue'
import PermissionsSection from './components/sections/PermissionsSection.vue'
import BehaviorSection from './components/sections/BehaviorSection.vue'
import LocationSection from './components/sections/LocationSection.vue'
import CloserSection from './components/CloserSection.vue'
import FooterSection from './components/FooterSection.vue'

import { useNetwork } from './composables/useNetwork'
import { useFingerprint } from './composables/useFingerprint'
import { useScreen } from './composables/useScreen'
import { useGPU } from './composables/useGPU'

const network = useNetwork()
const fingerprint = useFingerprint()
const screen = useScreen()
const gpu = useGPU()

// Score de traçabilité 0-100
const traceabilityScore = computed(() => {
  let s = 0
  if (network.publicIP.value) s += 15
  if (network.city.value) s += 10
  if (network.localIPs.value.length) s += 15
  if (fingerprint.canvasHash.value) s += 15
  if (fingerprint.audioHash.value) s += 10
  if (gpu.renderer.value) s += 8
  if (fingerprint.detectedFonts.value.length > 5) s += 8
  s += 5  // UA/navigateur toujours dispo
  s += 5  // Fuseau toujours dispo
  s += 4  // Résolution toujours dispo
  return Math.min(s, 100)
})

const dataPoints = computed(() => {
  let n = 0
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
  n += 8
  return n
})

const sensitiveCount = computed(() => {
  let n = 0
  if (network.publicIP.value) n++
  if (network.localIPs.value.length) n++
  if (fingerprint.canvasHash.value) n++
  if (fingerprint.audioHash.value) n++
  if (gpu.renderer.value) n++
  return n
})

// Crosshair cursor
const crosshairEl = ref<HTMLElement | null>(null)

function onMouseMove(e: MouseEvent) {
  if (crosshairEl.value) {
    crosshairEl.value.style.left = e.clientX + 'px'
    crosshairEl.value.style.top = e.clientY + 'px'
  }
}

// Chargement animé
const isLoading = ref(true)
const loadingProgress = ref(0)
const allLogs = ref<{ text: string; ok?: string }[]>([])

const visibleLogs = computed(() => allLogs.value.slice(-6))

const LOG_MESSAGES: { text: string; ok?: string }[] = [
  { text: 'Initialisation du moteur d\'analyse…', ok: 'OK' },
  { text: 'Résolution IP publique via api.ipify.org…', ok: 'OK' },
  { text: 'Géolocalisation ip-api.com…', ok: 'OK' },
  { text: 'Canal WebRTC STUN: stun.google.com…', ok: 'OK' },
  { text: 'Lecture navigator.* — UA, langue, plateforme…', ok: 'OK' },
  { text: 'WEBGL_debug_renderer_info — GPU model…', ok: 'OK' },
  { text: 'Canvas fingerprint 220×60px — SHA-256…', ok: 'OK' },
  { text: 'OfflineAudioContext — oscillateur 10kHz…', ok: 'OK' },
  { text: 'Détection polices via TextMetrics (0/80)…' },
  { text: 'Détection polices (40/80)…' },
  { text: 'Détection polices (80/80) — terminé.', ok: 'OK' },
  { text: 'DoH Cloudflare: whoami.cloudflare.com TXT…', ok: 'OK' },
  { text: 'Quota localStorage / IndexedDB…', ok: 'OK' },
  { text: 'navigator.permissions.query() × 7…', ok: 'OK' },
  { text: 'Triangulation: IP + fuseau IANA + locale…', ok: 'OK' },
  { text: 'Calcul empreinte combinée SHA-256…', ok: 'OK' },
  { text: 'Calcul du score de traçabilité…', ok: 'OK' },
  { text: 'Rapport prêt.', ok: '✓' },
]

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)

  const total = LOG_MESSAGES.length
  LOG_MESSAGES.forEach((msg, i) => {
    setTimeout(() => {
      allLogs.value.push(msg)
      loadingProgress.value = Math.round(((i + 1) / total) * 100)
    }, i * 220)
  })

  setTimeout(() => {
    isLoading.value = false
  }, Math.max(total * 220 + 400, 4500))
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>
