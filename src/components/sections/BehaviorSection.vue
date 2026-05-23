<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🖱️</span>
        <div>
          <h2>Comportement</h2>
          <p class="th-sub">Votre souris écrit votre signature, ligne par ligne.</p>
        </div>
      </div>
      <div>
        <span class="th-count">7<small>signaux</small></span>
      </div>
    </div>

    <!-- Hero heatmap -->
    <div class="hero-block beh-block">
      <canvas id="heat-canvas" ref="heatCanvas" aria-hidden="true"></canvas>
      <div class="beh-info">
        <div class="hb-label">HEATMAP DE VOTRE SOURIS · LIVE</div>
        <div class="loc-line"><b>Échantillons</b><span id="heat-count">{{ heatCount }}</span></div>
        <div class="loc-line"><b>Temps</b><span id="heat-time">{{ heatTime }}</span></div>
        <div class="loc-line"><b>Pointeur</b><span>{{ pointerType }}</span></div>
        <div class="loc-line"><b>Latéralité</b><span>{{ beh.handedness.value }}</span></div>
        <p class="beh-note">Bougez votre souris — chaque pixel parcouru est une donnée.</p>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖱️"
        title="Trajectoire de votre souris"
        value="Enregistrée en direct"
        mean="Chaque petit mouvement entre deux clics est suivi et peut être analysé."
        deduce="La forme de vos déplacements distingue un humain d'un bot, et vous distingue d'autres humains."
        tech-key="addEventListener('mousemove', …)"
        :tech-val="`~ ${beh.mousePositions.value.length} points`"
        severity="eleve"
        sev-label="Élevé"
        :span="4"
      />
      <DataCardV2
        icon="⌨️"
        title="Rythme de frappe"
        :value="beh.avgKeyInterval.value ? beh.avgKeyInterval.value + ' ms/touche' : 'Tapez au clavier…'"
        mean="Le délai moyen entre vos touches au clavier forme une cadence biométrique qui vous est propre."
        deduce="Utilisé par certaines banques comme deuxième facteur invisible d'authentification. Impossible à reproduire exactement par un bot."
        tech-key="keydown timestamps → Δt moyen"
        :tech-val="beh.avgKeyInterval.value ? beh.avgKeyInterval.value + ' ms' : '…'"
        severity="eleve"
        sev-label="Élevé"
        :span="4"
      />
      <DataCardV2
        icon="📐"
        title="Précision du pointeur"
        :value="pointerType"
        mean="Le navigateur sait si vous pointez avec précision (souris) ou approximation (doigt)."
        deduce="Confirme la classe d'appareil et la posture (assis devant un PC vs mobile dans la main)."
        tech-key="matchMedia('(pointer:fine)')"
        :tech-val="isFinePonter ? 'true' : 'false'"
        severity="moyen"
        sev-label="Moyen"
        :span="4"
      />
      <DataCardV2
        icon="📜"
        title="Profondeur de défilement"
        :value="beh.scrollDepth.value + ' %'"
        mean="Le site sait jusqu'où vous avez fait défiler la page — si vous avez lu l'introduction, le milieu ou tout le contenu."
        deduce="Mesure votre intérêt réel pour le contenu. Utilisé pour adapter les publicités et évaluer l'engagement."
        tech-key="scrollY / (scrollHeight – innerHeight)"
        :tech-val="beh.scrollDepth.value + '%'"
        severity="faible"
        sev-label="faible"
        :span="3"
      />
      <DataCardV2
        icon="⏱️"
        title="Temps sur la page"
        :value="formatTime(beh.timeOnPage.value)"
        mean="La durée exacte depuis que vous avez ouvert cette page est connue à la seconde près."
        deduce="Distingue un visiteur rapide d'un lecteur attentif. Sert à mesurer l'intérêt et à personnaliser le contenu."
        tech-key="Date.now() – startTime"
        :tech-val="beh.timeOnPage.value + ' s'"
        severity="faible"
        sev-label="faible"
        :span="3"
      />
      <DataCardV2
        icon="🔀"
        title="Changements d'onglet"
        :value="beh.tabSwitches.value === 0 ? 'Aucun' : beh.tabSwitches.value + ' fois'"
        mean="Chaque fois que vous passez à un autre onglet ou minimisez la fenêtre, le site le détecte automatiquement."
        deduce="Révèle si vous comparez des prix, si vous êtes distrait, ou si vous partagez votre écran avec quelqu'un."
        tech-key="visibilitychange → document.hidden"
        :tech-val="String(beh.tabSwitches.value)"
        severity="moyen"
        sev-label="moyen"
        :span="3"
      />
      <DataCardV2
        icon="⚡"
        title="Vitesse de déplacement"
        :value="beh.avgMouseSpeed.value ? beh.avgMouseSpeed.value + ' px/s' : 'En attente…'"
        mean="La vitesse moyenne de vos mouvements de souris est mesurée en permanence. Les humains ont chacun leur rythme naturel."
        deduce="Sert à prouver que vous êtes humain (pas un robot), et peut contribuer à créer une empreinte comportementale unique."
        tech-key="distance / temps entre mousemove"
        :tech-val="beh.avgMouseSpeed.value ? beh.avgMouseSpeed.value + ' px/s' : '…'"
        severity="moyen"
        sev-label="moyen"
        :span="3"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBehavior } from '../../composables/useBehavior'
