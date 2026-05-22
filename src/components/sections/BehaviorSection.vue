<template>
  <div class="wrap section-wrap">
    <SectionHeader index="10" title="Comportement utilisateur" />
    <div class="en-grid">
      <div class="en-card col-12" ref="heatCardRef">
        <div class="en-card-head">
          <div class="en-card-cat">
            <span style="font-size:16px;line-height:1;flex-shrink:0">🌡️</span>
            <div>
              <div class="en-card-name">Heatmap mouvements souris</div>
              <div class="en-card-idx">// section 10 — heatmap live</div>
            </div>
          </div>
          <span class="sev sev-moyen"><span class="dot"></span>MOYEN</span>
        </div>

        <div class="heat-wrap">
          <div style="position:relative;">
            <canvas ref="heatmapCanvas" class="heat-canvas" />
            <div v-if="!mousePositions.length" class="heat-empty">
              Déplacez votre souris pour visualiser le tracking
            </div>
          </div>

          <div class="heat-stats-table">
            <div class="heat-stat-row">
              <span>Mouvements depuis</span>
              <span class="heat-stat-val">{{ timeStr }}</span>
            </div>
            <div class="heat-stat-row">
              <span>Échantillons capturés</span>
              <span class="heat-stat-val">{{ mousePositions.length }}</span>
            </div>
            <div class="heat-stat-row">
              <span>Vitesse moyenne</span>
              <span class="heat-stat-val">{{ avgMouseSpeed ? `${avgMouseSpeed} px/s` : '—' }}</span>
            </div>
            <div class="heat-stat-row">
              <span>Profondeur de scroll</span>
              <span class="heat-stat-val">{{ scrollDepth }}%</span>
            </div>
            <div class="heat-stat-row">
              <span>Changements d'onglet</span>
              <span class="heat-stat-val">{{ tabSwitches }}</span>
            </div>
            <div class="heat-stat-row">
              <span>Précision pointeur</span>
              <span class="heat-stat-val">{{ pointerType }}</span>
            </div>
            <div class="heat-stat-row">
              <span>Latéralité estimée</span>
              <span class="heat-stat-val">{{ laterality }}</span>
            </div>
            <p class="heat-stat-desc">
              Le simple parcours de votre souris est <strong>une signature comportementale</strong> presque aussi unique qu'une empreinte digitale.
            </p>
          </div>
        </div>

        <details class="en-deduce">
          <summary><span class="en-chev">▸</span>🔍 CE QU'ON EN DÉDUIT</summary>
          <div class="en-deduce-body">Vitesse, accélération, rythme des clics, hésitations : ces signaux permettent de distinguer <strong>un humain d'un bot</strong>, mais aussi <strong>vous d'un autre humain</strong>. Plusieurs systèmes anti-fraude bancaire reposent uniquement là-dessus.</div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
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

const pointerType = computed(() =>
  window.matchMedia('(pointer: coarse)').matches ? 'tactile' : 'souris (non tactile)'
)

const laterality = computed(() => {
  const pts = mousePositions.value
  if (pts.length < 20) return '—'
  const rightCount = pts.filter(p => p.x > window.innerWidth / 2).length
  return rightCount > pts.length * 0.55 ? 'droitier probable' : 'gaucher probable'
})

function drawHeatmap(positions: { x: number; y: number }[]) {
  const canvas = heatmapCanvas.value
  if (!canvas) return
  canvas.width = 320
  canvas.height = 200
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#08080d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < canvas.width; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
  }
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
  }

  const scaleX = canvas.width / window.innerWidth
  const scaleY = canvas.height / window.innerHeight

  positions.forEach(({ x, y }, i) => {
    const cx = x * scaleX
    const cy = y * scaleY
    const alpha = 0.05 + (i / positions.length) * 0.15
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16)
    grad.addColorStop(0, `rgba(255,255,255,${Math.min(0.8, alpha * 4)})`)
    grad.addColorStop(0.4, `rgba(0,229,255,${alpha * 2})`)
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(cx - 16, cy - 16, 32, 32)
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
