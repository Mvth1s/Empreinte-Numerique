<template>
  <div class="wrap section-wrap">
    <SectionHeader index="04" title="Écran & Matériel" />
    <div class="en-grid">
      <DataCard icon="🖥️" label="Affichage" sectionIdx="section 04"
        :rows="[
          { k: 'RÉSOLUTION', v: resolution },
          { k: 'DISPO', v: availResolution, cls: 'muted' },
          { k: 'COULEURS', v: `${colorDepth} bits` },
          { k: 'PIXEL_RATIO', v: String(pixelRatio) },
          { k: 'HDR_P3', v: hdr ? 'OUI — large gamme' : 'Non' },
          { k: 'THÈME_OS', v: prefersColorScheme },
        ]"
        inference="Ces caractéristiques forment une signature stable. <strong>Aucune permission n'est requise</strong> pour les lire. DPR > 1 = écran Retina/HiDPI (Apple, Android premium)."
        sensitivity="medium" :span="4" />

      <DataCard icon="⚡" label="CPU & RAM" sectionIdx="section 04"
        :rows="[
          { k: 'CPU_CORES', v: cores ? String(cores) : null },
          { k: 'RAM_ESTIMÉE', v: memory ? `${memory} GB` : null },
          { k: 'TACTILE', v: touchPoints > 0 ? `OUI — ${touchPoints} points` : 'Non' },
        ]"
        inference="Révèle la <strong>puissance de votre machine</strong>. 2 cœurs = mobile/entrée de gamme, 8+ = workstation. Combiné à la RAM, catégorise précisément votre appareil."
        sensitivity="high" :span="4" />

      <DataCard icon="🔄" label="Rafraîchissement & Batterie" sectionIdx="section 04"
        :rows="[
          { k: 'REFRESH_RATE', v: refreshRate ? `${refreshRate} Hz` : '…' },
          { k: 'BATTERIE', v: batteryStr },
        ]"
        inference="60 Hz (standard), 120/144 Hz (gaming ou mobile premium). La présence d'une batterie <strong>confirme un laptop ou mobile</strong>. Son niveau peut créer un identifiant temporaire."
        sensitivity="medium" :span="4" :loading="!refreshRate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useScreen } from '../../composables/useScreen'

const { resolution, availResolution, colorDepth, pixelRatio, cores, memory, battery, hdr, prefersColorScheme, refreshRate, touchPoints } = useScreen()

const batteryStr = computed(() => {
  if (!battery.value) return 'API indisponible'
  const { level, charging, dischargingTime } = battery.value
  let s = `${level}% — ${charging ? 'En charge' : 'Sur batterie'}`
  if (!charging && dischargingTime && isFinite(dischargingTime)) {
    s += ` (${Math.floor(dischargingTime / 3600)}h${Math.floor((dischargingTime % 3600) / 60)}m restant)`
  }
  return s
})
</script>
