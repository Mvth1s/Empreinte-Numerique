<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="06" icon="🔬" title="Fingerprinting"
        description="Votre combinaison de signaux constitue un identifiant quasi-unique, stable, sans cookie et sans permission." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="🖼️" label="Empreinte Canvas" :value="canvasHash" sensitivity="critical"
          inference="Un texte invisible rendu sur un canvas produit des pixels légèrement différents selon votre GPU/OS/drivers. Ce hash est stable et unique."
          :loading="loading" />

        <DataCard icon="🎵" label="Empreinte AudioContext" :value="audioHash" sensitivity="critical"
          inference="Un oscillateur audio traité produit un signal légèrement différent selon votre carte son et vos drivers audio. Invisible et persistant."
          :loading="loading" />

        <DataCard icon="🎨" label="Empreinte CSS Media" :value="cssMediaStr" sensitivity="medium"
          inference="La combinaison de vos préférences système (mode sombre, animations réduites, contraste, touch) contribue à l'identification."
          :loading="loading" />

        <DataCard icon="🔤" label="Polices installées" :value="fontsStr" sensitivity="high"
          inference="Les polices révèlent votre OS, vos logiciels installés (Office, Adobe) et votre région. La liste détectée est ci-dessous."
          :loading="loading" />

        <DataCard icon="🧩" label="Plugins navigateur" :value="pluginsStr" sensitivity="medium"
          inference="Les plugins installés (PDF viewer, DRM…) contribuent à l'empreinte. Chrome a supprimé la liste complète, Firefox la dévoile encore."
          :loading="loading" />

        <DataCard icon="🎬" label="Codecs vidéo/audio" :value="codecsStr" sensitivity="low"
          inference="La combinaison de codecs supportés varie selon l'OS et le navigateur. Affine l'identification dans les cas ambigus." />

        <DataCard icon="🆔" label="Identifiant unique combiné" :value="combinedHash" sensitivity="critical"
          inference="SHA-256 de tous vos signaux combinés. Probabilité d'unicité estimée > 99% parmi les utilisateurs web mondiaux."
          :loading="loading" />
      </div>

      <!-- Polices détectées -->
      <div v-if="!loading && detectedFonts.length" class="mt-6 p-4 bg-surface border border-border rounded-lg">
        <div class="font-mono text-[10px] uppercase tracking-widest text-text-s mb-3">
          🔤 {{ detectedFonts.length }} polices détectées sur votre système
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="font in detectedFonts" :key="font"
                class="font-mono text-[10px] px-2 py-0.5 bg-s2 border border-border rounded text-cyan/80">
            {{ font }}
          </span>
        </div>
      </div>

      <!-- Codecs -->
      <div v-if="Object.keys(codecs).length" class="mt-4 p-4 bg-surface border border-border rounded-lg">
        <div class="font-mono text-[10px] uppercase tracking-widest text-text-s mb-3">🎬 Codecs supportés</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div v-for="(val, key) in codecs" :key="key" class="flex items-center justify-between font-mono text-[11px]">
            <span class="text-text-s">{{ key }}</span>
            <span :class="val === 'probably' ? 'text-emerald-400' : val === 'maybe' ? 'text-yellow-400' : 'text-text-s'">
              {{ val === 'probably' ? '✓' : val === 'maybe' ? '~' : '✗' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useFingerprint } from '../../composables/useFingerprint'

const { canvasHash, audioHash, cssMedia, detectedFonts, plugins, codecs, combinedHash, loading } = useFingerprint()

const cssMediaStr = computed(() => cssMedia.value ?? null)
const fontsStr = computed(() => detectedFonts.value.length ? `${detectedFonts.value.length} polices détectées` : 'Détection en cours...')
const pluginsStr = computed(() => plugins.value.length ? plugins.value.slice(0, 3).join(', ') + (plugins.value.length > 3 ? '…' : '') : 'Aucun plugin exposé')
const codecsStr = computed(() => {
  const supported = Object.entries(codecs.value).filter(([, v]) => v !== 'non').map(([k]) => k)
  return supported.length ? supported.join(', ') : null
})

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
