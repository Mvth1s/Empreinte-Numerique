<template>
  <article :class="['card', `sev-${severity}`]" :style="{ gridColumn: `span ${span}` }">
    <header class="c-head">
      <div class="c-title">
        <span class="c-ico">{{ icon }}</span>
        <h3>{{ title }}</h3>
      </div>
      <span :class="['badge', `b-${severity}`]">{{ sevLabel }}</span>
    </header>

    <div :class="['c-value', { loading }]">{{ loading ? '' : value }}</div>

    <div class="c-box mean">
      <span class="c-box-label">💬 Ce que ça veut dire</span>
      <p>{{ mean }}</p>
    </div>

    <div class="c-box deduce">
      <span class="c-box-label">🔍 Ce qu'on peut en déduire</span>
      <p>{{ deduce }}</p>
    </div>

    <footer class="c-tech">
      <span class="t-key" :title="techKey">{{ techKey }}</span>
      <span class="t-arrow">→</span>
      <span class="t-val">{{ loading ? '…' : techVal }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  value: string | number
  mean: string
  deduce: string
  techKey: string
  techVal: string | number
  severity: 'faible' | 'moyen' | 'eleve' | 'critique'
  sevLabel: string
  loading?: boolean
  span?: number
}>()
</script>
