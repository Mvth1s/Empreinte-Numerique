import { ref, onMounted } from 'vue'
import { sha256, shortHash } from '../utils/hash'

export function useGPU() {
  const vendor = ref<string | null>(null)
  const renderer = ref<string | null>(null)
  const webgl2 = ref(false)
  const webgpu = ref(false)
  const renderHash = ref<string | null>(null)
  const supportedTextureFormats = ref<string[]>([])

  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
      if (!gl) return

      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      if (ext) {
        vendor.value = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string
        renderer.value = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
      }

      webgl2.value = !!document.createElement('canvas').getContext('webgl2')

      const formats: string[] = []
      if (gl.getExtension('WEBGL_compressed_texture_s3tc')) formats.push('S3TC')
      if (gl.getExtension('WEBGL_compressed_texture_etc1')) formats.push('ETC1')
      if (gl.getExtension('WEBGL_compressed_texture_pvrtc')) formats.push('PVRTC')
      if (gl.getExtension('WEBGL_compressed_texture_astc')) formats.push('ASTC')
      if (gl.getExtension('EXT_texture_compression_bptc')) formats.push('BPTC')
      supportedTextureFormats.value = formats
    } catch { /* WebGL bloqué */ }
  }

  async function computeRenderHash() {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 150
      const gl = canvas.getContext('webgl')
      if (!gl) return

      const vsSource = `attribute vec4 aPos;void main(){gl_Position=aPos;}`
      const fsSource = `precision mediump float;void main(){gl_FragColor=vec4(0.1,0.6,1.0,1.0);}`

      function makeShader(type: number, src: string) {
        const s = gl.createShader(type)!
        gl.shaderSource(s, src)
        gl.compileShader(s)
        return s
      }

      const prog = gl.createProgram()!
      gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, vsSource))
      gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, fsSource))
      gl.linkProgram(prog)
      gl.useProgram(prog)

      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5,-0.5, 0.5,-0.5, 0,0.5]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'aPos')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      const pixels = new Uint8Array(canvas.width * canvas.height * 4)
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      const sample = Array.from(pixels.slice(0, 64)).join(',')
      const h = await sha256(sample)
      renderHash.value = shortHash(h)
    } catch { /* WebGL indisponible */ }
  }

  onMounted(async () => {
    getWebGLInfo()
    await computeRenderHash()
    webgpu.value = 'gpu' in navigator
  })

  return { vendor, renderer, webgl2, webgpu, renderHash, supportedTextureFormats }
}
