<template>
  <div class="wrap section-wrap">
    <SectionHeader index="06" title="Fingerprinting" />
    <div class="en-grid">
      <div class="en-card fp-card-special col-8" ref="fpCardRef">
        <div class="en-card-head">
          <div class="en-card-cat">
            <span style="font-size:16px;line-height:1;flex-shrink:0">🔬</span>
            <div>
              <div class="en-card-name">Identifiant unique probable</div>
              <div class="en-card-idx">// section 06</div>
            </div>
          </div>
          <span class="sev sev-critique"><span class="dot"></span>CRITIQUE</span>
        </div>
        <div class="fp-inner">
          <div class="en-vals-sub">VOTRE EMPREINTE COMBINÉE</div>
          <div class="fp-hash" ref="hashEl">
            <span v-if="!combinedHash" class="fp-caret"></span>
          </div>
          <div class="fp-meta">
            <div><strong>Stable</strong> · entre les sessions</div>
            <div><strong>Sans cookie</strong> · sans stockage</div>
            <div><strong>Sans permission</strong> · entièrement passif</div>
            <div><strong>Unicité</strong> · &gt; 99% des utilisateurs</div>
          </div>
        </div>
        <details class="en-deduce">
          <summary><span class="en-chev">▸</span>🔍 CE QU'ON EN DÉDUIT</summary>
          <div class="en-deduce-body">SHA-256 de l'ensemble de vos signaux combinés. Cette empreinte est <strong>recalculable à l'identique</strong> à chaque visite, sans cookie ni stockage. La probabilité que deux utilisateurs aient exactement la même est inférieure à 1 sur 100 000.</div>
        </details>
      </div>

      <DataCard icon="🖼️" label="Canvas" sectionIdx="section 06"
        :rows="[{ k: 'CANVAS_HASH', v: canvasHash }]"
        inference="Un texte invisible rendu sur canvas produit des pixels <strong>légèrement différents</strong> selon votre GPU, OS et drivers. Ce hash est stable et unique."
        sensitivity="critical" :span="4" :loading="loading" />

      <DataCard icon="🎵" label="AudioContext" sectionIdx="section 06"
        :rows="[{ k: 'AUDIO_HASH', v: audioHash }]"
        inference="Un oscillateur audio traité via OfflineAudioContext produit un signal <strong>légèrement différent</strong> selon votre carte son et pilotes audio."
        sensitivity="critical" :span="4" :loading="loading" />

      <DataCard icon="🔤" label="Polices système" sectionIdx="section 06"
        :rows="[
          { k: 'POLICES_DÉTECTÉES', v: fontsCountStr },
          { k: 'EXEMPLES', v: fontsExStr, cls: 'muted' },
        ]"
        inference="Les polices révèlent votre <strong>OS, logiciels (Office, Adobe) et région</strong>. Chaque combinaison est quasi-unique et non modifiable sans accès root."
        sensitivity="high" :span="4" :loading="loading" />

      <DataCard icon="🎨" label="CSS Media" sectionIdx="section 06"
        :rows="[{ k: 'CSS_MEDIA_BITS', v: cssMedia, cls: 'muted' }]"
        inference="La combinaison de vos préférences système (mode sombre, animations réduites, contraste, pointeur) forme un <strong>vecteur de bits unique</strong>."
        sensitivity="medium" :span="4" :loading="loading" />

      <div v-if="!loading && detectedFonts.length" class="en-card col-12" style="padding: 16px 20px;">
        <div class="en-vals-sub" style="margin-bottom: 10px;">{{ detectedFonts.length }} POLICES DÉTECTÉES SUR VOTRE SYSTÈME</div>
        <div class="font-tags">
          <span v-for="font in detectedFonts" :key="font" class="font-tag">{{ font }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useFingerprint } from '../../composables/useFingerprint'

const { canvasHash, audioHash, cssMedia, detectedFonts, combinedHash, loading } = useFingerprint()

const fontsCountStr = computed(() => {
  if (loading.value) return null
  return detectedFonts.value.length ? `${detectedFonts.value.length} polices détectées` : 'Aucune détectée'
})

const fontsExStr = computed(() =>
  detectedFonts.value.slice(0, 4).join(', ') + (detectedFonts.value.length > 4 ? '…' : ''))

const hashEl = ref<HTMLElement | null>(null)
const fpCardRef = ref<HTMLElement | null>(null)

// Typewriter animation when hash is ready
watch(combinedHash, (val) => {
  if (!val || !hashEl.value) return
  const el = hashEl.value
  el.innerHTML = ''
  let i = 0
  const interval = setInterval(() => {
    if (i >= val.length) { clearInterval(interval); return }
    el.textContent = val.slice(0, ++i)
    const caret = document.createElement('span')
    caret.className = 'fp-caret'
    el.appendChild(caret)
  }, 28)
})

// Stagger reveal for the custom en-card
onMounted(() => {
  const el = fpCardRef.value
  if (!el) return
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const idx = [...document.querySelectorAll('.en-card')].indexOf(el)
      el.style.transition = `opacity .5s ${idx * 55}ms, transform .5s ${idx * 55}ms, border-color .2s, box-shadow .2s`
      el.classList.add('revealed')
      obs.disconnect()
    }
  }, { threshold: 0.05 })
  obs.observe(el)
})
</script>
