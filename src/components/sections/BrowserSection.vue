<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="02" icon="🌐" title="Navigateur & OS"
        description="Votre navigateur envoie automatiquement des métadonnées qui révèlent votre système, vos préférences et votre comportement." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="🤖" label="User-Agent complet" :value="userAgent" sensitivity="high"
          inference="Chaîne envoyée à chaque requête HTTP. Révèle navigateur, version majeure, OS et parfois la version du moteur de rendu." />

        <DataCard icon="💻" label="Système d'exploitation" :value="detectedOS" sensitivity="high"
          inference="OS exact déduit de l'UA. Facilite le ciblage de vulnérabilités spécifiques et le profiling des appareils." />

        <DataCard icon="🌏" label="Navigateur détecté" :value="detectedBrowser" sensitivity="medium"
          inference="Navigateur et version. Chrome/Edge/Brave partagent le même UA — d'autres heuristiques les distinguent." />

        <DataCard icon="🗣️" label="Langue principale" :value="language" sensitivity="medium"
          inference="Révèle votre langue native et souvent votre pays d'origine. Utilisé pour la géolocalisation culturelle." />

        <DataCard icon="🌐" label="Langues configurées" :value="languagesStr" sensitivity="medium"
          inference="Liste complète des langues dans votre ordre de préférence. Combinaison souvent unique et identifiante." />

        <DataCard icon="🖥️" label="Plateforme" :value="platform" sensitivity="medium"
          inference="Architecture système. Distingue Intel x86, ARM, Linux 64-bit, etc. Contribue à l'empreinte unique." />

        <DataCard icon="🚫" label="Do Not Track" :value="dntLabel" sensitivity="low"
          inference="Ce paramètre n'est pas contraignant. Moins de 0.1% des sites l'honorent. Il est ignoré par quasiment tous les trackers." />

        <DataCard icon="🍪" label="Cookies activés" :value="cookiesEnabled" sensitivity="medium"
          inference="Les cookies permettent le suivi inter-sessions persistant. Désactivés = navigateur très restrictif." />

        <DataCard icon="🍪" label="Cookies tiers bloqués" :value="thirdPartyBlockedLabel" sensitivity="medium"
          inference="Firefox, Safari et Brave bloquent les cookies tiers par défaut. Ce signal révèle votre navigateur sans lire l'UA." />

        <DataCard icon="🤖" label="Navigateur headless" :value="headless ? 'OUI — comportement suspect' : 'Non détecté'" sensitivity="low"
          inference="Détecte les scripts automatisés, bots ou navigateurs de test (Selenium, Puppeteer). Utilisé pour la protection anti-bot." />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useBrowser } from '../../composables/useBrowser'

const { userAgent, detectedOS, detectedBrowser, language, languages, platform, doNotTrack, cookiesEnabled, thirdPartyCookies, headless } = useBrowser()

const languagesStr = computed(() => languages.value.join(', '))
const dntLabel = computed(() => {
  if (doNotTrack.value === '1') return 'Activé (ignoré par 99,9% des sites)'
  if (doNotTrack.value === '0') return 'Désactivé'
  return 'Non configuré'
})
const thirdPartyBlockedLabel = computed(() => {
  if (thirdPartyCookies.value === null) return undefined
  return thirdPartyCookies.value ? 'Non bloqués (Chrome/standard)' : 'Bloqués (Firefox/Safari/Brave)'
})

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
