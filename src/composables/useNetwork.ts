import { ref, computed, onMounted } from 'vue'
import type { GeoData } from '../types'

let _geoPromise: Promise<GeoData | null> | null = null
let _ipPromise: Promise<{ v4: string | null; v6: string | null }> | null = null
let _dnsPromise: Promise<DnsInfo | null> | null = null
let _rtcPromise: Promise<RtcInfo> | null = null

interface DnsInfo { ip: string; geo: string; ecs: string | null }
interface RtcInfo { local: string[]; publicIPs: string[]; mdns: boolean; supported: boolean }

async function getJSON(url: string, timeout = 6000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout), credentials: 'omit' })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

// IPv4 et IPv6 interrogés séparément : un navigateur double-stack expose les deux.
function fetchIPs() {
  if (_ipPromise) return _ipPromise
  _ipPromise = Promise.all([
    getJSON('https://api4.ipify.org?format=json', 5000).then(d => d.ip as string).catch(() => null),
    getJSON('https://api6.ipify.org?format=json', 5000).then(d => d.ip as string).catch(() => null),
  ]).then(([v4, v6]) => ({ v4, v6 }))
  return _ipPromise
}

function fetchGeo(): Promise<GeoData | null> {
  if (_geoPromise) return _geoPromise
  _geoPromise = (async () => {
    // ip-api.com free tier is HTTP-only — skip on HTTPS to avoid mixed-content block
    if (location.protocol !== 'https:') {
      try {
        const fields = 'status,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query'
        const geo = await getJSON(`http://ip-api.com/json/?fields=${fields}`)
        if (geo.status === 'success') {
          return { ...geo, ip: geo.query, postal: geo.zip, flagged: true } as GeoData
        }
      } catch { /* fall through */ }
    }
    // ipwho.is : HTTPS, sans clé. Le tier gratuit ne renvoie plus `security` → VPN déduit par heuristiques.
    try {
      const d = await getJSON('https://ipwho.is/')
      if (!d.success) throw new Error('ipwho.is failure')
      return {
        ip: d.ip,
        country: d.country,
        countryCode: d.country_code,
        regionName: d.region,
        city: d.city,
        postal: d.postal ?? '',
        lat: d.latitude,
        lon: d.longitude,
        timezone: d.timezone?.id ?? '',
        isp: d.connection?.isp ?? d.connection?.org ?? '',
        org: d.connection?.org ?? '',
        as: d.connection?.asn ? `AS${d.connection.asn} ${d.connection.org ?? ''}`.trim() : '',
        proxy: d.security?.proxy ?? false,
        hosting: (d.security?.vpn ?? false) || (d.security?.tor ?? false),
        flagged: !!d.security,
        status: 'success',
      }
    } catch { /* fall through */ }
    // freeipapi.com : HTTPS, sans clé, signale les proxys connus
    try {
      const d = await getJSON('https://free.freeipapi.com/api/json/')
      return {
        ip: d.ipAddress, country: d.countryName, countryCode: d.countryCode,
        regionName: d.regionName, city: d.cityName, postal: d.zipCode ?? '',
        lat: d.latitude, lon: d.longitude, timezone: d.timeZones?.[0] ?? '',
        isp: d.asnOrganization ?? '', org: d.asnOrganization ?? '',
        as: d.asn ? `AS${d.asn} ${d.asnOrganization ?? ''}`.trim() : '',
        proxy: !!d.isProxy, hosting: false, flagged: true, status: 'success',
      }
    } catch { /* fall through */ }
    // Dernier recours : ipapi.co (aucune détection proxy/VPN, souvent rate-limité)
    try {
      const d = await getJSON('https://ipapi.co/json/')
      if (d.error) throw new Error(d.reason)
      return {
        ip: d.ip, country: d.country_name, countryCode: d.country_code,
        regionName: d.region, city: d.city, postal: d.postal ?? '',
        lat: d.latitude, lon: d.longitude, timezone: d.timezone ?? '',
        isp: d.org, org: d.org,
        as: d.asn, proxy: false, hosting: false, flagged: false, status: 'success',
      }
    } catch { return null }
  })()
  return _geoPromise
}

