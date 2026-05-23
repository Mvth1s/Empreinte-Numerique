<template>
  <canvas id="bg-canvas" ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

type BgKind = 'particles' | 'radar' | 'hexrain' | 'tron' | 'cursor' |
              'terminal' | 'clock' | 'scan' | 'blocks' | 'wave' | 'rings' | 'map'

const props = defineProps<{ kind: BgKind }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let DPR = Math.min(2, devicePixelRatio || 1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let W = 0, H = 0
let raf = 0
let current = 'particles'

let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = []
let pulses:    { x: number; y: number; t: number; period: number }[] = []
let drops:     { y: number; v: number; s: number }[] = []
let blockCells: number[] = []
let ringPos:   { x: number; y: number; offset: number }[] = []
const trail: { x: number; y: number }[] = []

// --- terminal state ---
const termLines = [
  'navigator.userAgent', 'navigator.platform', 'screen.width × height',
  'Intl.DateTimeFormat().timeZone', 'navigator.languages', 'navigator.hardwareConcurrency',
  'navigator.cookieEnabled', 'navigator.plugins.length', 'window.devicePixelRatio',
  'navigator.doNotTrack', 'navigator.userAgentData.brands', 'navigator.pdfViewerEnabled',
]

function resize() {
  DPR = Math.min(2, devicePixelRatio || 1)
  W = innerWidth; H = innerHeight
  const c = canvasEl.value; if (!c) return
  c.width = W * DPR; c.height = H * DPR
  c.style.width = W + 'px'; c.style.height = H + 'px'
  const ctx = c.getContext('2d')
  if (ctx) ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
}

function initParticles() {
  const count = innerWidth < 768 ? 28 : 60
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
    r: 0.6 + Math.random() * 1.2,
  }))
}
function initPulses() {
  pulses = Array.from({ length: 5 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    t: Math.random() * 5, period: 4 + Math.random() * 3,
  }))
}
function initDrops() {
  drops = Array.from({ length: Math.floor(W / 18) }, () => ({
    y: Math.random() * H, v: 10 + Math.random() * 20, s: Math.random() * 1000,
  }))
}
function initBlocks() {
  const cols = Math.ceil(W / 28), rows = Math.ceil(H / 20)
  blockCells = Array.from({ length: cols * rows }, () => Math.random())
}
function initRings() {
  ringPos = Array.from({ length: 7 }, () => ({
    x: W * (0.08 + Math.random() * 0.84),
    y: H * (0.08 + Math.random() * 0.84),
    offset: Math.random() * 5,
  }))
}

function getCtx() { return canvasEl.value?.getContext('2d') ?? null }

// ---- particles ----
function drawParticles() {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
  })
  ctx.strokeStyle = 'rgba(0,229,255,0.06)'; ctx.lineWidth = 1
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j]
      const dx = a.x - b.x, dy = a.y - b.y
      const d2 = dx * dx + dy * dy
      if (d2 < 18000) {
        ctx.globalAlpha = 1 - d2 / 18000
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
      }
    }
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = 'rgba(0,229,255,0.5)'
  particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill() })
}

// ---- radar ----
function drawRadar(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.fillStyle = 'rgba(10,10,15,0.12)'; ctx.fillRect(0, 0, W, H)
  const t = now / 1000
  pulses.forEach(p => {
    const phase = ((t + p.t) % p.period) / p.period
    ctx.strokeStyle = `rgba(0,229,255,${(1 - phase) * 0.18})`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(p.x, p.y, phase * 240, 0, Math.PI * 2); ctx.stroke()
  })
}

// ---- hexrain ----
function drawHexRain(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.fillStyle = 'rgba(10,10,15,0.08)'; ctx.fillRect(0, 0, W, H)
  ctx.font = '13px "IBM Plex Mono", monospace'
  const t = now / 1000
  const hexChars = '0123456789abcdef'
  drops.forEach((d, i) => {
    d.y += d.v * 0.05
    if (d.y > H + 20) { d.y = -20; d.s = Math.random() * 1000 }
    const ch = hexChars[Math.floor((t * 0.6 + d.s) % 16)]
    ctx.fillStyle = 'rgba(0,229,255,0.05)'
    ctx.fillText(ch, i * 18 + 6, d.y)
  })
}

