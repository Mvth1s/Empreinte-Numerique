<template>
  <div class="flex items-start gap-4 mb-8 pb-6 border-b border-border">
    <span class="font-mono text-5xl font-bold text-border leading-none select-none">{{ index }}</span>
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span class="text-2xl">{{ icon }}</span>
        <h2 class="font-mono text-lg font-bold uppercase tracking-[0.12em] text-text-p">{{ title }}</h2>
      </div>
      <p class="text-sm text-text-s max-w-lg">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ index: string; icon: string; title: string; description: string }>()
</script>
