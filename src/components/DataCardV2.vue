<template>
  <article :class="['card', `sev-${sev}`, `col-${span || 4}`, { 'is-masked': masked }]">
    <header class="c-head">
      <div class="c-title">
        <span class="c-ico" aria-hidden="true">{{ icon }}</span>
        <h3>{{ title }}</h3>
      </div>
      <span :class="['badge', `b-${sev}`]">{{ masked ? 'protégé' : sevLabel }}</span>
    </header>

    <div :class="['c-value', { loading }]">{{ loading ? '' : value }}</div>

    <p v-if="masked" class="c-masked">
      <span aria-hidden="true">🛡️</span>
      <span><b>Masqué ou faussé par votre navigateur.</b> {{ masked }}</span>
    </p>

    <div class="c-box mean">
      <span class="c-box-label">💬 Ce que ça veut dire</span>
      <p>{{ mean }}</p>
    </div>

    <div class="c-box deduce">
      <span class="c-box-label">🔍 Ce qu'on peut en déduire</span>
      <p>{{ deduce }}</p>
    </div>

    <slot name="demo" />

    <footer class="c-tech">
      <span class="t-key" :title="techKey">{{ techKey }}</span>
      <span class="t-arrow" aria-hidden="true">→</span>
      <span class="t-val">{{ loading ? '…' : techVal }}</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Severity = 'faible' | 'moyen' | 'eleve' | 'critique'

const props = defineProps<{
  icon: string
  title: string
  value: string | number
  mean: string
  deduce: string
  techKey: string
  techVal: string | number
  severity: Severity
  sevLabel: string
  loading?: boolean
  span?: number
  /** Explication si le navigateur a masqué ou falsifié la valeur : bandeau dédié, badge « protégé ». */
  masked?: string | null
}>()

// Une valeur masquée ne renseigne plus le site : le risque affiché redescend.
const sev = computed<Severity>(() => props.masked ? 'faible' : props.severity)
</script>
