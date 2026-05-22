<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="04" icon="🖥️" title="Écran & Matériel"
        description="La configuration matérielle de votre appareil est suffisamment unique pour réduire l'anonymat." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="📺" label="Résolution écran" :value="resolution" sensitivity="medium"
          inference="Distingue mobile, tablette, laptop, desktop. Les résolutions atypiques (ultra-wide, 4K) réduisent l'anonymat." />

        <DataCard icon="📐" label="Résolution disponible" :value="availResolution" sensitivity="low"
          inference="Surface utile après soustraction des barres d'outils OS. Révèle la configuration des moniteurs." />

        <DataCard icon="🎨" label="Profondeur couleur" :value="`${colorDepth} bits`" sensitivity="low"
          inference="Quasi-universellement 24-bit sur les appareils modernes. Une valeur différente est très identifiante." />

        <DataCard icon="✨" label="Pixel ratio (DPR)" :value="pixelRatio" sensitivity="medium"
          inference="DPR > 1 = écran Retina/HiDPI. DPR = 2 ou 3 indique Apple, Android haut de gamme ou moniteur 4K." />

        <DataCard icon="⚡" label="Cœurs CPU logiques" :value="cores" sensitivity="high"
          inference="Révèle la puissance du processeur. 2 cœurs = mobile/vieux PC, 8+ = workstation ou gaming. Contribue à l'empreinte unique." />

        <DataCard icon="🧠" label="RAM estimée" :value="memory ? `${memory} GB` : null" sensitivity="high"
          inference="Catégorise votre appareil : 4 GB (mobile/entrée de gamme), 8 GB (standard), 16+ GB (pro/gaming)." />

        <DataCard icon="🔋" label="Batterie" :value="batteryStr" sensitivity="medium"
          inference="La présence d'une batterie confirme un mobile ou laptop. Le niveau peut être utilisé pour créer un identifiant temporaire." />

        <DataCard icon="🌈" label="Support HDR (P3)" :value="hdr ? 'OUI — écran large gamme' : 'Non'" sensitivity="medium"
          inference="Les écrans P3/HDR sont haut de gamme (MacBook Pro, iPhone, moniteurs professionnels). Réduit la population anonyme." />

        <DataCard icon="🔄" label="Fréquence de rafraîchissement" :value="refreshRate ? `${refreshRate} Hz` : null" sensitivity="medium"
          inference="60 Hz (standard), 90/120/144 Hz (gaming ou téléphone haut de gamme), 240 Hz (pro gaming). Signal distinctif."
          :loading="!refreshRate" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useScreen } from '../../composables/useScreen'

const { resolution, availResolution, colorDepth, pixelRatio, cores, memory, battery, hdr, refreshRate } = useScreen()

const batteryStr = computed(() => {
  if (!battery.value) return null
  const { level, charging, dischargingTime } = battery.value
  let s = `${level}% — ${charging ? 'En charge' : 'Sur batterie'}`
  if (!charging && dischargingTime && isFinite(dischargingTime)) {
    const h = Math.floor(dischargingTime / 3600)
    const m = Math.floor((dischargingTime % 3600) / 60)
    s += ` (${h}h${m}m restant)`
  }
  return s
})

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