// Le résolveur DNS réel : le navigateur résout un sous-domaine aléatoire (32 caractères exigés) de edns.ip-api.com,
// dont le serveur DNS autoritaire note quel résolveur l'a interrogé.
function fetchDNS(): Promise<DnsInfo | null> {
  if (_dnsPromise) return _dnsPromise
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => (b % 36).toString(36)).join('')
  _dnsPromise = getJSON(`https://${rand}.edns.ip-api.com/json`)
    .then(d => d?.dns?.ip ? { ip: d.dns.ip, geo: d.dns.geo ?? '', ecs: d.edns?.ip ?? null } : null)
    .catch(() => null)
  return _dnsPromise
}

function isPrivateIP(ip: string) {
  if (ip.includes(':')) return /^(fe80|fc|fd)/i.test(ip) || ip === '::1'
  const [a, b] = ip.split('.').map(Number)
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
}

// Collecte des candidats ICE : "host" = IP locale (souvent masquée par mDNS), "srflx" = IP publique vue par le serveur STUN.
function gatherRTC(): Promise<RtcInfo> {
  if (_rtcPromise) return _rtcPromise
  _rtcPromise = new Promise(resolve => {
    const info: RtcInfo = { local: [], publicIPs: [], mdns: false, supported: false }
    let pc: RTCPeerConnection
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }] })
    } catch { resolve(info); return }
    info.supported = true
    const finish = () => { try { pc.close() } catch { /* déjà fermé */ } resolve(info) }
    pc.onicecandidate = e => {
      if (!e.candidate) { finish(); return }
      const c = e.candidate
      // Chrome entoure les IPv6 de crochets ("[2001:db8::1]")
      const addr = (c.address ?? c.candidate.split(' ')[4])?.replace(/^\[|\]$/g, '')
      if (!addr) return
      if (addr.endsWith('.local')) { info.mdns = true; return }
      const target = c.type === 'srflx' || c.type === 'prflx' || !isPrivateIP(addr) ? info.publicIPs : info.local
      if (!target.includes(addr)) target.push(addr)
    }
    pc.createDataChannel('')
    pc.createOffer().then(o => pc.setLocalDescription(o)).catch(finish)
    setTimeout(finish, 4000)
  })
  return _rtcPromise
}

function prefix64(ip: string) {
  const [head, tail = ''] = ip.toLowerCase().split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const full = ip.includes('::') ? [...h, ...Array(8 - h.length - t.length).fill('0'), ...t] : h
  return full.slice(0, 4).map(x => x.replace(/^0+(?=.)/, '')).join(':')
}

// Heuristiques d'hébergeurs / VPN commerciaux reconnaissables à leur nom d'AS.
const VPN_ASN_RE = /\b(m247|datacamp|cdn77|31173 services|mullvad|nordvpn|tefincom|proton|surfshark|expressvpn|private internet access|packethub|clouvider|leaseweb|hetzner|ovh|digitalocean|linode|akamai|vultr|choopa|amazon|aws|google cloud|microsoft|azure|oracle|scaleway|contabo|hostinger|ionos|zscaler|cloudflare warp|cloudflare|ipxo|creanova|xtom|quadranet|psychz|hivelocity|colocrossing|tor exit)\b/i

const PUBLIC_DNS_RE = /cloudflare|google|quad9|nextdns|adguard|mullvad|opendns|cisco|control ?d|dns0|cira|cleanbrowsing|yandex/i

function offsetFor(tz: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date())
    const m = /GMT([+-])(\d{2}):(\d{2})/.exec(parts.find(p => p.type === 'timeZoneName')?.value ?? '')
    return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0
  } catch { return null }
}

