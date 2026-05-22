<template>
  <div>
    <!-- Écran de chargement -->
    <Transition name="fade">
      <LoadingScreen v-if="isLoading" :progress="loadingProgress" :logs="loadingLogs" />
    </Transition>

    <!-- Contenu principal -->
    <div v-if="!isLoading">
      <HeaderSection :score="traceabilityScore" :items-count="itemsCount" />

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

      <FooterSection />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
import FooterSection from './components/FooterSection.vue'

import { useNetwork } from './composables/useNetwork'
import { useFingerprint } from './composables/useFingerprint'
import { useScreen } from './composables/useScreen'
import { useGPU } from './composables/useGPU'

// Données utilisées pour le score global
const network = useNetwork()
const fingerprint = useFingerprint()
const screen = useScreen()
const gpu = useGPU()

// Score de traçabilité (0-100)
const traceabilityScore = computed(() => {
  let s = 0
  if (network.publicIP.value) s += 15         // IP publique
  if (network.city.value) s += 10             // Géolocalisation ville
  if (network.localIPs.value.length) s += 15  // Fuite WebRTC
  if (fingerprint.canvasHash.value) s += 15   // Canvas fingerprint
  if (fingerprint.audioHash.value) s += 10    // Audio fingerprint
  if (gpu.renderer.value) s += 8              // GPU exact
  if (fingerprint.detectedFonts.value.length > 5) s += 8  // Polices
  s += 5   // Navigateur/UA toujours disponible
  s += 5   // Fuseau horaire toujours disponible
  s += 4   // Résolution/écran toujours disponible
  return Math.min(s, 100)
})

const itemsCount = computed(() => {
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
  n += 8 // signaux browser/timezone/storage toujours dispo
  return n
})

// Chargement avec logs animés
const isLoading = ref(true)
const loadingProgress = ref(0)
const loadingLogs = ref<string[]>([])

const LOG_MESSAGES = [
  '[SYS] Initialisation du moteur d\'analyse...',
  '[NET] Résolution de l\'adresse IP publique via api.ipify.org...',
  '[NET] Interrogation du service de géolocalisation ip-api.com...',
  '[RTC] Ouverture du canal WebRTC peer-to-peer (STUN: stun.google.com)...',
  '[SYS] Lecture des paramètres navigator.* du navigateur...',
  '[GPU] Interrogation WEBGL_debug_renderer_info...',
  '[FPR] Initialisation du canvas de fingerprinting (220×60px)...',
  '[AUD] Création OfflineAudioContext — traitement oscillateur triangle 10kHz...',
  '[FNT] Détection des polices installées via TextMetrics canvas (0/80)...',
  '[FNT] Détection des polices installées (40/80)...',
  '[FNT] Détection des polices installées (80/80) — analyse terminée.',
  '[DNS] Requête DoH Cloudflare: whoami.cloudflare.com TXT...',
  '[STO] Analyse quota localStorage / IndexedDB...',
  '[PRM] navigator.permissions.query() × 7 permissions...',
  '[GEO] Triangulation: IP + fuseau IANA + locale système...',
  '[FPR] Calcul SHA-256 de l\'empreinte combinée...',
  '[SYS] Calcul du score de traçabilité...',
  '[SYS] ✓ Rapport prêt.',
]

onMounted(() => {
  const total = LOG_MESSAGES.length
  LOG_MESSAGES.forEach((msg, i) => {
    setTimeout(() => {
      loadingLogs.value.push(msg)
      loadingProgress.value = Math.round(((i + 1) / total) * 100)
    }, i * 230)
  })

  // Durée minimale de 4,5s pour l'effet dramatique
  setTimeout(() => {
    isLoading.value = false
  }, Math.max(total * 230 + 400, 4500))
})
</script>
