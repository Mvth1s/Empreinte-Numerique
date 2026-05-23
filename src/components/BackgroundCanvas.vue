<template>
  <canvas id="bg-canvas" ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ kind: 'particles' | 'radar' | 'hexrain' | 'tron' | 'cursor' }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let DPR = Math.min(2, devicePixelRatio || 1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let W = 0, H = 0
let raf = 0
let current = 'particles'

let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = []
let pulses: { x: number; y: number; t: number; period: number }[] = []
let drops: { y: number; v: number; s: number }[] = []
const trail: { x: number; y: number }[] = []

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
    r: 0.6 + Math.random() * 1.2
  }))
}

function initPulses() {
  pulses = Array.from({ length: 5 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    t: Math.random() * 5, period: 4 + Math.random() * 3
  }))
}

function initDrops() {
  drops = Array.from({ length: Math.floor(W / 18) }, () => ({
    y: Math.random() * H, v: 10 + Math.random() * 20, s: Math.random() * 1000
  }))
}

function getCtx() { return canvasEl.value?.getContext('2d') ?? null }

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

function drawTron(now: number) {
  const ctx = getCtx(); if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  const t = now / 1000
  const horizonY = H * 0.55
  const vp = W / 2
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(0,229,255,0.10)'
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath()
    ctx.moveTo(vp + i * 60, horizonY); ctx.lineTo(vp + i * 360, H + 60)
    ctx.stroke()
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

function tick(now: number) {
  if (current === 'particles') drawParticles()
  else if (current === 'radar') { drawParticles(); drawRadar(now) }
  else if (current === 'hexrain') drawHexRain(now)
  else if (current === 'tron') drawTron(now)
  else if (current === 'cursor') drawCursor()
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
  initParticles(); initPulses(); initDrops()
  raf = requestAnimationFrame(tick)
}

const onMouseMove = (e: MouseEvent) => {
  if (current === 'cursor' && !reduced) {
    trail.push({ x: e.clientX, y: e.clientY })
    if (trail.length > 80) trail.shift()
  }
}

const onResize = () => { resize() }

onMounted(() => {
  resize()
  start(props.kind)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)
})

watch(() => props.kind, (k) => start(k))

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
})
</script>