// ---- tron ----
function drawTron(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const t = now / 1000
  const horizonY = H * 0.55, vp = W / 2
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(0,229,255,0.10)'
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath(); ctx.moveTo(vp + i * 60, horizonY); ctx.lineTo(vp + i * 360, H + 60); ctx.stroke()
  }
  const speed = 30
  for (let i = 0; i < 18; i++) {
    const z = ((t * speed + i * 22) % 220) / 220
    const y = horizonY + Math.pow(z, 1.6) * (H - horizonY + 40)
    ctx.strokeStyle = `rgba(0,229,255,${z * 0.15})`
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  const grad = ctx.createLinearGradient(0, horizonY - 40, 0, horizonY + 4)
  grad.addColorStop(0, 'rgba(0,229,255,0)')
  grad.addColorStop(1, 'rgba(0,229,255,0.10)')
  ctx.fillStyle = grad; ctx.fillRect(0, horizonY - 40, W, 44)
}

// ---- cursor ----
function drawCursor() {
  const ctx = getCtx(); if (!ctx) return
  ctx.fillStyle = 'rgba(10,10,15,0.18)'; ctx.fillRect(0, 0, W, H)
  trail.forEach((p, i) => {
    const k = i / trail.length
    ctx.fillStyle = `rgba(0,229,255,${k * 0.18})`
    ctx.beginPath(); ctx.arc(p.x, p.y, 1 + k * 2, 0, Math.PI * 2); ctx.fill()
  })
  if (trail.length === 0) drawParticles()
}

// ---- terminal ----
function drawTerminal(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.fillStyle = 'rgba(10,10,15,0.04)'; ctx.fillRect(0, 0, W, H)
  ctx.font = '12px "IBM Plex Mono", monospace'
  const t = now / 1000
  const cols = Math.max(1, Math.floor(W / 220))
  for (let c = 0; c < cols; c++) {
    const x = c * (W / cols) + 16
    const speed = 16 + c * 5
    const offset = (t * speed) % ((termLines.length + 2) * 22)
    termLines.forEach((line, i) => {
      const y = (i * 22 - offset + H + termLines.length * 22) % (H + termLines.length * 22) - 22
      if (y < -22 || y > H + 22) return
      ctx.fillStyle = `rgba(0,229,255,0.045)`
      ctx.fillText(line, x, y)
    })
  }
}

// ---- clock ----
function drawClock(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const t = now / 1000
  const cx = W / 2, cy = H / 2
  ctx.lineWidth = 1
  for (let i = 0; i < 7; i++) {
    const angle = t * (0.06 + i * 0.025) + i * Math.PI / 7
    ctx.strokeStyle = 'rgba(0,229,255,0.05)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, 60 + i * 55, 100 + i * 25, angle, 0, Math.PI * 2)
    ctx.stroke()
  }
  const r = Math.min(W, H) * 0.14
  ctx.strokeStyle = 'rgba(0,229,255,0.09)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  const aH = (t * 0.08) % (Math.PI * 2)
  const aM = (t * 0.9) % (Math.PI * 2)
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'rgba(0,229,255,0.14)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(aH - Math.PI / 2) * r * 0.5, cy + Math.sin(aH - Math.PI / 2) * r * 0.5); ctx.stroke()
  ctx.strokeStyle = 'rgba(0,229,255,0.10)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(aM - Math.PI / 2) * r * 0.8, cy + Math.sin(aM - Math.PI / 2) * r * 0.8); ctx.stroke()
  ctx.lineCap = 'butt'
}

