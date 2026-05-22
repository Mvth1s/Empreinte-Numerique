<template>
  <div>
    <!-- TOP BAR -->
    <header style="border-bottom:1px solid var(--line)">
      <div class="wrap" style="padding-top:10px;padding-bottom:22px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <!-- Brand -->
          <div style="display:flex;align-items:center;gap:14px">
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style="flex-shrink:0">
              <g style="fill:none;stroke:var(--cyan);stroke-width:1">
                <path d="M22 6 C12 6 6 14 6 22 C6 26 7 29 9 32" />
                <path d="M22 10 C15 10 10 16 10 22 C10 25 11 28 13 30" />
                <path d="M22 14 C17 14 14 17 14 22 C14 26 15 28 17 30" />
                <path d="M22 18 C19 18 18 20 18 22 C18 25 19 27 21 29" />
                <path d="M22 22 C22 24 22 27 24 30" />
              </g>
              <g style="fill:none;stroke:var(--cyan);stroke-width:1;opacity:.35">
                <path d="M22 6 C32 6 38 14 38 22 C38 26 37 29 35 32" />
                <path d="M22 10 C29 10 34 16 34 22 C34 25 33 28 31 30" />
                <path d="M22 14 C27 14 30 17 30 22 C30 26 29 28 27 30" />
              </g>
              <g style="stroke:var(--cyan);stroke-width:.6;opacity:.6">
                <line x1="38" y1="14" x2="44" y2="14"/>
                <line x1="40" y1="22" x2="44" y2="22"/>
                <line x1="38" y1="30" x2="44" y2="30"/>
              </g>
            </svg>
            <div>
              <h1 style="font-family:'IBM Plex Mono',monospace;font-size:14px;letter-spacing:.28em;margin:0;color:var(--fg)">
                EMPREINTE NUMÉRIQUE
              </h1>
              <div style="font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--mute);letter-spacing:.22em;text-transform:uppercase;margin-top:4px">
                Ce que chaque site sait sur vous
              </div>
            </div>
          </div>

          <!-- Session meta -->
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--mute);text-align:right;letter-spacing:.12em">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--cyan);box-shadow:0 0 8px var(--cyan);margin-right:8px;vertical-align:middle;animation:blink 1.6s infinite" />
            SESSION ACTIVE · ANALYSE TEMPS RÉEL<br/>
            <span style="opacity:.6">ID : {{ sessionId }} · {{ sessionDate }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section class="wrap" style="padding-top:56px;padding-bottom:48px;border-bottom:1px solid var(--line)">
      <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--cyan);letter-spacing:.25em;text-transform:uppercase">
            // rapport_001 — visiteur anonyme
          </div>
          <h2 style="font-family:'DM Sans',sans-serif;font-weight:500;font-size:clamp(30px,4.4vw,52px);line-height:1.05;margin:14px 0 18px;letter-spacing:-0.02em;color:var(--fg)">
            Vous pensez être <span style="color:var(--cyan)">anonyme</span>.<br/>
            Ce site sait déjà <span style="color:var(--cyan)">{{ dataPoints }} choses</span> sur vous.
          </h2>
          <p style="color:var(--mute-2);max-width:52ch;line-height:1.55;font-size:15px">
            Aucun cookie. Aucune permission. Aucun login. Une simple visite suffit à reconstruire votre identité technique avec une précision suffisante pour vous suivre à travers le web.
          </p>
          <div style="margin-top:28px;padding-top:18px;border-top:1px dashed var(--line-2);font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--mute);letter-spacing:.12em">
            <strong style="color:var(--fg);font-weight:500">COLLECTÉ EN {{ elapsedMs }}ms</strong>
            &nbsp;·&nbsp; SANS AUCUNE PERMISSION
            &nbsp;·&nbsp; 11 CATÉGORIES
            &nbsp;·&nbsp; {{ dataPoints }} POINTS DE DONNÉES
          </div>
        </div>

        <!-- Gauge card -->
        <div class="gauge-card">
          <div class="gauge">
            <svg viewBox="0 0 180 180" width="180" height="180">
              <circle cx="90" cy="90" r="78" fill="none" stroke="#1c1c28" stroke-width="10"/>
              <circle cx="90" cy="90" r="78" fill="none" :stroke="scoreColor" stroke-width="10"
                      stroke-linecap="round" transform="rotate(-90 90 90)"
                      :stroke-dasharray="490" :stroke-dashoffset="490 - (490 * displayScore / 100)"
                      style="transition:stroke-dashoffset 1.6s cubic-bezier(.22,.68,0,1.2),stroke 0.5s;filter:drop-shadow(0 0 8px rgba(255,59,48,0.5))"/>
              <g stroke="#2a2a38" stroke-width="1">
                <line x1="90" y1="6"  x2="90" y2="14"/>
                <line x1="90" y1="166" x2="90" y2="174"/>
                <line x1="6"  y1="90"  x2="14"  y2="90"/>
                <line x1="166" y1="90" x2="174" y2="90"/>
              </g>
            </svg>
            <div class="gauge-num" :style="{ color: scoreColor }">{{ displayScore }}</div>
            <div class="gauge-max">/ 100 · score de traçabilité</div>
          </div>

          <div class="gauge-info">
            <div class="gi-label">DIAGNOSTIC</div>
            <h3>Vous êtes hautement identifiable.</h3>
            <div class="verdict">
              <span class="vbadge">⚫ CRITIQUE</span> RISQUE DE RÉIDENTIFICATION
            </div>
            <ul>
              <li><span>Empreinte unique probable</span><span>1 sur 287k</span></li>
              <li><span>Données sensibles</span><span>{{ sensitiveCount }}</span></li>
              <li><span>Permissions demandées</span><span>0</span></li>
              <li><span>Temps d'analyse</span><span>{{ elapsedMs }}ms</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps<{ score: number; dataPoints: number; sensitiveCount: number }>()

const displayScore = ref(0)
const elapsedMs = ref(0)
const startTime = Date.now()

const sessionId = computed(() => {
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')
  return `${hex()}-${hex()}-${hex()}`
})
const sessionDate = computed(() => {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' }).format(new Date())
})

const scoreColor = computed(() => {
  const s = props.score
  if (s < 40) return '#2ecc71'
  if (s < 65) return '#ffd60a'
  if (s < 85) return '#ff9f0a'
  return '#ff3b30'
})

watch(() => props.score, (val) => {
  const start = displayScore.value
  const dur = 1600
  const startT = Date.now()
  function tick() {
    const el = Date.now() - startT
    const k = Math.min(1, el / dur)
    const eased = 1 - Math.pow(1 - k, 3)
    displayScore.value = Math.round(start + (val - start) * eased)
    if (k < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}, { immediate: true })

onMounted(() => {
  const timer = setInterval(() => {
    elapsedMs.value = Date.now() - startTime
    if (elapsedMs.value > 5000) clearInterval(timer)
  }, 100)
})
</script>
