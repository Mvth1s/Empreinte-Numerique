import { ref, onMounted } from 'vue'
import { shortHash } from '../utils/hash'

interface GPUAdapterInfoLike { vendor?: string; architecture?: string; device?: string; description?: string }
interface GPUAdapterLike {
  info?: GPUAdapterInfoLike
  requestAdapterInfo?: () => Promise<GPUAdapterInfoLike>
  features: Set<string>
}

declare global {
  interface Navigator {
    gpu?: { requestAdapter(opts?: { powerPreference?: string }): Promise<GPUAdapterLike | null> }
  }
}

export function useGPU() {
  const vendor = ref<string | null>(null)
  const renderer = ref<string | null>(null)
  const rendererSource = ref<'unmasked' | 'standard' | null>(null)
  const webgl2 = ref(false)
  const webgpu = ref(false)
  const webgpuInfo = ref<string | null>(null)
  const webgpuFeatures = ref<number | null>(null)
  const renderHash = ref<string | null>(null)
  const supportedTextureFormats = ref<string[]>([])
  const glExtensions = ref<number | null>(null)
  const maxTextureSize = ref<number | null>(null)

  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null
      if (!gl) return
      webgl2.value = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext

      // Chrome/Edge/Safari exposent le GPU réel via l'extension ; Firefox la retire
      // et renvoie directement un nom "assaini" dans RENDERER.
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const v = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string : ''
      const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string : ''
      if (r) {
        vendor.value = v || null
        renderer.value = r
        rendererSource.value = 'unmasked'
      } else {
        vendor.value = gl.getParameter(gl.VENDOR) as string || null
        renderer.value = gl.getParameter(gl.RENDERER) as string || null
        rendererSource.value = renderer.value ? 'standard' : null
      }

      glExtensions.value = gl.getSupportedExtensions()?.length ?? null
      maxTextureSize.value = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number

      const formats: string[] = []
      if (gl.getExtension('WEBGL_compressed_texture_s3tc')) formats.push('S3TC')
      if (gl.getExtension('WEBGL_compressed_texture_s3tc_srgb')) formats.push('S3TC sRGB')
      if (gl.getExtension('WEBGL_compressed_texture_etc1')) formats.push('ETC1')
      if (gl.getExtension('WEBGL_compressed_texture_etc')) formats.push('ETC2')
      if (gl.getExtension('WEBGL_compressed_texture_pvrtc')) formats.push('PVRTC')
      if (gl.getExtension('WEBGL_compressed_texture_astc')) formats.push('ASTC')
      if (gl.getExtension('EXT_texture_compression_bptc')) formats.push('BPTC')
      if (gl.getExtension('EXT_texture_compression_rgtc')) formats.push('RGTC')
      supportedTextureFormats.value = formats
    } catch { /* WebGL bloqué */ }
  }

  // Dégradés + fonctions trigonométriques en précision haute : les arrondis diffèrent selon GPU et pilote.
  async function computeRenderHash() {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 128
      const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: true })
      if (!gl) return

      const vsSource = `attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`
      const fsSource = `precision highp float;varying vec2 vUv;
        void main(){float a=sin(vUv.x*37.17+vUv.y*11.3)*cos(vUv.y*23.9);
        float b=fract(sin(dot(vUv,vec2(12.9898,78.233)))*43758.5453);
        gl_FragColor=vec4(a*.5+.5,b,pow(vUv.x,2.2)*exp(-vUv.y),1.);}`

      function makeShader(type: number, src: string) {
        const s = gl!.createShader(type)!
        gl!.shaderSource(s, src)
        gl!.compileShader(s)
        return s
      }

      const prog = gl.createProgram()!
      gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, vsSource))
      gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, fsSource))
      gl.linkProgram(prog)
      gl.useProgram(prog)

      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0.9, -0.8, -0.2, 1, 1, 1, -0.7, 0.3, 0.6, -1]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'aPos')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      const pixels = new Uint8Array(canvas.width * canvas.height * 4)
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      const digest = await crypto.subtle.digest('SHA-256', pixels)
      const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
      renderHash.value = shortHash(hex)
    } catch { /* WebGL indisponible */ }
  }

  // WebGPU expose directement fabricant + architecture (ex. "nvidia · ampere"), sans extension ni permission.
  async function getWebGPUInfo() {
    if (!navigator.gpu) return
    webgpu.value = true
    try {
      const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' })
      if (!adapter) return
      const info = adapter.info ?? (await adapter.requestAdapterInfo?.()) ?? {}
      const parts = [info.vendor, info.architecture, info.device, info.description].filter(Boolean)
      webgpuInfo.value = parts.length ? parts.join(' · ') : null
      webgpuFeatures.value = adapter.features.size
    } catch { /* adapter refusé */ }
  }

  onMounted(async () => {
    getWebGLInfo()
    await Promise.all([computeRenderHash(), getWebGPUInfo()])
  })

  return {
    vendor, renderer, rendererSource, webgl2, webgpu, webgpuInfo, webgpuFeatures,
    renderHash, supportedTextureFormats, glExtensions, maxTextureSize,
  }
}

