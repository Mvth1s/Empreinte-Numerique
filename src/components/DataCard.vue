<template>
  <div class="group relative bg-surface border border-border rounded-lg overflow-hidden card-hover"
       :class="leftBorderClass">
    <!-- Sensitivity glow on hover for critical -->
    <div v-if="sensitivity === 'critical'"
         class="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
         style="box-shadow:inset 0 0 20px rgba(255,59,48,0.05)" />

    <div class="p-4">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-base shrink-0">{{ icon }}</span>
          <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-text-s truncate">{{ label }}</span>
        </div>
        <!-- Badge sensibilité -->
        <span class="shrink-0 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border whitespace-nowrap"
              :class="badgeClass">
          {{ badgeLabel }}
        </span>
      </div>

      <!-- Valeur -->
      <div class="font-mono text-sm mb-3 min-h-[1.25rem] break-all leading-relaxed"
           :class="loading ? 'text-text-s' : valueClass">
        <template v-if="loading">
          <span class="inline-block w-24 h-3 bg-border rounded animate-pulse" />
        </template>
        <template v-else-if="value !== null && value !== undefined && value !== ''">
          {{ displayValue }}
        </template>
        <span v-else class="text-text-s italic text-xs">Indisponible</span>
      </div>

      <!-- Inférence -->
      <div class="text-[11px] text-text-s border-t border-border pt-2 leading-relaxed">
        <span class="mr-1.5">🔍</span>{{ inference }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Sensitivity } from '../types'

const props = defineProps<{
  icon: string
  label: string
  value: string | number | boolean | null | undefined
  inference: string
  sensitivity: Sensitivity
  loading?: boolean
}>()

const leftBorderClass = computed(() => ({
  'border-l-2 border-l-emerald-500': props.sensitivity === 'low',
  'border-l-2 border-l-yellow-400': props.sensitivity === 'medium',
  'border-l-2 border-l-orange-400': props.sensitivity === 'high',
  'border-l-2 border-l-alert': props.sensitivity === 'critical',
}))

const valueClass = computed(() => ({
  'text-cyan': props.sensitivity === 'low' || props.sensitivity === 'medium',
  'text-orange-300': props.sensitivity === 'high',
  'text-alert': props.sensitivity === 'critical',
}))

const badgeClass = computed(() => ({
  'text-emerald-400 border-emerald-400/30 bg-emerald-400/5': props.sensitivity === 'low',
  'text-yellow-400 border-yellow-400/30 bg-yellow-400/5': props.sensitivity === 'medium',
  'text-orange-400 border-orange-400/30 bg-orange-400/5': props.sensitivity === 'high',
  'text-alert border-alert/30 bg-alert/5': props.sensitivity === 'critical',
}))

const badgeLabel = computed(() => ({
  low: '● Faible',
  medium: '● Moyen',
  high: '● Élevé',
  critical: '● Critique',
}[props.sensitivity]))

const displayValue = computed(() => {
  if (typeof props.value === 'boolean') return props.value ? 'Oui' : 'Non'
  return String(props.value)
})
</script>
