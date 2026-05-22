<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
       style="background:#050507">
    <!-- Grid -->
    <div class="absolute inset-0 pointer-events-none" style="background-image:linear-gradient(rgba(0,229,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.03) 1px,transparent 1px);background-size:48px 48px;" />

    <!-- Logo centré -->
    <img src="/logo.svg" alt="Empreinte Numérique"
         class="relative z-10"
         style="width:min(480px,76vw);height:auto;filter:drop-shadow(0 0 18px rgba(0,229,255,0.18))" />

    <div class="relative z-10 mt-4 font-mono text-xs tracking-widest"
         style="color:var(--mute);letter-spacing:.22em">
      // build 4f3a9c1d &nbsp;·&nbsp; analyse en cours
    </div>

    <!-- Logs terminal -->
    <div class="relative z-10 mt-8"
         style="width:min(640px,86vw);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 14px;height:130px;overflow:hidden;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mute-2)">
      <div v-for="(log, i) in logs" :key="i" class="whitespace-nowrap leading-5">
        <span>{{ log.text }}</span>
        <span v-if="log.ok" style="color:var(--cyan)">{{ log.ok }}</span>
      </div>
      <div v-if="logs.length" class="leading-5 opacity-60">
        <span style="color:var(--cyan);animation:caretBlink 1s steps(1) infinite;display:inline-block">█</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="relative z-10" style="width:min(640px,86vw);margin-top:0">
      <div style="height:2px;background:var(--line);overflow:hidden">
        <div :style="{ width: `${progress}%` }"
             style="height:100%;background:var(--cyan);box-shadow:0 0 12px var(--cyan);transition:width 0.2s linear" />
      </div>
    </div>

    <!-- Skip button -->
    <button @click="$emit('skip')"
            class="absolute right-5 bottom-4 font-mono text-xs tracking-widest"
            style="color:var(--mute);background:transparent;border:1px solid var(--line-2);padding:6px 10px;cursor:none;letter-spacing:.15em">
      PASSER →
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ progress: number; logs: { text: string; ok?: string }[] }>()
defineEmits<{ skip: [] }>()
</script>
