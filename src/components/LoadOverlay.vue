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

const props = withDefaults(defineProps<{
  visible: boolean
  kind: string
  text: string
  loaderData?: Record<string, string>
}>(), { loaderData: () => ({}) })
const emit = defineEmits<{ (e: 'skip'): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const DPR = Math.min(2, devicePixelRatio || 1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let stopFn: (() => void) | null = null

const CYAN = '#00e5ff'
const FAINT = 'rgba(0, 229, 255, 0.35)'
const DIM = 'rgba(0, 229, 255, 0.12)'

function clr(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = '#08080d'; ctx.fillRect(0, 0, W, H)
}

function startLoader(kind: string) {
  stopFn?.(); stopFn = null
  const c = canvasEl.value
  if (!c || !props.visible || reduced) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const W = c.offsetWidth || 700
  const H = c.offsetHeight || 300
  c.width = W * DPR; c.height = H * DPR
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
  const d = props.loaderData ?? {}

  switch (kind) {
    case 'radar':       stopFn = loaderRadar(ctx, W, H, d);       break
    case 'terminal':    stopFn = loaderTerminal(ctx, W, H, d);    break
    case 'clock':       stopFn = loaderClock(ctx, W, H, d);       break
    case 'scanner':     stopFn = loaderScanner(ctx, W, H, d);     break
    case 'wireframe':   stopFn = loaderWireframe(ctx, W, H, d);   break
    case 'hexrain':     stopFn = loaderHexrain(ctx, W, H);        break
    case 'diskbar':     stopFn = loaderDiskbar(ctx, W, H);        break
    case 'wifi':        stopFn = loaderWifi(ctx, W, H, d);        break
    case 'permissions': stopFn = loaderPermissions(ctx, W, H);    break
    case 'cursor':      stopFn = loaderCursor(ctx, W, H);         break
    case 'mapzoom':     stopFn = loaderMapzoom(ctx, W, H, d);     break
    default:            stopFn = loaderScanner(ctx, W, H, d)
  }
}

// ---- RADAR ----
function loaderRadar(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  let raf = 0
  const t0 = performance.now()
  const cx = W / 2, cy = H / 2
  function draw(now: number) {
    const t = (now - t0) / 1000
    clr(ctx, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1
    for (let r = 30; r < 400; r += 40) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(cx - 200, cy); ctx.lineTo(cx + 200, cy)
    ctx.moveTo(cx, cy - 140); ctx.lineTo(cx, cy + 140)
    ctx.stroke()
    for (let i = 0; i < 3; i++) {
      const p = ((t * 0.6) + i * 0.33) % 1
      ctx.strokeStyle = `rgba(0,229,255,${(1 - p) * 0.9})`; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cx, cy, p * 240, 0, Math.PI * 2); ctx.stroke()
    }
    const a = (t * 1.6) % (Math.PI * 2)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grad = (ctx as any).createConicGradient ? (ctx as any).createConicGradient(a, cx, cy) : null
    if (grad) {
      grad.addColorStop(0, 'rgba(0,229,255,0.0)')
      grad.addColorStop(0.05, 'rgba(0,229,255,0.4)')
      grad.addColorStop(0.1, 'rgba(0,229,255,0.0)')
      grad.addColorStop(1, 'rgba(0,229,255,0.0)')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(cx, cy, 230, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = CYAN
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = CYAN; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = FAINT; ctx.font = '11px "IBM Plex Mono", monospace'
    ctx.fillText(data.ip ?? '…', cx + 18, cy - 4)
    ctx.fillText(data.cityCountry ?? '…', cx + 18, cy + 12)
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- TERMINAL ----
function loaderTerminal(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  const tzShort = (data.tz ?? 'Europe/Paris').split(' · ')[0]
  const lines = [
    '> navigator.userAgent',
    `"${data.ua ?? 'Mozilla/5.0 …'}"`,
    `> navigator.platform        → "${data.platform ?? 'Win32'}"`,
    `> navigator.languages       → [${data.languages ?? '"fr-FR"'}]`,
    `> navigator.hardwareConcurrency → ${data.concurrency ?? '8'}`,
    `> navigator.deviceMemory    → ${data.deviceMemory ?? '8'}`,
    `> navigator.cookieEnabled   → ${data.cookies ?? 'true'}`,
    `> navigator.maxTouchPoints  → ${data.touch2 ?? '0'}`,
    `> navigator.doNotTrack      → ${data.dnt ?? 'null'}`,
    `> screen.width × height     → ${data.screenRes ?? '…'}`,
    `> screen.colorDepth         → ${data.screenColor ?? '24'}`,
    `> Intl.DateTimeFormat … timeZone → "${tzShort}"`,
    `> performance.memory.jsHeapSize → disponible`,
    `> navigator.plugins.length  → ${data.plugins ?? '0'}`,
    '✓ profil capturé.'
  ]
  let raf = 0
  const t0 = performance.now()
  let shown = 0, lastAdd = 0
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    if (now - lastAdd > 230 && shown < lines.length) { shown++; lastAdd = now }
    ctx.font = '13px "IBM Plex Mono", monospace'; ctx.textBaseline = 'top'
    const pad = 28, lh = 18
    for (let i = 0; i < shown; i++) {
      const y = pad + i * lh
      if (y > H - 30) continue
      const l = lines[i]
      ctx.fillStyle = l.startsWith('>') ? CYAN : l.startsWith('✓') ? '#6cd99a' : 'rgba(255,255,255,0.7)'
      ctx.fillText(l, pad, y)
    }
    if (shown < lines.length) {
      const y = pad + shown * lh
      if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = CYAN; ctx.fillRect(pad, y + 2, 8, 14) }
    }
    ctx.textBaseline = 'alphabetic'
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- CLOCK ----
function loaderClock(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  let raf = 0
  const t0 = performance.now()
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const cx = W / 2, cy = H / 2
    ctx.strokeStyle = DIM; ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      const off = (t * 60 + i * 22.5) % 360
      ctx.beginPath()
      ctx.ellipse(cx, cy, 60 + Math.sin(t + i) * 2, 90, off * Math.PI / 180, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.strokeStyle = FAINT
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.ellipse(cx, cy, 90, 18 + i * 18, 0, 0, Math.PI * 2); ctx.stroke()
    }
    const ox = cx + 160, oy = cy
    ctx.strokeStyle = CYAN; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(ox, oy, 60, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6
      ctx.beginPath()
      ctx.moveTo(ox + Math.cos(a) * 52, oy + Math.sin(a) * 52)
      ctx.lineTo(ox + Math.cos(a) * 58, oy + Math.sin(a) * 58)
      ctx.stroke()
    }
    const aH = t * 2.4, aM = t * 8
    ctx.strokeStyle = CYAN; ctx.lineCap = 'round'; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(ox, oy)
    ctx.lineTo(ox + Math.cos(aH - Math.PI / 2) * 28, oy + Math.sin(aH - Math.PI / 2) * 28); ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(ox, oy)
    ctx.lineTo(ox + Math.cos(aM - Math.PI / 2) * 44, oy + Math.sin(aM - Math.PI / 2) * 44); ctx.stroke()
    ctx.lineCap = 'butt'
    ctx.fillStyle = FAINT; ctx.font = '11px "IBM Plex Mono", monospace'
    ctx.fillText(data.tz ?? 'Europe/Paris · UTC +02:00', cx - 110, cy + 110)
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- SCANNER ----
function loaderScanner(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  let raf = 0
  const t0 = performance.now()
  const labels: [string, string, number][] = [
    ['ÉCRAN',    data.screen     ?? '…',   0.10],
    ['DPR',      data.dpr        ?? '…',   0.22],
    ['COULEURS', data.colorDepth ?? '…',   0.34],
    ['TACTILE',  data.touch      ?? 'non', 0.46],
    ['CPU',      data.cores      ?? '…',   0.58],
    ['RAM',      data.ram        ?? '…',   0.70],
    ['GPU',      data.gpu        ?? '…',   0.82],
  ]
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const period = 2.4
    const p = (t % period) / period
    const y = p * H
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    for (let i = 20; i < W; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke()
    }
    for (let i = 20; i < H; i += 30) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke()
    }
    const px = W / 2 - 110, py = 30, pw = 220, ph = 140
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1.5
    ctx.strokeRect(px, py, pw, ph)
    ctx.strokeRect(px + 80, py + ph, 60, 12)
    ctx.strokeRect(px + 50, py + ph + 12, 120, 8)
    const grad = ctx.createLinearGradient(0, y - 30, 0, y + 30)
    grad.addColorStop(0, 'rgba(0,229,255,0)')
    grad.addColorStop(0.5, 'rgba(0,229,255,0.5)')
    grad.addColorStop(1, 'rgba(0,229,255,0)')
    ctx.fillStyle = grad; ctx.fillRect(0, y - 30, W, 60)
    ctx.strokeStyle = CYAN; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
    ctx.font = '12px "IBM Plex Mono", monospace'
    labels.forEach(([k, v, anchor]) => {
      const ly = 40 + anchor * (H - 80)
      const lit = p > anchor
      ctx.fillStyle = lit ? CYAN : 'rgba(255,255,255,0.18)'
      ctx.fillText(k.padEnd(10, ' '), 20, ly)
      ctx.fillStyle = lit ? '#fff' : 'rgba(255,255,255,0.18)'
      ctx.fillText(v, 120, ly)
    })
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- WIREFRAME ----
function loaderWireframe(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  let raf = 0
  const t0 = performance.now()
  const V: [number, number, number][] = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
    [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]
  ]
  const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]]
  function project(v: [number, number, number], t: number, cx: number, cy: number): [number, number] {
    const ax = t * 0.6, ay = t * 0.9
    const [x, y, z] = v
    const X = x * Math.cos(ay) + z * Math.sin(ay)
    const Z = -x * Math.sin(ay) + z * Math.cos(ay)
    const Y = y * Math.cos(ax) - Z * Math.sin(ax)
    const Z2 = y * Math.sin(ax) + Z * Math.cos(ax)
    const s = 90 / (4 + Z2)
    return [cx + X * s * 4, cy + Y * s * 4]
  }
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const cx = W / 2, cy = H / 2
    ctx.strokeStyle = 'rgba(0,229,255,0.08)'; ctx.lineWidth = 1
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath()
      ctx.moveTo(cx + i * 40, cy + 80); ctx.lineTo(cx + i * 8, cy + 200); ctx.stroke()
    }
    for (let i = 1; i < 8; i++) {
      const fy = cy + 80 + i * 16, fw = 200 - i * 22
      ctx.beginPath(); ctx.moveTo(cx - fw, fy); ctx.lineTo(cx + fw, fy); ctx.stroke()
    }
    const points = V.map(v => project(v, t, cx, cy))
    const progress = Math.min(1, (t % 3.2) / 2.6)
    ctx.strokeStyle = CYAN; ctx.lineWidth = 2
    ctx.shadowColor = CYAN; ctx.shadowBlur = 8
    E.forEach((e, i) => {
      if (i / E.length > progress) return
      ctx.beginPath()
      ctx.moveTo(points[e[0]][0], points[e[0]][1])
      ctx.lineTo(points[e[1]][0], points[e[1]][1])
      ctx.stroke()
    })
    ctx.shadowBlur = 0
    points.forEach((p, i) => {
      if (i / points.length > progress + 0.1) return
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, Math.PI * 2); ctx.fill()
    })
    ctx.font = '11px "IBM Plex Mono", monospace'; ctx.fillStyle = FAINT
    ctx.fillText(`${data.glVersion ?? 'WebGL 2.0'}  ·  ${data.glVendor ?? 'ANGLE'}  ·  ${data.glRenderer ?? '…'}`, 28, H - 24)
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- HEXRAIN ----
function loaderHexrain(ctx: CanvasRenderingContext2D, W: number, H: number) {
  let raf = 0
  const t0 = performance.now()
  const hexChars = '0123456789abcdef'
  const drops = Array.from({ length: Math.floor(W / 14) }, () => ({
    y: Math.random() * H, v: 80 + Math.random() * 120, s: Math.random() * 1000
  }))
  let last = performance.now()
  function draw(now: number) {
    const dt = (now - last) / 1000; last = now
    ctx.fillStyle = 'rgba(8,8,13,0.18)'; ctx.fillRect(0, 0, W, H)
    const t = (now - t0) / 1000
    ctx.font = '13px "IBM Plex Mono", monospace'
    drops.forEach((d, i) => {
      d.y += d.v * dt
      if (d.y > H + 60) { d.y = -20; d.s = Math.random() * 1000 }
      for (let k = 0; k < 8; k++) {
        const ch = hexChars[Math.floor((t * 6 + d.s + k * 17) % 16)]
        const alpha = Math.max(0, 0.6 - k * 0.09)
        ctx.fillStyle = k === 0 ? '#fff' : `rgba(0,229,255,${alpha})`
        ctx.fillText(ch, i * 14 + 6, d.y - k * 16)
      }
    })
    const p = Math.min(1, t / 3)
    if (p > 0.5) {
      const target = 'a7f3 9c2d 4e81 b6f0'
      const ww = 220, x = W / 2 - ww / 2, y = H - 40
      ctx.fillStyle = 'rgba(8,8,13,0.85)'; ctx.fillRect(x - 14, y - 22, ww + 28, 36)
      ctx.strokeStyle = CYAN; ctx.lineWidth = 1; ctx.strokeRect(x - 14, y - 22, ww + 28, 36)
      const shown = Math.floor((p - 0.5) * 2 * target.length)
      ctx.fillStyle = CYAN; ctx.font = '16px "IBM Plex Mono", monospace'
      ctx.fillText(target.slice(0, shown), x, y)
    }
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- DISKBAR ----
function loaderDiskbar(ctx: CanvasRenderingContext2D, W: number, H: number) {
  let raf = 0
  const t0 = performance.now()
  const cols = 32, rows = 6
  const cellW = (W - 60) / cols, cellH = 14, startY = 60
  const lit = new Array(cols * rows).fill(0)
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const total = cols * rows
    const target = Math.min(total, Math.floor(t * total / 3))
    ctx.font = '11px "IBM Plex Mono", monospace'; ctx.fillStyle = FAINT
    ctx.fillText('SCAN STORAGE  /  localStorage  /  IndexedDB  /  Cache  /  Cookies', 30, 36)
    ctx.fillStyle = CYAN
    ctx.fillText(Math.floor((target / total) * 100) + ' %', W - 60, 36)
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols), col = i % cols
      const x = 30 + col * cellW, y = startY + r * (cellH + 6)
      let state = lit[i]
      if (i < target && state < 1) state = lit[i] = Math.min(1, state + 0.08)
      if (state > 0) {
        ctx.fillStyle = `rgba(0,229,255,${0.15 + state * 0.55})`
        ctx.fillRect(x, y, cellW - 4, cellH)
        if (state > 0.9 && Math.random() > 0.96) {
          ctx.fillStyle = '#fff'; ctx.fillRect(x, y, cellW - 4, cellH)
        }
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
        ctx.strokeRect(x, y, cellW - 4, cellH)
      }
    }
    const py = startY + rows * (cellH + 6) + 12
    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.strokeRect(30, py, W - 60, 8)
    ctx.fillStyle = CYAN; ctx.fillRect(30, py, (W - 60) * (target / total), 8)
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- WIFI ----
function loaderWifi(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  let raf = 0
  const t0 = performance.now()
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const cx = W / 2 - 60, cy = H / 2 + 20
    for (let i = 0; i < 4; i++) {
      ctx.lineWidth = 8 - i * 1.4
      ctx.strokeStyle = `rgba(0,229,255,${0.9 - i * 0.18})`
      ctx.beginPath(); ctx.arc(cx, cy, 20 + i * 32, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke()
    }
    ctx.fillStyle = CYAN; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill()
    const bx = W - 220, by = H / 2
    for (let i = 0; i < 6; i++) {
      const h = 12 + i * 14
      const v = Math.min(1, Math.max(0, Math.sin(t * 2 + i * 0.7) * 0.5 + 0.6))
      const x = bx + i * 22
      ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.strokeRect(x, by - h, 14, h)
      ctx.fillStyle = '#08080d'; ctx.fillRect(x, by - h, 14, h)
      ctx.fillStyle = `rgba(0,229,255,${v * 0.9})`; ctx.fillRect(x, by - h * v, 14, h * v)
    }
    ctx.fillStyle = FAINT; ctx.font = '11px "IBM Plex Mono", monospace'
    ctx.fillText(`SIGNAL  ·  ${data.connType ?? '4G'}  ·  RTT ${data.rtt ?? '…'}  ·  DOWN ${data.downlink ?? '…'}`, 30, H - 20)
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- PERMISSIONS ----
function loaderPermissions(ctx: CanvasRenderingContext2D, W: number, H: number) {
  let raf = 0
  const t0 = performance.now()
  const items = [
    { ico: '📷', label: 'Caméra', state: 'denied' },
    { ico: '🎤', label: 'Micro', state: 'denied' },
    { ico: '📍', label: 'GPS', state: 'prompt' },
    { ico: '🔔', label: 'Notif.', state: 'default' },
    { ico: '🔋', label: 'Batterie', state: 'granted' },
    { ico: '🔵', label: 'Bluetooth', state: 'prompt' }
  ]
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const gap = W / (items.length + 1)
    const y = H / 2
    items.forEach((it, i) => {
      const appear = Math.max(0, Math.min(1, (t - i * 0.35) / 0.4))
      if (appear <= 0) return
      const x = gap * (i + 1)
      ctx.strokeStyle = it.state === 'denied' ? '#ff3b30' : it.state === 'granted' ? '#6cd99a' : CYAN
      ctx.globalAlpha = appear; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI * 2); ctx.stroke()
      const sweep = ((t * 0.8 - i * 0.35) % 1)
      if (sweep > 0 && sweep < 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x - 38, y - 38 + sweep * 76); ctx.lineTo(x + 38, y - 38 + sweep * 76)
        ctx.stroke()
      }
      ctx.font = '28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'; ctx.fillText(it.ico, x, y - 2)
      ctx.fillStyle = FAINT; ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.fillText(it.label, x, y + 56)
      ctx.fillStyle = it.state === 'denied' ? '#ff3b30' : it.state === 'granted' ? '#6cd99a' : CYAN
      ctx.fillText(it.state.toUpperCase(), x, y + 72)
      ctx.globalAlpha = 1
    })
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- CURSOR ----
function loaderCursor(ctx: CanvasRenderingContext2D, W: number, H: number) {
  let raf = 0
  const t0 = performance.now()
  const trail: { x: number; y: number }[] = []
  function draw(now: number) {
    ctx.fillStyle = 'rgba(8,8,13,0.18)'; ctx.fillRect(0, 0, W, H)
    const t = (now - t0) / 1000
    const x = W / 2 + Math.sin(t * 0.9) * 200 + Math.sin(t * 2.3) * 60
    const y = H / 2 + Math.cos(t * 1.3) * 80 + Math.cos(t * 2.7) * 40
    trail.push({ x, y }); if (trail.length > 80) trail.shift()
    trail.forEach((p, i) => {
      const k = i / trail.length
      ctx.fillStyle = `rgba(0,229,255,${k * 0.6})`
      ctx.beginPath(); ctx.arc(p.x, p.y, 1 + k * 3, 0, Math.PI * 2); ctx.fill()
    })
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = CYAN; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
    for (let gx = 0; gx < W; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
    }
    for (let gy = 0; gy < H; gy += 40) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
    }
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

// ---- MAPZOOM ----
function loaderMapzoom(ctx: CanvasRenderingContext2D, W: number, H: number, data: Record<string, string>) {
  let raf = 0
  const t0 = performance.now()
  const rings = [
    { rMax: 260, label: `PAYS · ${data.country ?? '…'}` },
    { rMax: 160, label: `ISP · ${data.isp ?? '…'}` },
    { rMax: 80,  label: `VILLE · ${data.city ?? '…'}` },
    { rMax: 22,  label: 'POSITION · approx.' }
  ]
  function draw(now: number) {
    clr(ctx, W, H)
    const t = (now - t0) / 1000
    const cx = W / 2, cy = H / 2
    ctx.strokeStyle = 'rgba(0,229,255,0.08)'; ctx.lineWidth = 1
    for (let r = 30; r < 320; r += 28) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(cx - 250, cy + i * 24); ctx.lineTo(cx + 250, cy + i * 24); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + i * 38, cy - 120); ctx.lineTo(cx + i * 38, cy + 120); ctx.stroke()
    }
    const period = 3.2, p = (t % period) / period
    const idx = Math.floor(p * rings.length)
    const ring = rings[Math.min(idx, rings.length - 1)]
    const r = ring.rMax * (0.6 + (p * rings.length % 1) * 0.4)
    ctx.strokeStyle = CYAN; ctx.lineWidth = 2
    ctx.shadowColor = CYAN; ctx.shadowBlur = 14
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = CYAN; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '13px "IBM Plex Mono", monospace'
    ctx.fillText(ring.label, cx + 20, cy - 6)
    ctx.fillStyle = FAINT; ctx.font = '11px "IBM Plex Mono", monospace'
    ctx.fillText(`triangulation… ${Math.floor(p * 100)} %`, cx + 20, cy + 12)
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
  return () => cancelAnimationFrame(raf)
}

watch(() => [props.visible, props.kind] as const, ([vis]) => {
  if (vis) setTimeout(() => startLoader(props.kind), 50)
  else { stopFn?.(); stopFn = null }
})

onUnmounted(() => { stopFn?.() })
</script>
