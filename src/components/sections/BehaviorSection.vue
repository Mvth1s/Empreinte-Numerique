<template>
  <div class="wrap section-wrap">
    <SectionHeader index="10" title="Comportement utilisateur" />
    <div class="en-grid">
      <DataCard icon="🖱️" label="Interactions temps réel" sectionIdx="section 10"
        :rows="[
          { k: 'VITESSE_SOURIS', v: avgMouseSpeed ? `${avgMouseSpeed} px/s` : 'Bougez la souris…' },
          { k: 'SCROLL_PROFONDEUR', v: `${scrollDepth}%`, cls: 'muted' },
          { k: 'TEMPS_PAGE', v: timeStr, cls: 'muted' },
          { k: 'CHANGEMENTS_ONGLET', v: `${tabSwitches} fois`, cls: 'muted' },
          { k: 'POSITIONS_CAPTÉES', v: `${mousePositions.length} points`, cls: 'muted' },
        ]"
        inference="Un mouvement trop régulier = bot. Votre trajectoire révèle votre <strong>pattern de lecture (F-pattern, Z-pattern)</strong>. Le temps de visite est monétisé pour le scoring publicitaire."
        sensitivity="medium" :span="5" />

      <div class="en-card col-7" ref="heatCardRef">
        <div class="en-card-head">
          <div class="en-card-cat">
            <span style="font-size:16px;line-height:1;flex-shrink:0">🌡️</span>
            <div>
              <div class="en-card-name">Heatmap mouvements souris</div>
              <div class="en-card-idx">// section 10</div>
            </div>
          </div>
          <span class="sev sev-moyen"><span class="dot"></span>MOYEN</span>
        </div>
        <div style="position:relative; margin-top:12px;">
          <canvas ref="heatmapCanvas" class="heat-canvas" />
          <div v-if="!mousePositions.length" class="heat-empty">
            Déplacez votre souris pour visualiser le tracking
          </div>
        </div>
        <p class="heat-caption">Chaque point = une position capturée. Votre trajectoire de lecture est analysable par n'importe quel site.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useBehavior } from '../../composables/useBehavior'

const { scrollDepth, timeOnPage, tabSwitches, mousePositions, avgMouseSpeed } = useBehavior()

const heatmapCanvas = ref<HTMLCanvasElement | null>(null)
const heatCardRef = ref<HTMLElement | null>(null)

const timeStr = computed(() => {
  const s = timeOnPage.value
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
})

function drawHeatmap(positions: { x: number; y: number }[]) {
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
    const alpha = 0.05 + (i / positions.length) * 0.1
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18)
    grad.addColorStop(0, `rgba(0,229,255,${alpha})`)
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(cx - 18, cy - 18, 36, 36)
  })

  if (positions.length > 1) {
    ctx.beginPath()
    ctx.moveTo(positions[0].x * scaleX, positions[0].y * scaleY)
    positions.slice(1).forEach(p => ctx.lineTo(p.x * scaleX, p.y * scaleY))
    ctx.strokeStyle = 'rgba(0,229,255,0.12)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

watch(mousePositions, (positions) => { drawHeatmap(positions) }, { deep: true })

onMounted(() => {
  const el = heatCardRef.value
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
