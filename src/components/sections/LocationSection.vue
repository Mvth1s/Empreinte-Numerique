<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">📍</span>
        <div>
          <h2>Localisation</h2>
          <p class="th-sub">Sans GPS, sans permission, juste avec l'IP : votre quartier suffit.</p>
        </div>
      </div>
      <div>
        <span class="th-count">{{ gpsCoords ? 6 : 5 }}<small>signaux</small></span>
      </div>
    </div>

    <!-- Location hero -->
    <div class="hero-block loc-block">
      <div class="loc-map" id="loc-map" aria-hidden="true">
        <div class="ring r-pays"></div>
        <div class="ring r-region"></div>
        <div class="ring r-city"></div>
        <div class="ring r-pin"></div>
        <span class="pin">📍</span>
      </div>
      <div class="loc-info">
        <div class="hb-label">SANS PERMISSION GPS</div>
        <div class="loc-line"><b>Pays</b><span>{{ net.country.value ?? '…' }}</span></div>
        <div class="loc-line"><b>Région</b><span>{{ net.regionName.value ?? '—' }}</span></div>
        <div class="loc-line"><b>Ville</b><span>{{ net.city.value ?? '…' }}</span></div>
        <div class="loc-line"><b>Quartier</b><span>{{ coordStr }} (±15 km)</span></div>
        <div class="loc-warn">
          <template v-if="!gpsCoords && !gpsError">
            Avec votre permission GPS → <b>précision &lt; 10 m</b>
            <button class="gps-btn" @click="requestGPS" :disabled="gpsLoading">
              {{ gpsLoading ? 'Demande en cours…' : '📍 Autoriser la localisation GPS' }}
            </button>
          </template>
          <template v-else-if="gpsError">
            <span style="color:var(--red)">⚠️ {{ gpsError }}</span>
          </template>
          <template v-else-if="gpsCoords">
            <span style="color:var(--cyan)">✓ GPS autorisé — précision : ±{{ gpsCoords.accuracy }} m</span>
          </template>
        </div>
      </div>
    </div>

    <div v-if="gpsCoords" class="cards" style="margin-bottom:18px">
      <DataCardV2
        icon="📍"
        title="Position GPS réelle"
        :value="gpsCityLoading ? '🔍 Ville en cours…' : (gpsCity ?? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lon.toFixed(5)}`)"
        mean="Ces coordonnées proviennent directement du GPS ou de la triangulation Wi-Fi de votre appareil — avec votre autorisation explicite."
        :deduce="`Précision : ±${gpsCoords.accuracy} m · ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lon.toFixed(6)}. C'est votre position à quelques mètres près — suffisant pour localiser votre domicile, votre bureau, ou la pièce où vous vous trouvez.`"
        tech-key="getCurrentPosition() + Nominatim reverse"
        :tech-val="`${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lon.toFixed(6)} ±${gpsCoords.accuracy}m`"
        severity="critique"
        sev-label="critique"
        :span="12"
      />
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌍"
        title="Pays d'origine"
        :value="net.country.value ?? '…'"
        mean="Le pays est déduit depuis la base de données GeoIP associée à votre adresse IP publique."
        deduce="Permet les restrictions géographiques de contenu (géo-blocage), le ciblage publicitaire par pays, le respect des lois locales."
        tech-key="ip-api.com › country + countryCode"
        :tech-val="net.country.value ?? '—'"
        severity="eleve"
        sev-label="élevé"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🏙️"
        title="Ville approximative"
        :value="net.city.value ?? '…'"
        mean="La ville est déterminée par la base GeoIP avec une précision variable selon le FAI et la région."
        deduce="Localisation à 50-200 km de précision. Permet des publicités géolocalisées et des prix dynamiques par région."
        tech-key="ip-api.com › city / regionName"
        :tech-val="[net.city.value, net.regionName.value].filter(Boolean).join(', ') || '—'"
        severity="eleve"
        sev-label="élevé"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🗺️"
        title="Coordonnées GPS approximatives"
        :value="net.lat.value && net.lon.value ? `${net.lat.value}, ${net.lon.value}` : '…'"
        mean="Les coordonnées latitude/longitude sont les coordonnées du centre de la zone GeoIP, pas votre position exacte."
        deduce="Ces coordonnées correspondent souvent au centre de votre ville ou FAI. La précision réelle est de 10-50 km."
        tech-key="ip-api.com › lat + lon"
        :tech-val="net.lat.value && net.lon.value ? `${net.lat.value}, ${net.lon.value}` : '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🕐"
        title="Fuseau IANA vs IP"
        :value="`${tz.timezone.value} / IP : ${net.ipTimezone.value ?? '…'}`"
        mean="Le fuseau horaire de votre système (via Intl) est comparé à celui associé à votre adresse IP par la base de géolocalisation."
        :deduce="tzMismatch
          ? 'Les deux fuseaux n\'ont pas le même décalage horaire : c\'est la signature classique d\'un VPN ou d\'un proxy.'
          : 'Les deux fuseaux concordent : rien n\'indique que vous masquez votre position. Ex. : fuseau Europe/Paris avec IP américaine = VPN probable.'"
        tech-key="Intl.timeZone ∩ ipwho.is › timezone.id"
        :tech-val="tzMismatch ? 'incohérent' : 'cohérent'"
        severity="eleve"
        sev-label="élevé"
        :loading="net.loading.value"
        :span="6"
      />
      <DataCardV2
        icon="📡"
        title="Résolveur DNS"
        :value="net.dnsResolverInfo.value ?? net.dnsResolver.value ?? 'Non détecté'"
        mean="Votre navigateur résout un sous-domaine unique et aléatoire ; le serveur DNS de ce domaine note quel résolveur est venu le lui demander. On obtient ainsi l'IP réelle du serveur qui traduit toutes vos adresses web."
        deduce="Le résolveur révèle votre opérateur, votre VPN ou votre DNS public (Cloudflare, Google, Quad9…). S'il appartient à un autre pays que votre IP, votre VPN laisse fuir vos requêtes DNS."
        tech-key="*.edns.ip-api.com › résolveur DNS"
        :tech-val="net.dnsResolver.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="!net.dnsDone.value"
        :span="6"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNetwork } from '../../composables/useNetwork'
