<template>
  <div class="en-section-title">
    <span class="en-section-num">// {{ index }}</span>
    <h3>{{ title }}</h3>
    <div class="en-section-rule"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ index: string; title: string }>()
</script>
