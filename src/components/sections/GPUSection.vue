<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="05" icon="🎮" title="GPU & Rendu"
        description="Le GPU révèle votre matériel exact et produit un rendu légèrement différent selon le driver — un identifiant unique." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="🏭" label="Constructeur GPU (non masqué)" :value="vendor" sensitivity="high"
          inference="NVIDIA, AMD, Intel, Apple Silicon, Qualcomm. Révèle la gamme et la génération de votre matériel."
          :loading="!vendor" />

        <DataCard icon="💎" label="Modèle GPU exact" :value="renderer" sensitivity="critical"
          inference="Le modèle précis (ex: 'NVIDIA GeForce RTX 4070 Ti') est souvent unique combiné aux autres signaux. Non masqué par défaut dans Chrome."
          :loading="!renderer" />

        <DataCard icon="🎲" label="Empreinte de rendu WebGL" :value="renderHash" sensitivity="critical"
          inference="Un triangle 3D rendu produit des pixels légèrement différents selon votre GPU, driver et OS. Ce hash est votre signature graphique."
          :loading="!renderHash" />

        <DataCard icon="⚡" label="WebGL 2.0 supporté" :value="webgl2 ? 'OUI' : 'Non'" sensitivity="low"
          inference="WebGL 2 est disponible sur les navigateurs modernes. Son absence indique un navigateur très ancien ou des restrictions système." />

        <DataCard icon="🚀" label="WebGPU supporté" :value="webgpu ? 'OUI — API next-gen' : 'Non disponible'" sensitivity="low"
          inference="WebGPU est l'API graphique de nouvelle génération. Disponible dans Chrome 113+ et Safari 17+. Indique un navigateur récent." />

        <DataCard icon="🗜️" label="Formats de texture supportés" :value="formatsStr" sensitivity="medium"
          inference="La combinaison de formats de compression (S3TC, ETC, ASTC, PVRTC) est spécifique au matériel. ASTC = mobile ARM, S3TC = desktop."
          :loading="!formatsStr" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useGPU } from '../../composables/useGPU'

const { vendor, renderer, webgl2, webgpu, renderHash, supportedTextureFormats } = useGPU()

const formatsStr = computed(() =>
  supportedTextureFormats.value.length ? supportedTextureFormats.value.join(', ') : 'Aucun format compressé détecté'
)

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