import { useTimezone } from '../../composables/useTimezone'
import { reverseGeocode } from '../../utils/geocode'
import DataCardV2 from '../DataCardV2.vue'

const net = useNetwork()
const tz = useTimezone()

const gpsCoords = ref<{ lat: number; lon: number; accuracy: number } | null>(null)
const gpsCity = ref<string | null>(null)
const gpsCityLoading = ref(false)
const gpsError = ref<string | null>(null)
const gpsLoading = ref(false)

function requestGPS() {
  if (!navigator.geolocation) { gpsError.value = 'Géolocalisation non supportée'; return }
  gpsLoading.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      gpsCoords.value = { lat, lon, accuracy: Math.round(pos.coords.accuracy) }
      gpsLoading.value = false
      gpsCityLoading.value = true
      gpsCity.value = await reverseGeocode(lat, lon)
      gpsCityLoading.value = false
    },
    (err) => {
      gpsError.value = err.code === 1 ? 'Permission refusée' : 'Impossible d\'obtenir la position'
      gpsLoading.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

const tzMismatch = computed(() => {
  if (!net.ipTimezone.value) return false
  const off = (zone: string) => new Date(new Date().toLocaleString('en-US', { timeZone: zone })).getTime()
  try { return Math.abs(off(net.ipTimezone.value) - off(tz.timezone.value)) > 60_000 } catch { return false }
})

const coordStr = computed(() => {
  if (net.lat.value && net.lon.value) return `${net.lat.value.toFixed(2)}, ${net.lon.value.toFixed(2)}`
  return '—'
})
</script>
