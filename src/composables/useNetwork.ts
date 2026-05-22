import { ref, onMounted } from 'vue'
import type { GeoData } from '../types'

let _geoPromise: Promise<GeoData | null> | null = null

function fetchGeo(): Promise<GeoData | null> {
  if (_geoPromise) return _geoPromise
  _geoPromise = (async () => {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json')
      const { ip } = await ipRes.json()
      const fields = 'status,country,countryCode,regionName,city,lat,lon,isp,org,as,proxy,hosting,query'
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`)
      const geo: GeoData = await geoRes.json()
      geo.ip = ip
      return geo
    } catch {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const d = await res.json()
        return {
          ip: d.ip, country: d.country_name, countryCode: d.country_code,
          regionName: d.region, city: d.city, isp: d.org, org: d.org,
          as: d.asn, proxy: false, hosting: false, status: 'success',
        }
      } catch { return null }
    }
  })()
  return _geoPromise
}

export function useNetwork() {
  const publicIP = ref<string | null>(null)
  const country = ref<string | null>(null)
  const city = ref<string | null>(null)
  const isp = ref<string | null>(null)
  const asn = ref<string | null>(null)
  const isVPN = ref<boolean | null>(null)
  const isProxy = ref<boolean | null>(null)
  const localIPs = ref<string[]>([])
  const webrtcLeak = ref<string | null>(null)
  const dnsResolver = ref<string | null>(null)
  const lat = ref<number | null>(null)
  const lon = ref<number | null>(null)
  const loading = ref(true)

  async function loadGeo() {
    const geo = await fetchGeo()
    if (geo && geo.status === 'success') {
      publicIP.value = geo.ip
      country.value = `${geo.country} (${geo.countryCode})`
      city.value = `${geo.city}, ${geo.regionName}`
      isp.value = geo.isp
      asn.value = geo.as
      isProxy.value = geo.proxy
      isVPN.value = geo.hosting || geo.proxy
      if (geo.lat != null) lat.value = geo.lat
      if (geo.lon != null) lon.value = geo.lon
    } else if (geo) {
      publicIP.value = geo.ip
    }
    loading.value = false
  }

  function detectWebRTC() {
    try {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
      pc.createDataChannel('')
      pc.createOffer().then(o => pc.setLocalDescription(o))
      pc.onicecandidate = (e) => {
        if (!e?.candidate?.candidate) return
        const ipv4 = /([0-9]{1,3}\.){3}[0-9]{1,3}/.exec(e.candidate.candidate)
        const ipv6 = /([a-f0-9]{1,4}:){7}[a-f0-9]{1,4}/i.exec(e.candidate.candidate)
        const found = ipv4?.[0] ?? ipv6?.[0]
        if (found && !localIPs.value.includes(found)) {
          localIPs.value.push(found)
          if (!webrtcLeak.value || (!found.startsWith('192.168') && !found.startsWith('10.') && !found.startsWith('172.'))) {
            webrtcLeak.value = found
          }
        }
      }
      setTimeout(() => pc.close(), 5000)
    } catch { /* WebRTC non supporté */ }
  }

  async function detectDNS() {
    try {
      const res = await fetch('https://cloudflare-dns.com/dns-query?name=whoami.cloudflare.com&type=TXT', {
        headers: { Accept: 'application/dns-json' },
      })
      const data = await res.json()
      const answer = data?.Answer?.[0]?.data as string | undefined
      if (answer) {
        const match = /edns0-client-subnet\s+([0-9./]+)/.exec(answer)
        dnsResolver.value = match ? match[1] : answer.replace(/"/g, '')
      }
    } catch { /* CORS ou indisponible */ }
  }

  onMounted(() => {
    loadGeo()
    detectWebRTC()
    detectDNS()
  })

  return { publicIP, country, city, isp, asn, isVPN, isProxy, localIPs, webrtcLeak, dnsResolver, lat, lon, loading }
}
