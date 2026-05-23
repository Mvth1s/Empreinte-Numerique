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
        <span class="th-count">5<small>signaux</small></span>
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
        <div class="loc-line"><b>Région</b><span>{{ regionName }}</span></div>
        <div class="loc-line"><b>Ville</b><span>{{ net.city.value ?? '…' }}</span></div>
        <div class="loc-line"><b>Quartier</b><span>{{ coordStr }} (±15 km)</span></div>
        <div class="loc-warn">
          Avec votre permission GPS → <b>précision &lt; 10 m</b>
        </div>
      </div>
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
        tech-key="ip-api.com › city + regionName"
        :tech-val="net.city.value ?? '—'"
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
        :value="`${tz.timezone.value} / ${net.country.value ?? '…'}`"
        mean="Le croisement du fuseau horaire (via Intl) et du pays IP permet de vérifier la cohérence de votre localisation."
        deduce="Une incohérence fuseau/pays révèle l'utilisation d'un VPN. Ex : fuseau Europe/Paris avec IP américaine = VPN probable."
        tech-key="Intl.timeZone ∩ ip-api.country"
        :tech-val="`${tz.timezone.value}`"
        severity="eleve"
        sev-label="élevé"
        :loading="net.loading.value"
        :span="6"
      />
      <DataCardV2
        icon="📡"
        title="Résolveur DNS"
        :value="net.dnsResolver.value ?? 'Non détecté'"
        mean="Via une requête DNS-over-HTTPS vers Cloudflare, le sous-réseau client source de la résolution DNS est identifiable."
        deduce="Le résolveur DNS révèle votre opérateur ou votre VPN. Cloudflare (1.1.1.1), Google (8.8.8.8), Orange, SFR…"
        tech-key="DoH › cloudflare-dns.com › edns-client-subnet"
        :tech-val="net.dnsResolver.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
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
import { computed } from 'vue'
import { useNetwork } from '../../composables/useNetwork'
import { useTimezone } from '../../composables/useTimezone'
import DataCardV2 from '../DataCardV2.vue'

const net = useNetwork()
const tz = useTimezone()

const regionName = computed(() => {
  const city = net.city.value ?? ''
  const parts = city.split(', ')
  return parts.length > 1 ? parts[1] : '—'
})

const coordStr = computed(() => {
  if (net.lat.value && net.lon.value) return `${net.lat.value.toFixed(2)}, ${net.lon.value.toFixed(2)}`
  return '—'
})
</script>
