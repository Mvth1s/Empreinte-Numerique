<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="10" icon="🖱️" title="Comportement utilisateur (temps réel)"
        description="Vos gestes révèlent si vous êtes humain, quand vous lisez, et comment vous interagissez — sans aucun accès explicite." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DataCard icon="⚡" label="Vitesse moyenne souris" :value="avgMouseSpeed ? `${avgMouseSpeed} px/s` : 'Bougez la souris...'" sensitivity="medium"
          inference="Un mouvement trop régulier (robot) ou trop rapide identifie des bots. La vitesse humaine est irrégulière et caractéristique." />

        <DataCard icon="📊" label="Profondeur de scroll" :value="`${scrollDepth}%`" sensitivity="low"
          inference="Le pourcentage de page lu révèle votre intérêt pour le contenu. Corrélé avec le temps de lecture pour scorer l'engagement." />

        <DataCard icon="⏱️" label="Temps sur la page" :value="timeStr" sensitivity="medium"
          inference="Le temps de visite est utilisé pour le scoring publicitaire et l'analyse d'intention. Les systèmes d'attribution le monétisent." />

        <DataCard icon="🔄" label="Changements d'onglet" :value="`${tabSwitches} fois`" sensitivity="medium"
          inference="Chaque fois que vous changez d'onglet, c'est enregistré. Révèle si vous êtes multi-tâches, comparatif, ou distrait." />

        <DataCard icon="🎯" label="Positions souris captées" :value="`${mousePositions.length} points`" sensitivity="medium"
          inference="Jusqu'à 500 positions de souris sont mémorisées en temps réel. La trajectoire révèle votre façon de lire (F-pattern, Z-pattern)." />

        <DataCard icon="🕵️" label="Exploit :visited CSS" :value="'Partiellement patché'" sensitivity="high"
          inference="Ancienne technique: mesurer le style des liens visités via getComputedStyle permettait de détecter votre historique. Patché en 2010, des variantes existent encore." />
      </div>

      <!-- Heatmap de souris -->
      <div class="p-4 bg-surface border border-border rounded-lg">
        <div class="font-mono text-[10px] uppercase tracking-widest text-text-s mb-3">
          🖱️ Heatmap de vos mouvements souris (temps réel)
        </div>
        <div class="relative overflow-hidden rounded border border-border" style="height: 200px;">
          <canvas ref="heatmapCanvas" class="w-full h-full" />
          <div v-if="!mousePositions.length"
               class="absolute inset-0 flex items-center justify-center font-mono text-xs text-text-s">
            Déplacez votre souris ici pour visualiser le tracking
          </div>
        </div>
        <p class="font-mono text-[10px] text-text-s mt-2">
          Chaque point = une position capturée. Votre trajectoire de lecture est analysable par n'importe quel site.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useBehavior } from '../../composables/useBehavior'

const { scrollDepth, timeOnPage, tabSwitches, mousePositions, avgMouseSpeed } = useBehavior()

const heatmapCanvas = ref<HTMLCanvasElement | null>(null)

const timeStr = computed(() => {
  const s = timeOnPage.value
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
})

watch(mousePositions, (positions) => {
  const canvas = heatmapCanvas.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = rect.height * window.devicePixelRatio
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  ctx.clearRect(0, 0, rect.width, rect.height)

  const scaleX = rect.width / window.innerWidth
  const scaleY = rect.height / window.innerHeight

  positions.forEach(({ x, y }, i) => {
    const cx = x * scaleX
    const cy = y * scaleY
    const alpha = 0.06 + (i / positions.length) * 0.08
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16)
    grad.addColorStop(0, `rgba(0,229,255,${alpha})`)
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(cx - 16, cy - 16, 32, 32)
  })

  // Draw path
  if (positions.length > 1) {
    ctx.beginPath()
    ctx.moveTo(positions[0].x * scaleX, positions[0].y * scaleY)
    positions.slice(1).forEach(p => ctx.lineTo(p.x * scaleX, p.y * scaleY))
    ctx.strokeStyle = 'rgba(0,229,255,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}, { deep: true })

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
