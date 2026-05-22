<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="03" icon="🕐" title="Fuseau horaire & Locale"
        description="La combinaison fuseau + langue + format est un identifiant géographique très précis." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="🗺️" label="Fuseau horaire (IANA)" :value="timezone" sensitivity="high"
          inference="Identifie votre fuseau précis (Europe/Paris, America/New_York…). Couplé à la langue, il géolocalise avec une précision élevée." />

        <DataCard icon="⏱️" label="Offset UTC" :value="utcOffset" sensitivity="medium"
          inference="Confirme le fuseau horaire et limite les zones possibles. Utilisé en corrélation avec l'IP et la langue." />

        <DataCard icon="🕒" label="Heure locale exacte" :value="localTime" sensitivity="medium"
          inference="Votre heure actuelle, calculée côté client. Révèle si vous êtes connecté la nuit, révélateur de comportement." />

        <DataCard icon="☀️" label="Heure d'été (DST)" :value="isDST ? 'Active (heure d\'été)' : 'Inactive (heure standard)'" sensitivity="low"
          inference="L'état DST précise la période de l'année et confirme le fuseau. Réduit encore le nombre de pays possibles." />

        <DataCard icon="🌐" label="Locale système" :value="locale" sensitivity="high"
          inference="fr-FR ≠ fr-CA ≠ fr-BE. La locale révèle la langue ET le pays probable avec grande précision." />

        <DataCard icon="📅" label="Format de date" :value="dateFormat" sensitivity="medium"
          inference="DD/MM/YYYY vs MM/DD/YYYY vs YYYY-MM-DD. Varie selon l'OS, la région et les préférences système." />

        <DataCard icon="🔢" label="Format des nombres" :value="numberFormat" sensitivity="medium"
          inference="1.234,56 (Europe) vs 1,234.56 (USA): révèle la région linguistique de façon fiable et indépendante de l'UA." />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useTimezone } from '../../composables/useTimezone'

const { timezone, locale, utcOffset, isDST, localTime, dateFormat, numberFormat } = useTimezone()

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
