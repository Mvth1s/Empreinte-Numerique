<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">📍</span>
        <div>
          <h2>Localisation</h2>
          <p class="th-sub">Sans GPS ni permission : votre adresse IP suffit à situer votre ville.</p>
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
        <div class="hb-label">Sans permission GPS</div>
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
            <span class="loc-status-err">⚠️ {{ gpsError }}</span>
          </template>
          <template v-else-if="gpsCoords">
            <span class="loc-status-ok">✓ GPS autorisé — précision : ±{{ gpsCoords.accuracy }} m</span>
          </template>
        </div>
      </div>
    </div>

    <div v-if="gpsCoords" class="cards cards-gap">
      <DataCardV2
        icon="📍"
        title="Position GPS réelle"
        :value="gpsCityLoading ? '🔍 Ville en cours…' : (gpsCity ?? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lon.toFixed(5)}`)"
        mean="Ces coordonnées viennent du GPS de votre appareil ou des réseaux Wi-Fi autour de vous, parce que vous l'avez autorisé."
        :deduce="`Précision : ±${gpsCoords.accuracy} m. C'est votre position à quelques mètres près : de quoi retrouver votre domicile ou votre bureau. Un seul clic sur « Autoriser » suffit à la donner.`"
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
        title="Pays"
        :value="net.country.value ?? '…'"
        mean="Le pays est retrouvé à partir de votre adresse IP, grâce à des annuaires qui associent les adresses à des lieux."
        deduce="Sert à bloquer des vidéos selon le pays, à choisir les publicités, ou à afficher des prix différents."
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
        mean="La ville est devinée de la même façon. Elle est souvent juste, parfois fausse de plusieurs dizaines de kilomètres."
        deduce="Suffit pour des publicités locales et des prix qui changent selon la région."
        tech-key="ip-api.com › city / regionName"
        :tech-val="[net.city.value, net.regionName.value].filter(Boolean).join(', ') || '—'"
        severity="eleve"
        sev-label="élevé"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🗺️"
        title="Coordonnées approximatives"
        :value="net.lat.value && net.lon.value ? `${net.lat.value}, ${net.lon.value}` : '…'"
        mean="Un point sur la carte associé à votre adresse IP. Ce n'est pas votre position exacte, mais le centre de la zone devinée."
        deduce="Ce point tombe en général au centre de votre ville ou de votre région, à quelques dizaines de kilomètres près."
        tech-key="ip-api.com › lat + lon"
        :tech-val="net.lat.value && net.lon.value ? `${net.lat.value}, ${net.lon.value}` : '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🕐"
        title="Heure de l'ordinateur et pays de l'IP"
        :value="`${tz.timezone.value} / IP : ${net.ipTimezone.value ?? '…'}`"
        mean="Le site compare le fuseau horaire de votre appareil à celui du pays de votre adresse IP."
        :deduce="tzMismatch
          ? 'Les deux heures ne correspondent pas : c\'est la marque classique d\'un VPN, qui déplace votre adresse IP mais pas l\'horloge de votre appareil.'
          : 'Les deux concordent : rien n\'indique que vous cachez votre position. Un appareil à l\'heure de Paris avec une adresse IP américaine trahirait un VPN.'"
        tech-key="Intl.timeZone ∩ ipwho.is › timezone.id"
        :tech-val="tzMismatch ? 'incohérent' : 'cohérent'"
        severity="eleve"
        sev-label="élevé"
        :loading="net.loading.value"
        :span="6"
      />
      <DataCardV2
        icon="📡"
        title="Annuaire Internet utilisé (DNS)"
        :value="net.dnsResolverInfo.value ?? net.dnsResolver.value ?? 'Non détecté'"
        mean="Pour trouver un site, votre appareil demande son adresse à un « annuaire » (DNS). En lui faisant chercher un nom inventé, le site découvre quel annuaire vous utilisez."
        deduce="Cet annuaire révèle votre opérateur, votre VPN ou un service public (Cloudflare, Google…). S'il est dans un autre pays que votre adresse IP, votre VPN laisse fuir la liste des sites que vous visitez."
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
