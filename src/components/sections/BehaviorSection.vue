<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🖱️</span>
        <div>
          <h2>Comportement &amp; Biométrie comportementale</h2>
          <p class="th-sub">Chaque geste, scroll et déplacement de souris est enregistrable passivement. Ces patterns comportementaux permettent de vous identifier indépendamment de votre identité technique.</p>
        </div>
      </div>
      <div>
        <span class="th-count">5<small>signaux collectés</small></span>
      </div>
    </div>

    <!-- Hero heatmap -->
    <div class="hero-block beh-block">
      <div>
        <canvas id="heat-canvas" ref="heatCanvas"></canvas>
      </div>
      <div class="beh-info">
        <div class="loc-line"><b>Profondeur de scroll</b><span>{{ beh.scrollDepth.value }}%</span></div>
        <div class="loc-line"><b>Temps sur page</b><span>{{ formatTime(beh.timeOnPage.value) }}</span></div>
        <div class="loc-line"><b>Changements d'onglet</b><span>{{ beh.tabSwitches.value }}</span></div>
        <div class="loc-line"><b>Points souris tracés</b><span>{{ beh.mousePositions.value.length }}</span></div>
        <div class="beh-note">
          La heatmap en temps réel ci-contre enregistre chaque position de votre souris depuis l'ouverture de cet onglet — sans aucune permission.
        </div>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="📜"
        title="Profondeur de défilement"
        :value="`${beh.scrollDepth.value}%`"
        mean="Le pourcentage de la page scrollée est calculé depuis window.scrollY et la hauteur totale du document."
        deduce="Mesure l'engagement réel avec le contenu. Permet de déduire si vous lisez le contenu ou survolez la page."
        tech-key="window.scrollY / (documentHeight - innerHeight)"
        :tech-val="`${beh.scrollDepth.value}%`"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="⏱️"
        title="Temps passé sur la page"
        :value="formatTime(beh.timeOnPage.value)"
        mean="Le temps est calculé depuis le chargement de la page via Date.now(), mis à jour chaque seconde."
        deduce="Révèle l'intérêt pour le contenu, distingue les lecteurs des bots, calibre les algorithmes de recommandation."
        tech-key="Date.now() - loadTime (interval 1s)"
        :tech-val="`${beh.timeOnPage.value}s`"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🔀"
        title="Changements d'onglet"
        :value="`${beh.tabSwitches.value} fois`"
        mean="L'API Visibility Change détecte chaque fois que vous basculez vers un autre onglet ou réduisez la fenêtre."
        deduce="Révèle vos habitudes de navigation multi-onglets, peut détecter la distraction ou le multi-tasking."
        tech-key="document.addEventListener('visibilitychange')"
        :tech-val="String(beh.tabSwitches.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🖱️"
        title="Points souris enregistrés"
        :value="`${beh.mousePositions.value.length} positions`"
        mean="Chaque mouvement de souris est enregistré via mousemove. Les 500 dernières positions sont conservées."
        deduce="La trajectoire de la souris est un signal biométrique comportemental. Des algorithmes ML peuvent vous identifier par votre façon de bouger la souris."
        tech-key="window.addEventListener('mousemove')"
        :tech-val="`${beh.mousePositions.value.length} points`"
        severity="eleve"
        sev-label="élevé"
        :span="6"
      />
      <DataCardV2
        icon="💨"
        title="Vitesse moyenne de souris"
        :value="`${beh.avgMouseSpeed.value} px/s`"
        mean="La vitesse est calculée en mesurant la distance parcourue par rapport au temps entre chaque événement mousemove."
        deduce="La vitesse et l'accélération de la souris sont des marqueurs biométriques comportementaux utilisables pour l'authentification continue."
        tech-key="Δdistance / Δtime (px/s)"
        :tech-val="`${beh.avgMouseSpeed.value} px/s`"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>La <strong>biométrie comportementale</strong> (mouvements de souris, rythme de frappe, patterns de scroll) permet d'authentifier ou d'identifier un utilisateur indépendamment de son identité technique.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useBehavior } from '../../composables/useBehavior'
import DataCardV2 from '../DataCardV2.vue'

const beh = useBehavior()
const heatCanvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

function formatTime(s: number) {
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function drawHeat() {
  const c = heatCanvas.value
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight)
  const pts = beh.mousePositions.value
  const rect = c.getBoundingClientRect()
  for (const p of pts) {
    const x = p.x - rect.left
    const y = p.y - rect.top
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 20)
    grad.addColorStop(0, 'rgba(0,229,255,0.12)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(x - 20, y - 20, 40, 40)
  }
}

let animId = 0
const loop = () => { drawHeat(); animId = requestAnimationFrame(loop) }

onMounted(() => {
  const c = heatCanvas.value
  if (!c) return
  c.width = c.offsetWidth
  c.height = c.offsetHeight
  ctx = c.getContext('2d')
  loop()
})
onUnmounted(() => cancelAnimationFrame(animId))
</script>
