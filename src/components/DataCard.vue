<template>
  <div class="en-card" :class="`col-${span ?? 4}`" ref="cardRef">
    <!-- Header -->
    <div class="en-card-head">
      <div class="en-card-cat">
        <span style="font-size:16px;line-height:1;flex-shrink:0">{{ icon }}</span>
        <div>
          <div class="en-card-name">{{ label }}</div>
          <div class="en-card-idx">// {{ sectionIdx }}</div>
        </div>
      </div>
      <span class="sev" :class="`sev-${severity === 'critical' ? 'critique' : severity === 'high' ? 'eleve' : severity === 'medium' ? 'moyen' : 'faible'}`">
        <span class="dot"></span>{{ sevLabel }}
      </span>
    </div>

    <!-- Values table -->
    <div class="en-vals">
      <div class="en-row" v-for="(row, i) in normalizedRows" :key="i">
        <span class="en-k">{{ row.k }}</span>
        <span class="en-v" :class="row.cls">
          <template v-if="loading && i === 0">
            <span style="display:inline-block;width:6em;height:0.8em;background:var(--line-2);border-radius:2px;animation:pulse 1.5s ease-in-out infinite" />
          </template>
          <template v-else>{{ row.v ?? 'N/A' }}</template>
        </span>
      </div>
    </div>

    <!-- Deduce accordion -->
    <details class="en-deduce" v-if="inference">
      <summary>
        <span class="en-chev">▸</span>🔍 CE QU'ON EN DÉDUIT
      </summary>
      <div class="en-deduce-body" v-html="inference" />
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Sensitivity } from '../types'

export interface DataRow {
  k: string
  v: string | number | boolean | null | undefined
  cls?: string
}

const props = defineProps<{
  icon: string
  label: string
  sectionIdx: string
  rows?: DataRow[]
  // shorthand for single-value cards
  value?: string | number | boolean | null | undefined
  inference?: string
  sensitivity: Sensitivity
  span?: number
  loading?: boolean
}>()

const sevLabel = computed(() => ({
  low: 'FAIBLE', medium: 'MOYEN', high: 'ÉLEVÉ', critical: 'CRITIQUE',
}[props.sensitivity]))

const normalizedRows = computed((): DataRow[] => {
  if (props.rows?.length) return props.rows
  const v = props.value
  const display = typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : v
  return [{ k: 'VALEUR', v: display as string | null }]
})

// Stagger reveal via IntersectionObserver
const cardRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const el = cardRef.value
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
