<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="11" icon="📍" title="Localisation sans GPS"
        description="En croisant IP, fuseau horaire et langue, votre position approximative est déductible sans aucune permission." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DataCard icon="🗺️" label="Localisation synthétisée" :value="location" :sensitivity="locationSensitivity"
          inference="Combinaison IP + timezone + langue. Précision : ville ou arrondissement. Obtenu sans une seule permission."
          :loading="loading" />

        <DataCard icon="🎯" label="Précision atteinte" :value="precision" sensitivity="high"
          inference="Sans GPS: 5-50 km. Les zones urbaines denses (FAI avec adresses fines) peuvent descendre à 1-2 km."
          :loading="loading" />

        <DataCard icon="📡" label="Signaux croisés" :value="signals" sensitivity="medium"
          inference="La corrélation de plusieurs sources indépendantes réduit les incertitudes. Plus les sources convergent, plus la localisation est précise."
          :loading="loading" />
      </div>

      <!-- Comparaison sans/avec GPS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 bg-surface border border-border rounded-lg">
          <div class="font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-3">✓ Ce que nous avons — SANS permission</div>
          <ul class="space-y-1.5 text-sm text-text-s">
            <li class="flex items-start gap-2"><span class="text-cyan mt-0.5">→</span> Pays et région</li>
            <li class="flex items-start gap-2"><span class="text-cyan mt-0.5">→</span> Ville approximative (±20-50 km)</li>
            <li class="flex items-start gap-2"><span class="text-cyan mt-0.5">→</span> FAI et type de connexion</li>
            <li class="flex items-start gap-2"><span class="text-cyan mt-0.5">→</span> Fuseau horaire exact</li>
            <li class="flex items-start gap-2"><span class="text-cyan mt-0.5">→</span> Langue et locale système</li>
            <li class="flex items-start gap-2"><span class="text-cyan mt-0.5">→</span> IP locale (WebRTC)</li>
          </ul>
        </div>

        <div class="p-5 bg-surface border border-alert/20 rounded-lg">
          <div class="font-mono text-[10px] uppercase tracking-widest text-alert mb-3">⚠️ Ce que vous donneriez AVEC la permission GPS</div>
          <ul class="space-y-1.5 text-sm text-text-s">
            <li class="flex items-start gap-2"><span class="text-alert mt-0.5">→</span> Coordonnées GPS précises (±10 mètres)</li>
            <li class="flex items-start gap-2"><span class="text-alert mt-0.5">→</span> Rue, bâtiment, étage probable</li>
            <li class="flex items-start gap-2"><span class="text-alert mt-0.5">→</span> Historique de vos déplacements</li>
            <li class="flex items-start gap-2"><span class="text-alert mt-0.5">→</span> Lieu de vie, de travail, habitudes</li>
            <li class="flex items-start gap-2"><span class="text-alert mt-0.5">→</span> Vitesse et direction de déplacement</li>
          </ul>
        </div>
      </div>

      <div class="mt-4 p-4 border border-cyan/20 bg-cyan/5 rounded-lg font-mono text-sm text-cyan text-center">
        "Sans que vous ayez rien accepté."
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useNetwork } from '../../composables/useNetwork'
import { useTimezone } from '../../composables/useTimezone'
import type { Sensitivity } from '../../types'

const { publicIP, city, country, loading } = useNetwork()
const { timezone, locale } = useTimezone()

const location = computed(() => {
  if (loading.value) return undefined
  const parts = [city.value, country.value].filter(Boolean)
  return parts.length ? parts.join(' — ') : 'Localisation en cours...'
})

const locationSensitivity = computed<Sensitivity>(() => {
  if (city.value) return 'critical'
  if (country.value) return 'high'
  return 'medium'
})

const precision = computed(() => {
  if (loading.value) return undefined
  if (city.value) return 'Ville identifiée (±20-50 km)'
  if (country.value) return 'Pays identifié (précision régionale)'
  return 'Pays approximatif'
})

const signals = computed(() => {
  const s = []
  if (publicIP.value) s.push('IP publique')
  if (timezone.value) s.push('Fuseau IANA')
  if (locale.value) s.push('Locale système')
  if (city.value) s.push('Géo IP')
  return s.length ? s.join(' + ') : undefined
})

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
