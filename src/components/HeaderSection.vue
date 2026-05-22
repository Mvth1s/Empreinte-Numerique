<template>
  <header class="relative border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <!-- Logo + titre -->
      <div class="flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none" class="shrink-0 animate-pulse-glow">
          <path d="M32 8c-6.6 0-12.8 2.6-17.4 7.2C9.8 19.8 7 26 7 32.6c0 4.8 1.3 9.4 3.8 13.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M20 14c-3.2 3.4-5 8-5 12.8 0 3.8 1.1 7.4 3.2 10.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="32" cy="27" rx="6" ry="7" stroke="#00e5ff" stroke-width="2.5"/>
          <path d="M26 34c0 4 2.6 7.4 6 8.8" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M38 34c0 6-2.7 11-6.4 13.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M20 28c0 7 5.4 12.8 12 14.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M44 28c0 10-5.4 18.6-13.4 22.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M44 22c1.3 2.8 2 5.8 2 9" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M37 12c4.6 2.4 7.8 6.6 9 11.6" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <div>
          <div class="font-mono text-sm font-bold tracking-[0.15em] text-text-p uppercase">Empreinte Numérique</div>
          <div class="font-mono text-[10px] text-text-s tracking-wider">Ce que chaque site sait sur vous</div>
        </div>
      </div>

      <!-- Score compact dans le header -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <div class="font-mono text-[10px] uppercase tracking-widest text-text-s">Score de traçabilité</div>
          <div class="font-mono text-[10px] text-text-s">Calculé depuis {{ itemsCount }} signaux</div>
        </div>
        <!-- Jauge circulaire mini -->
        <div class="relative w-14 h-14">
          <svg class="w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" stroke="#1a1a2e" stroke-width="4" fill="none"/>
            <circle cx="28" cy="28" r="22" :stroke="scoreColor" stroke-width="4" fill="none"
                    stroke-linecap="round"
                    :stroke-dasharray="`${circumference}`"
                    :stroke-dashoffset="`${dashOffset}`"
                    style="transition: stroke-dashoffset 1.2s ease-out, stroke 0.5s"/>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="font-mono text-sm font-bold" :style="{ color: scoreColor }">{{ displayScore }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Hero -->
  <div class="max-w-6xl mx-auto px-6 py-16 text-center">
    <div class="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-cyan border border-cyan/20 bg-cyan/5 px-3 py-1.5 rounded mb-6">
      <span class="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
      Analyse passive — aucune permission demandée
    </div>

    <h1 class="font-mono text-4xl md:text-5xl font-bold text-text-p leading-tight mb-4">
      Votre empreinte<br />
      <span class="text-cyan glow-cyan">numérique</span>
    </h1>

    <p class="text-text-s max-w-xl mx-auto mb-8 leading-relaxed">
      Voici ce que <strong class="text-text-p">n'importe quel site</strong> peut savoir sur vous,
      sans aucune permission, sans cookie, sans malware.
      C'est le fonctionnement normal du Web.
    </p>

    <!-- Grand score -->
    <div class="inline-flex flex-col items-center gap-4 p-8 bg-surface border border-border rounded-xl">
      <div class="font-mono text-[11px] uppercase tracking-[0.2em] text-text-s">Score de traçabilité global</div>

      <div class="relative w-36 h-36">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="60" stroke="#1a1a2e" stroke-width="8" fill="none"/>
          <circle cx="72" cy="72" r="60" :stroke="scoreColor" stroke-width="8" fill="none"
                  stroke-linecap="round"
                  :stroke-dasharray="`${bigCircumference}`"
                  :stroke-dashoffset="`${bigDashOffset}`"
                  style="transition: stroke-dashoffset 1.5s cubic-bezier(.22,.68,0,1.2), stroke 0.5s"/>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-mono text-4xl font-bold" :style="{ color: scoreColor }">{{ displayScore }}</span>
          <span class="font-mono text-xs text-text-s">/ 100</span>
        </div>
      </div>

      <div class="font-mono text-sm text-text-s">
        <span :style="{ color: scoreColor }">{{ scoreLabel }}</span>
        — {{ itemsCount }} signaux collectés
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{ score: number; itemsCount: number }>()

const displayScore = ref(0)

watch(() => props.score, (val) => {
  const start = displayScore.value
  const duration = 1500
  const startTime = Date.now()
  function tick() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    displayScore.value = Math.round(start + (val - start) * ease)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}, { immediate: true })

const scoreColor = computed(() => {
  const s = props.score
  if (s < 40) return '#30d158'
  if (s < 65) return '#ffd60a'
  if (s < 85) return '#ff9f0a'
  return '#ff3b30'
})

const scoreLabel = computed(() => {
  const s = props.score
  if (s < 40) return 'Faible exposition'
  if (s < 65) return 'Exposition modérée'
  if (s < 85) return 'Exposition élevée'
  return 'Très fortement traçable'
})

const circumference = 2 * Math.PI * 22
const dashOffset = computed(() => circumference - (props.score / 100) * circumference)

const bigCircumference = 2 * Math.PI * 60
const bigDashOffset = computed(() => bigCircumference - (props.score / 100) * bigCircumference)
</script>