export function useNetwork() {
  const publicIP = ref<string | null>(null)
  const publicIPv4 = ref<string | null>(null)
  const publicIPv6 = ref<string | null>(null)
  const country = ref<string | null>(null)
  const countryCode = ref<string | null>(null)
  const city = ref<string | null>(null)
  const regionName = ref<string | null>(null)
  const postal = ref<string | null>(null)
  const ipTimezone = ref<string | null>(null)
  const isp = ref<string | null>(null)
  const asn = ref<string | null>(null)
  const providerFlags = ref<{ proxy: boolean; hosting: boolean } | null>(null)
  const localIPs = ref<string[]>([])
  const webrtcPublicIPs = ref<string[]>([])
  const mdnsMasked = ref(false)
  const webrtcDone = ref(false)
  const dnsResolver = ref<string | null>(null)
  const dnsResolverInfo = ref<string | null>(null)
  const dnsDone = ref(false)
  const lat = ref<number | null>(null)
  const lon = ref<number | null>(null)
  const loading = ref(true)
  const networkError = ref(false)

  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // IP exposée par WebRTC mais absente des IP vues par les API → elle contourne le tunnel (fuite VPN).
  // On ne compare qu'à IP de même famille : sans IPv6 connue, une IPv6 STUN n'est pas une preuve.
  const webrtcLeak = computed(() => {
    const v4 = publicIPv4.value ?? (publicIP.value?.includes(':') ? null : publicIP.value)
    const v6 = publicIPv6.value ?? (publicIP.value?.includes(':') ? publicIP.value : null)
    return webrtcPublicIPs.value.find(ip => {
      if (!ip.includes(':')) return v4 !== null && ip !== v4
      // IPv6 : adresses temporaires (RFC 4941) → on compare le préfixe /64 du foyer, pas l'adresse entière.
      return v6 !== null && prefix64(ip) !== prefix64(v6)
    }) ?? null
  })

  const vpnSignals = computed(() => {
    const s: string[] = []
    if (providerFlags.value?.proxy) s.push('IP listée comme proxy')
    if (providerFlags.value?.hosting) s.push('IP d\'hébergeur / VPN connu')
    const asName = `${asn.value ?? ''} ${isp.value ?? ''}`
    if (VPN_ASN_RE.test(asName)) s.push(`Réseau d'hébergeur/VPN (${asName.match(VPN_ASN_RE)?.[0]})`)
    if (ipTimezone.value) {
      const a = offsetFor(ipTimezone.value), b = offsetFor(browserTimezone)
      if (a !== null && b !== null && a !== b) s.push(`Fuseau IP ${ipTimezone.value} ≠ fuseau système ${browserTimezone}`)
    }
    if (webrtcLeak.value) s.push(`WebRTC révèle une autre IP : ${webrtcLeak.value}`)
    return s
  })
  const isVPN = computed<boolean | null>(() => loading.value ? null : vpnSignals.value.length > 0)
  const isProxy = computed(() => providerFlags.value?.proxy ?? false)

  // Résolveur public (DoH/DoT ou DNS configuré à la main) plutôt que celui du FAI.
  const dnsIsPublic = computed(() => !!dnsResolverInfo.value && PUBLIC_DNS_RE.test(dnsResolverInfo.value))

  async function loadGeo() {
    const [geo, ips] = await Promise.all([fetchGeo(), fetchIPs()])
    publicIPv4.value = ips.v4
    publicIPv6.value = ips.v6
    if (geo && geo.status === 'success') {
      publicIP.value = geo.ip
      country.value = `${geo.country} (${geo.countryCode})`
      countryCode.value = geo.countryCode
      city.value = geo.city
      regionName.value = geo.regionName
      postal.value = geo.postal || null
      ipTimezone.value = geo.timezone || null
      isp.value = geo.isp
      asn.value = geo.as
      providerFlags.value = geo.flagged ? { proxy: geo.proxy, hosting: geo.hosting } : null
      if (geo.lat != null) lat.value = geo.lat
      if (geo.lon != null) lon.value = geo.lon
    } else if (ips.v4 || ips.v6) {
      publicIP.value = ips.v4 ?? ips.v6
    } else {
      networkError.value = true
    }
    loading.value = false
  }

  onMounted(() => {
    loadGeo()
    gatherRTC().then(r => {
      localIPs.value = r.local
      webrtcPublicIPs.value = r.publicIPs
      mdnsMasked.value = r.mdns
      webrtcDone.value = true
    })
    fetchDNS().then(d => {
      if (d) { dnsResolver.value = d.ip; dnsResolverInfo.value = d.geo }
      dnsDone.value = true
    })
  })

  return {
    publicIP, publicIPv4, publicIPv6, country, countryCode, city, regionName, postal, ipTimezone, browserTimezone,
    isp, asn, isVPN, isProxy, vpnSignals, localIPs, webrtcPublicIPs, mdnsMasked, webrtcLeak, webrtcDone,
    dnsResolver, dnsResolverInfo, dnsIsPublic, dnsDone, lat, lon, loading, networkError,
  }
}
