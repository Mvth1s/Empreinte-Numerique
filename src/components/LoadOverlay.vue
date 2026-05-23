<template>
  <div :class="['load-overlay', { visible }]">
    <div class="load-canvas-wrap">
      <canvas id="load-canvas" ref="canvasEl"></canvas>
    </div>
    <div class="load-foot">
      <span>{{ text }}</span>
      <span class="dots"></span>
      <button class="load-skip" id="load-skip" @click="emit('skip')">Passer →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  kind: string
  text: string
}>()

const emit = defineEmits<{ (e: 'skip'): void }>()
const canvasEl = ref<HTMLCanvasElement | null>(null)
const DPR = Math.min(2, devicePixelRatio || 1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let stopFn: (() => void) | null = null
let animId = 0

function startLoader(kind: string) {
  stopFn?.()
  stopFn = null
  cancelAnimationFrame(animId)
  const c = canvasEl.value
  if (!c || !props.visible || reduced) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  const W = c.offsetWidth || 700
  const H = c.offsetHeight || 300
  c.width = W * DPR
  c.height = H * DPR
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

  switch (kind) {
    case 'radar': stopFn = loaderRadar(c, ctx, W, H); break
    case 'terminal': stopFn = loaderTerminal(c, ctx, W, H); break
    case 'clock': stopFn = loaderClock(c, ctx, W, H); break
    case 'scanner': stopFn = loaderScanner(c, ctx, W, H); break
    case 'wireframe': stopFn = loaderWireframe(c, ctx, W, H); break
    case 'hexrain': stopFn = loaderHexrain(c, ctx, W, H); break
    case 'diskbar': stopFn = loaderDiskbar(c, ctx, W, H); break
    case 'wifi': stopFn = loaderWifi(c, ctx, W, H); break
    case 'permissions': stopFn = loaderPermissions(c, ctx, W, H); break
    case 'cursor': stopFn = loaderCursor(c, ctx, W, H); break
    case 'mapzoom': stopFn = loaderMapzoom(c, ctx, W, H); break
    default: stopFn = loaderScanner(c, ctx, W, H)
  }
}

function loaderRadar(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let angle = 0, running = true
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * .4
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(0,229,255,0.15)'
    ctx.lineWidth = 1
    for (let r = R * .33; r <= R; r += R * .33) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(0,229,255,0.08)'
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke()
    }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle)
    const grad = ctx.createLinearGradient(0, 0, R, 0)
    grad.addColorStop(0, 'rgba(0,229,255,0.4)')
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.moveTo(0, 0)
    ctx.arc(0, 0, R, -Math.PI / 5, 0); ctx.closePath(); ctx.fill()
    ctx.restore()
    ctx.fillStyle = 'rgba(0,229,255,0.9)'
    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill()
    angle += .04
    animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderTerminal(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  const lines = [
    '> Initialisation analyse réseau…',
    '> ip.ipify.org → 200 OK',
    '> RTCPeerConnection → STUN resolve',
    '> WebRTC ICE candidates: 3 found',
    '> DNS resolver: Cloudflare (1.1.1.1)',
    '> Collecte terminée.',
  ]
  let lineIdx = 0, charIdx = 0, running = true
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    ctx.font = "14px 'IBM Plex Mono', monospace"
    const displayed = lines.slice(0, lineIdx)
    if (lineIdx < lines.length) displayed.push(lines[lineIdx].slice(0, charIdx))
    displayed.forEach((l, i) => {
      ctx.fillStyle = i < lineIdx ? 'rgba(0,229,255,0.5)' : 'rgba(0,229,255,0.9)'
      ctx.fillText(l, 24, 40 + i * 34)
    })
    if (lineIdx < lines.length) {
      if (charIdx < lines[lineIdx].length) charIdx++
      else { charIdx = 0; lineIdx++ }
    } else {
      lineIdx = 0; charIdx = 0
    }
    animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderClock(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let angle = 0, running = true
  const cx = W / 2, cy = H / 2, R = Math.min(W, H) * .35
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(0,229,255,0.2)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * (R - 10), cy + Math.sin(a) * (R - 10))
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R)
      ctx.strokeStyle = 'rgba(0,229,255,0.4)'; ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(0,229,255,0.8)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle - Math.PI / 2) * R * .65, cy + Math.sin(angle - Math.PI / 2) * R * .65)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(0,229,255,1)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle * 12 - Math.PI / 2) * R * .85, cy + Math.sin(angle * 12 - Math.PI / 2) * R * .85)
    ctx.stroke()
    angle += .01
    animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderScanner(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let y = 0, dir = 1, running = true
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    const grad = ctx.createLinearGradient(0, y - 30, 0, y + 30)
    grad.addColorStop(0, 'transparent')
    grad.addColorStop(.5, 'rgba(0,229,255,0.5)')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad; ctx.fillRect(0, y - 30, W, 60)
    ctx.fillStyle = 'rgba(0,229,255,0.85)'
    ctx.fillRect(0, y - 1, W, 2)
    y += 2 * dir
    if (y > H || y < 0) dir *= -1
    animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderWireframe(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let t = 0, running = true
  const pts3d = Array.from({ length: 8 }, (_, i) => ({
    x: (i & 1 ? 1 : -1) * 80,
    y: (i & 2 ? 1 : -1) * 80,
    z: (i & 4 ? 1 : -1) * 80,
  }))
  const edges = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]]
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    const cos = Math.cos(t), sin = Math.sin(t)
    const proj = pts3d.map(p => {
      const rx = p.x * cos - p.z * sin
      const rz = p.x * sin + p.z * cos
      const scale = 350 / (350 + rz)
      return { x: W / 2 + rx * scale, y: H / 2 + p.y * scale }
    })
    ctx.strokeStyle = 'rgba(0,229,255,0.5)'; ctx.lineWidth = 1
    for (const [a, b] of edges) {
      ctx.beginPath(); ctx.moveTo(proj[a].x, proj[a].y); ctx.lineTo(proj[b].x, proj[b].y); ctx.stroke()
    }
    t += .02; animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderHexrain(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  const chars = '0123456789ABCDEF'
  const colW = 22
  const cols = Array.from({ length: Math.ceil(W / colW) }, () => Math.random() * -30)
  let running = true
  const draw = () => {
    if (!running) return
    ctx.fillStyle = 'rgba(8,8,13,0.15)'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(0,229,255,0.7)'
    ctx.font = "13px 'IBM Plex Mono', monospace"
    for (let i = 0; i < cols.length; i++) {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * colW + 4, cols[i] * 18)
      if (cols[i] * 18 > H && Math.random() > .975) cols[i] = 0
      cols[i]++
    }
    animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderDiskbar(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let t = 0, running = true
  const bars = ['localStorage', 'sessionStorage', 'IndexedDB', 'Cache API', 'CookieStorage']
  const targets = [0.72, 0.45, 0.88, 0.31, 0.15]
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    ctx.font = "12px 'IBM Plex Mono', monospace"
    bars.forEach((name, i) => {
      const y = 50 + i * 44
      const fill = Math.min(targets[i], (t - i * .15))
      ctx.fillStyle = 'rgba(0,229,255,0.2)'
      ctx.fillRect(160, y, W - 200, 18)
      ctx.fillStyle = 'rgba(0,229,255,0.7)'
      ctx.fillRect(160, y, (W - 200) * Math.max(0, fill), 18)
      ctx.fillStyle = 'rgba(0,229,255,0.5)'
      ctx.fillText(name, 10, y + 13)
      ctx.fillStyle = 'rgba(0,229,255,0.9)'
      ctx.fillText(Math.round(Math.max(0, fill) * 100) + '%', W - 36, y + 13)
    })
    t += .008; if (t > 1.5) t = 0
    animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderWifi(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let t = 0, running = true
  const cx = W / 2, cy = H / 2 + 60
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    const bars = 4
    for (let i = 0; i < bars; i++) {
      const lit = (Math.floor(t * 2) % (bars + 1)) > i
      ctx.strokeStyle = lit ? 'rgba(0,229,255,0.9)' : 'rgba(0,229,255,0.15)'
      ctx.lineWidth = 3
      const r = 30 + i * 30
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * .75, -Math.PI * .25); ctx.stroke()
    }
    ctx.fillStyle = 'rgba(0,229,255,0.9)'
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill()
    t += .03; animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderPermissions(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  const icons = ['📍', '📷', '🎤', '🔔', '📋', '💾', '🎹']
  let t = 0, running = true
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    const lit = Math.floor(t) % icons.length
    ctx.font = '32px sans-serif'
    icons.forEach((ico, i) => {
      const x = W / 2 + (i - icons.length / 2 + .5) * 70
      ctx.globalAlpha = i === lit ? 1 : 0.2
      ctx.fillText(ico, x - 16, H / 2 + 12)
    })
    ctx.globalAlpha = 1
    t += .06; animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderCursor(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let t = 0, running = true
  const trail: { x: number; y: number; a: number }[] = []
  const draw = () => {
    if (!running) return
    ctx.fillStyle = 'rgba(8,8,13,0.18)'; ctx.fillRect(0, 0, W, H)
    const x = W / 2 + Math.cos(t) * W * .3
    const y = H / 2 + Math.sin(t * 1.3) * H * .3
    trail.push({ x, y, a: 1 })
    if (trail.length > 40) trail.shift()
    trail.forEach((p, i) => {
      ctx.fillStyle = `rgba(0,229,255,${p.a * .6})`
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.a, 0, Math.PI * 2); ctx.fill()
      p.a -= .025
    })
    t += .04; animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

function loaderMapzoom(c: HTMLCanvasElement, ctx: CanvasRenderingContext2D, W: number, H: number) {
  let t = 0, running = true
  const cx = W / 2, cy = H / 2
  const draw = () => {
    if (!running) return
    ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
    const scale = 1 + (t % 1) * .5
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale)
    for (let i = 1; i <= 4; i++) {
      const r = i * 40
      ctx.strokeStyle = `rgba(0,229,255,${.6 / i})`; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke()
      if (i < 4) {
        ctx.strokeStyle = 'rgba(0,229,255,0.08)'
        ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke()
      }
    }
    ctx.restore()
    ctx.fillStyle = 'rgba(0,229,255,0.9)'; ctx.font = '18px sans-serif'
    ctx.fillText('📍', cx - 9, cy + 7)
    t += .01; animId = requestAnimationFrame(draw)
  }
  draw(); return () => { running = false }
}

watch(() => [props.visible, props.kind] as const, ([vis]) => {
  if (vis) {
    setTimeout(() => startLoader(props.kind), 50)
  } else {
    stopFn?.(); stopFn = null
    cancelAnimationFrame(animId)
  }
})

onUnmounted(() => {
  stopFn?.()
  cancelAnimationFrame(animId)
})
</script>