import DataCardV2 from '../DataCardV2.vue'

const beh = useBehavior()
const heatCanvas = ref<HTMLCanvasElement | null>(null)
const heatCount = ref(0)
const heatTime = ref('0,0 s')
const isFinePonter = window.matchMedia('(pointer: fine)').matches
const pointerType = isFinePonter ? 'fine (souris)' : 'coarse (tactile)'

function formatTime(s: number): string {
  if (s < 60) return s + ' s'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m} min ${sec} s`
}

let ctx: CanvasRenderingContext2D | null = null
let count = 0
let t0 = performance.now()
let fadeInterval: ReturnType<typeof setInterval> | null = null

function dot(e: MouseEvent) {
  const c = heatCanvas.value
  if (!c || !ctx) return
  const rr = c.getBoundingClientRect()
  let x: number, y: number
  if (e.clientX >= rr.left && e.clientX <= rr.right && e.clientY >= rr.top && e.clientY <= rr.bottom) {
    x = e.clientX - rr.left
    y = e.clientY - rr.top
  } else {
    x = (e.clientX / window.innerWidth) * c.width
    y = (e.clientY / window.innerHeight) * c.height
  }
  const g = ctx.createRadialGradient(x, y, 0, x, y, 22)
  g.addColorStop(0, 'rgba(255,255,255,0.8)')
  g.addColorStop(0.35, 'rgba(0,229,255,0.55)')
  g.addColorStop(1, 'rgba(0,229,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(x - 22, y - 22, 44, 44)

  count++
  heatCount.value = count
  const dt = ((performance.now() - t0) / 1000).toFixed(1)
  heatTime.value = dt.replace('.', ',') + ' s'
}

function fade() {
  const c = heatCanvas.value
  if (!c || !ctx) return
  ctx.fillStyle = 'rgba(8,8,13,0.04)'
  ctx.fillRect(0, 0, c.width, c.height)
}

onMounted(() => {
  const c = heatCanvas.value
  if (!c) return
  const r = c.getBoundingClientRect()
  c.width = r.width || c.offsetWidth
  c.height = r.height || c.offsetHeight
  ctx = c.getContext('2d')
  if (!ctx) return

  // Background + grid
  ctx.fillStyle = '#08080d'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let x = 0; x < c.width; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke()
  }
  for (let y = 0; y < c.height; y += 24) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke()
  }

  t0 = performance.now()
  window.addEventListener('mousemove', dot)
  fadeInterval = setInterval(fade, 120)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', dot)
  if (fadeInterval) clearInterval(fadeInterval)
})
</script>
