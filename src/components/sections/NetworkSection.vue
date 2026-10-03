<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🌐</span>
        <div>
          <h2>Réseau &amp; IP</h2>
          <p class="th-sub">Votre connexion vous trahit avant même que vous ne cliquiez.</p>
        </div>
      </div>
      <div>
        <span class="th-count">5<small>signaux</small></span>
      </div>
    </div>

    <div v-if="net.networkError.value" class="net-error">
      <span>⚠️</span>
      <span>Impossible de contacter les APIs de géolocalisation (ipify, ipwho.is, freeipapi.com). Les données réseau ne sont pas disponibles — vérifiez votre connexion ou désactivez un bloqueur de requêtes.</span>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌍"
        title="Adresse IP publique"
        :value="ipLabel"
        mean="C'est l'adresse qu'un serveur voit quand vous vous connectez. Si votre box fournit IPv6, le navigateur a souvent deux adresses publiques : une IPv4 partagée et une IPv6, souvent propre à votre logement."
        deduce="Localisation géographique approximative, identification du FAI, corrélation entre visites, blocage géographique de contenu. Une IPv6 change rarement : elle suit votre foyer pendant des semaines."
        tech-key="api4.ipify.org + api6.ipify.org"
        :tech-val="`v4=${net.publicIPv4.value ?? '—'} · v6=${net.publicIPv6.value ?? '—'}`"
        severity="critique"
        sev-label="critique"
        :loading="net.loading.value"
        :span="12"
      />
      <DataCardV2
        icon="🏢"
        title="Fournisseur d'accès (FAI)"
        :value="net.isp.value ?? '…'"
        mean="Le FAI est l'entreprise qui fournit votre connexion internet. Il est directement lié à votre IP."
        deduce="Type de connexion (résidentiel, entreprise, VPN), pays d'origine, profil socio-économique approximatif."
        tech-key="ipwho.is › connection.isp"
        :tech-val="net.isp.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🔢"
        title="ASN (Système autonome)"
        :value="net.asn.value ?? '…'"
        mean="L'ASN identifie le réseau autonome propriétaire de votre bloc d'adresses IP."
        deduce="Permet de savoir si vous utilisez un VPN commercial, un proxy, un réseau d'entreprise ou résidentiel."
        tech-key="ipwho.is › connection.asn"
        :tech-val="net.asn.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="⚠️"
        title="Proxy / VPN détecté"
        :value="net.isVPN.value ? `Probable — ${net.vpnSignals.value.length} indice(s)` : 'Aucun indice'"
        mean="Plusieurs indices sont croisés : nom du réseau (hébergeur ou VPN connu), fuseau horaire de l'IP différent de celui de votre système, IP différente révélée par WebRTC."
        :deduce="net.vpnSignals.value.length ? net.vpnSignals.value.join(' · ') : 'Rien n\'indique un VPN : votre IP semble résidentielle et cohérente avec votre fuseau horaire.'"
        tech-key="ASN + fuseau IP ∩ Intl + WebRTC"
        :tech-val="`${net.ipTimezone.value ?? '?'} / ${net.browserTimezone}`"
        :severity="net.isVPN.value ? 'moyen' : 'faible'"
        :sev-label="net.isVPN.value ? 'moyen' : 'faible'"
        :loading="net.loading.value || !net.webrtcDone.value"
        :span="4"
      />
      <DataCardV2
        icon="🔓"
        title="Fuite WebRTC"
        :value="webrtcLabel"
        mean="WebRTC (appels vidéo dans le navigateur) interroge un serveur STUN qui renvoie votre IP publique, et peut exposer vos IPs locales. Les navigateurs récents masquent les IPs locales derrière un nom aléatoire en .local (mDNS)."
        deduce="Si l'IP renvoyée par STUN diffère de celle vue par le site, votre VPN fuit : votre vraie adresse est révélée. Une IP locale exposée révèle votre réseau domestique ou d'entreprise."
        tech-key="RTCPeerConnection › ICE candidates (host / srflx)"
        :tech-val="webrtcTech"
        :severity="net.webrtcLeak.value || net.localIPs.value.length ? 'critique' : 'moyen'"
        :sev-label="net.webrtcLeak.value || net.localIPs.value.length ? 'critique' : 'moyen'"
        :loading="!net.webrtcDone.value"
        :span="12"
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
import DataCardV2 from '../DataCardV2.vue'
const net = useNetwork()

const ipLabel = computed(() => {
  const v4 = net.publicIPv4.value, v6 = net.publicIPv6.value
  if (v4 && v6) return `${v4}  ·  ${v6}`
  return v4 ?? v6 ?? net.publicIP.value ?? '…'
})

const webrtcLabel = computed(() => {
  if (net.webrtcLeak.value) return `Fuite : ${net.webrtcLeak.value}`
  if (net.localIPs.value.length) return `IP locale exposée : ${net.localIPs.value.join(', ')}`
  if (net.webrtcPublicIPs.value.length) return `IP publique via STUN : ${net.webrtcPublicIPs.value.join(', ')}`
  if (net.mdnsMasked.value) return 'IPs locales masquées (mDNS)'
  return 'WebRTC bloqué ou désactivé'
})

const webrtcTech = computed(() => [
  `host=${net.localIPs.value.join(',') || (net.mdnsMasked.value ? 'mDNS' : '—')}`,
  `srflx=${net.webrtcPublicIPs.value.join(',') || '—'}`,
].join(' · '))
</script>
