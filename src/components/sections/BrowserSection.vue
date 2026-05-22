<template>
  <div class="wrap section-wrap">
    <SectionHeader index="02" title="Navigateur & OS" />
    <div class="en-grid">
      <DataCard icon="💻" label="Navigateur & Système" sectionIdx="section 02"
        :rows="[
          { k: 'NAVIGATEUR', v: detectedBrowser },
          { k: 'OS', v: detectedOS },
          { k: 'ARCH', v: platform },
          { k: 'LANGUES', v: languagesStr },
        ]"
        inference="La combinaison <strong>navigateur + version + OS + langues</strong> est déjà rare. Trois utilisateurs sur mille partagent exactement la vôtre. L'UA est envoyé à chaque requête HTTP."
        sensitivity="high" :span="4" />

      <DataCard icon="🔒" label="Vie privée navigateur" sectionIdx="section 02"
        :rows="[
          { k: 'DO_NOT_TRACK', v: dntLabel, cls: doNotTrack === '1' ? 'warn' : '' },
          { k: 'COOKIES_ACTIVÉS', v: cookiesEnabled ? 'Oui' : 'Non' },
          { k: 'COOKIES_TIERS', v: thirdPartyBlockedLabel, cls: thirdPartyCookies === false ? 'warn' : '' },
          { k: 'NAVIGATEUR_BOT', v: headless ? 'OUI — suspect ⚠️' : 'Non détecté', cls: headless ? 'bad' : '' },
        ]"
        inference="Firefox, Safari et Brave bloquent les cookies tiers par défaut. Ce signal révèle votre navigateur <strong>sans même lire l'User-Agent</strong>."
        sensitivity="medium" :span="4" />

      <DataCard icon="🤖" label="User-Agent complet" sectionIdx="section 02"
        :rows="[{ k: 'USER_AGENT', v: userAgent, cls: 'muted' }]"
        inference="Chaîne envoyée <strong>automatiquement à chaque requête HTTP</strong>. Révèle navigateur, version majeure, moteur de rendu et OS. Impossible à masquer sans proxy."
        sensitivity="high" :span="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useBrowser } from '../../composables/useBrowser'

const { userAgent, detectedOS, detectedBrowser, language, languages, platform, doNotTrack, cookiesEnabled, thirdPartyCookies, headless } = useBrowser()

const languagesStr = computed(() => languages.value.join(', '))
const dntLabel = computed(() => doNotTrack.value === '1' ? 'Activé (ignoré par 99,9% des sites)' : doNotTrack.value === '0' ? 'Désactivé' : 'Non configuré')
const thirdPartyBlockedLabel = computed(() => {
  if (thirdPartyCookies.value === null) return '…'
  return thirdPartyCookies.value ? 'Non bloqués (Chrome/standard)' : 'Bloqués (Firefox/Safari/Brave)'
})
</script>