// ---- scan ----
function drawScan(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(0,229,255,0.03)'; ctx.lineWidth = 1
  for (let y = 0; y < H; y += 32) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  for (let x = 0; x < W; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  const t = now / 1000
  const scanY = (t * 70) % (H + 60) - 30
  const grad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40)
  grad.addColorStop(0, 'rgba(0,229,255,0)')
  grad.addColorStop(0.5, 'rgba(0,229,255,0.07)')
  grad.addColorStop(1, 'rgba(0,229,255,0)')
  ctx.fillStyle = grad; ctx.fillRect(0, scanY - 40, W, 80)
}

// ---- blocks ----
function drawBlocks(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const t = now / 1000
  const cw = 28, ch = 20
  const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      const base = blockCells[idx] ?? Math.random()
      const flicker = (Math.sin(t * (0.8 + base * 1.6) + base * 12) + 1) / 2
      const alpha = flicker * 0.055
      ctx.fillStyle = `rgba(0,229,255,${alpha})`
      ctx.fillRect(c * cw + 1, r * ch + 1, cw - 3, ch - 3)
    }
  }
}

// ---- wave ----
function drawWave(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const t = now / 1000
  const cx = W / 2, cy = H / 2
  const maxR = Math.sqrt(cx * cx + cy * cy) * 1.1
  for (let i = 0; i < 10; i++) {
    const phase = ((t * 0.3 + i * 0.7) % 5) / 5
    const r = phase * maxR
    ctx.strokeStyle = `rgba(0,229,255,${(1 - phase) * 0.09})`
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }
}

// ---- rings ----
function drawRings(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const t = now / 1000
  ringPos.forEach(pos => {
    for (let k = 0; k < 3; k++) {
      const phase = ((t * 0.4 + pos.offset + k * 1.2) % 4) / 4
      ctx.strokeStyle = `rgba(0,229,255,${(1 - phase) * 0.11})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(pos.x, pos.y, phase * 160, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.fillStyle = 'rgba(0,229,255,0.08)'
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2); ctx.fill()
  })
}

// ---- map ----
function drawMap(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const cx = W / 2, cy = H / 2
  ctx.strokeStyle = 'rgba(0,229,255,0.045)'; ctx.lineWidth = 1
  for (let r = 40; r < 700; r += 55) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'
  for (let x = 0; x < W; x += 42) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 42) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  const t = now / 1000
  const pulse = (Math.sin(t * 2.2) + 1) / 2
  ctx.strokeStyle = `rgba(0,229,255,${0.06 + pulse * 0.10})`
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(cx, cy, 10 + pulse * 8, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = `rgba(0,229,255,${0.18 + pulse * 0.12})`
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill()
}

function tick(now: number) {
  if (current === 'particles')  drawParticles()
  else if (current === 'radar') { drawParticles(); drawRadar(now) }
  else if (current === 'hexrain')  drawHexRain(now)
  else if (current === 'tron')     drawTron(now)
  else if (current === 'cursor')   drawCursor()
  else if (current === 'terminal') drawTerminal(now)
  else if (current === 'clock')    drawClock(now)
  else if (current === 'scan')     drawScan(now)
  else if (current === 'blocks')   drawBlocks(now)
  else if (current === 'wave')     drawWave(now)
  else if (current === 'rings')    drawRings(now)
  else if (current === 'map')      drawMap(now)
  raf = requestAnimationFrame(tick)
}

function start(kind: string) {
  current = kind || 'particles'
  cancelAnimationFrame(raf)
  if (reduced) {
    const ctx = getCtx()
    if (ctx) {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(0,229,255,0.04)'
      for (let i = 0; i < 30; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
    }
    return
  }
  trail.length = 0
  initParticles(); initPulses(); initDrops(); initBlocks(); initRings()
  raf = requestAnimationFrame(tick)
}

const onMouseMove = (e: MouseEvent) => {
  if (current === 'cursor' && !reduced) {
    trail.push({ x: e.clientX, y: e.clientY })
    if (trail.length > 80) trail.shift()
  }
}

onMounted(() => { resize(); start(props.kind); window.addEventListener('mousemove', onMouseMove); window.addEventListener('resize', resize) })
watch(() => props.kind, (k) => start(k))
onUnmounted(() => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('resize', resize) })
</script>
