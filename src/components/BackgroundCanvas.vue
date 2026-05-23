<template>
  <canvas id="bg-canvas" ref="canvasEl"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ kind: 'particles' | 'radar' | 'hexrain' | 'tron' | 'cursor' }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const DPR = Math.min(2, devicePixelRatio || 1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let stopFn: (() => void) | null = null
let animId = 0

function resize(c: HTMLCanvasElement) {
  c.width = innerWidth * DPR
  c.height = innerHeight * DPR
}

function start(kind: string) {
  stopFn?.()
  stopFn = null
  cancelAnimationFrame(animId)

  const c = canvasEl.value
  if (!c || reduced) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  resize(c)
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

  switch (kind) {
    case 'radar': stopFn = startRadar(c, ctx); break
    case 'hexrain': stopFn = startHexrain(c, ctx); break
    case 'tron': stopFn = startTron(c, ctx); break
    case 'cursor': stopFn = startCursor(c, ctx); break
    default: stopFn = startParticles(c, ctx)
  }
}

/* ---- Particles ---- */
function startParticles(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const W = () => c.width / DPR
  const H = () => c.height / DPR
  const pts = Array.from({ length: 60 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.5 + .4,
  }))

  let running = true
  const draw = () => {
    if (!running) return
    ctx.clearRect(0, 0, W(), H())
    ctx.fillStyle = 'rgba(0,229,255,0.55)'
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0
      if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < 100) {
          ctx.strokeStyle = `rgba(0,229,255,${.12 * (1 - d / 100)})`
          ctx.lineWidth = .5
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke()
        }
      }
    }
    animId = requestAnimationFrame(draw)
  }
  draw()
  return () => { running = false }
}

/* ---- Radar ---- */
function startRadar(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  let angle = 0, running = true
  const draw = () => {
    if (!running) return
    const W = c.width / DPR, H = c.height / DPR
    const cx = W / 2, cy = H / 2
    const R = Math.max(W, H) * .6
    ctx.clearRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(0,229,255,0.1)'
    ctx.lineWidth = 1
    for (let r = 80; r < R; r += 80) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
    }
    const grd = ctx.createConicalGradient ? null : null
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    const grad = ctx.createLinearGradient(0, 0, R, 0)
    grad.addColorStop(0, 'rgba(0,229,255,0.25)')
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.moveTo(0, 0)
    ctx.arc(0, 0, R, -Math.PI / 6, 0); ctx.closePath(); ctx.fill()
    ctx.restore()
    angle += .008
    animId = requestAnimationFrame(draw)
  }
  draw()
  return () => { running = false }
}

/* ---- Hexrain ---- */
function startHexrain(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const W = () => c.width / DPR, H = () => c.height / DPR
  const chars = '0123456789ABCDEF'
  const colW = 22
  let cols: number[] = []
  const reset = () => {
    cols = Array.from({ length: Math.ceil(innerWidth / colW) }, () => Math.random() * -50)
  }
  reset()
  let running = true
  const draw = () => {
    if (!running) return
    ctx.fillStyle = 'rgba(10,10,15,0.12)'
    ctx.fillRect(0, 0, W(), H())
    ctx.fillStyle = 'rgba(0,229,255,0.55)'
    ctx.font = `13px 'IBM Plex Mono', monospace`
    for (let i = 0; i < cols.length; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)]
      ctx.fillText(ch, i * colW, cols[i] * 18)
      if (cols[i] * 18 > H() && Math.random() > .975) cols[i] = 0
      cols[i]++
    }
    animId = requestAnimationFrame(draw)
  }
  draw()
  return () => { running = false }
}

/* ---- Tron grid ---- */
function startTron(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const W = () => c.width / DPR, H = () => c.height / DPR
  let offset = 0, running = true
  const draw = () => {
    if (!running) return
    ctx.clearRect(0, 0, W(), H())
    ctx.strokeStyle = 'rgba(0,229,255,0.07)'
    ctx.lineWidth = 1
    const step = 60
    for (let x = (offset % step); x < W(); x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H()); ctx.stroke()
    }
    for (let y = (offset % step); y < H(); y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W(), y); ctx.stroke()
    }
    offset += .5
    animId = requestAnimationFrame(draw)
  }
  draw()
  return () => { running = false }
}

/* ---- Cursor trail ---- */
function startCursor(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const W = () => c.width / DPR, H = () => c.height / DPR
  const trail: { x: number; y: number; a: number }[] = []
  let running = true

  const onMove = (e: MouseEvent) => trail.push({ x: e.clientX, y: e.clientY, a: 1 })

  const draw = () => {
    if (!running) return
    ctx.clearRect(0, 0, W(), H())
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i]
      ctx.fillStyle = `rgba(0,229,255,${t.a * .4})`
      ctx.beginPath(); ctx.arc(t.x, t.y, 3 * t.a, 0, Math.PI * 2); ctx.fill()
      t.a -= .025
      if (t.a <= 0) trail.splice(i, 1)
    }
    animId = requestAnimationFrame(draw)
  }
  window.addEventListener('mousemove', onMove)
  draw()
  return () => { running = false; window.removeEventListener('mousemove', onMove) }
}

const onResize = () => {
  const c = canvasEl.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  resize(c)
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
}

onMounted(() => {
  start(props.kind)
  window.addEventListener('resize', onResize)
})

watch(() => props.kind, (k) => start(k))

onUnmounted(() => {
  stopFn?.()
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', onResize)
})
</script>
