<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg overflow-hidden">
    <!-- Grid overlay -->
    <div class="absolute inset-0 opacity-30"
         style="background-image:linear-gradient(rgba(0,229,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.04) 1px,transparent 1px);background-size:48px 48px" />

    <div class="relative z-10 flex flex-col items-center gap-8 w-full max-w-xl px-6">
      <!-- Logo animé -->
      <div class="relative">
        <svg class="animate-pulse-glow" width="96" height="96" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8c-6.6 0-12.8 2.6-17.4 7.2C9.8 19.8 7 26 7 32.6c0 4.8 1.3 9.4 3.8 13.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M20 14c-3.2 3.4-5 8-5 12.8 0 3.8 1.1 7.4 3.2 10.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M27 12c-1.8.6-3.4 1.4-4.8 2.6" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <ellipse cx="32" cy="27" rx="6" ry="7" stroke="#00e5ff" stroke-width="2.5"/>
          <path d="M26 34c0 4 2.6 7.4 6 8.8" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M38 34c0 6-2.7 11-6.4 13.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M20 28c0 7 5.4 12.8 12 14.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M44 28c0 10-5.4 18.6-13.4 22.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M44 22c1.3 2.8 2 5.8 2 9" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M37 12c4.6 2.4 7.8 6.6 9 11.6" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <!-- Scan line -->
        <div class="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan to-transparent animate-scan" style="opacity:0.8" />
      </div>

      <!-- Titre -->
      <div class="text-center">
        <h1 class="font-mono text-2xl font-bold tracking-[0.2em] text-text-p uppercase">Empreinte Numérique</h1>
        <p class="font-mono text-xs text-cyan tracking-widest mt-1 uppercase">ANALYSE EN COURS...</p>
      </div>

      <!-- Barre de progression -->
      <div class="w-full">
        <div class="flex justify-between font-mono text-[10px] text-text-s mb-1.5 uppercase tracking-widest">
          <span>Collecte des données</span>
          <span class="text-cyan">{{ progress }}%</span>
        </div>
        <div class="w-full h-px bg-border overflow-hidden">
          <div class="h-full bg-cyan transition-all duration-300 ease-out relative"
               :style="{ width: `${progress}%` }">
            <div class="absolute right-0 top-0 h-full w-6 bg-gradient-to-r from-transparent to-white opacity-60 blur-sm" />
          </div>
        </div>
      </div>

      <!-- Terminal logs -->
      <div class="w-full bg-surface border border-border rounded font-mono text-[11px] leading-5 p-3 h-40 overflow-hidden relative">
        <div class="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-surface to-transparent z-10" />
        <div class="space-y-0.5" ref="logContainer">
          <div v-for="(log, i) in logs" :key="i" class="flex gap-2">
            <span class="text-text-s shrink-0">{{ formatTime(i) }}</span>
            <span :class="logColor(log)">{{ log }}</span>
          </div>
          <div v-if="logs.length" class="flex gap-2 opacity-60">
            <span class="text-text-s">_</span>
            <span class="text-cyan animate-blink">█</span>
          </div>
        </div>
        <div class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface to-transparent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick, ref } from 'vue'

const props = defineProps<{ progress: number; logs: string[] }>()
const logContainer = ref<HTMLElement | null>(null)

function formatTime(i: number) {
  const ms = String(i * 220).padStart(5, '0')
  return `[${ms.slice(0, 2)}:${ms.slice(2)}]`
}

function logColor(log: string) {
  if (log.startsWith('[SYS]')) return 'text-text-s'
  if (log.startsWith('[NET]') || log.startsWith('[RTC]') || log.startsWith('[DNS]')) return 'text-cyan'
  if (log.startsWith('[FPR]') || log.startsWith('[AUD]') || log.startsWith('[FNT]')) return 'text-emerald-400'
  if (log.startsWith('[GPU]')) return 'text-purple-400'
  if (log.startsWith('[GEO]')) return 'text-yellow-400'
  if (log.includes('prêt') || log.includes('✓')) return 'text-emerald-400'
  return 'text-text-p'
}

watch(() => props.logs.length, async () => {
  await nextTick()
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight
  }
})
</script>
