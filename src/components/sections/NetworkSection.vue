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
      <span>Impossible de joindre les services qui donnent votre adresse IP et sa position (ipify, ipwho.is, freeipapi.com). Vérifiez votre connexion, ou un bloqueur qui couperait ces requêtes.</span>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌍"
        title="Adresse IP publique"
        :value="ipLabel"
        mean="C'est l'« adresse postale » de votre connexion sur Internet : chaque site que vous visitez la reçoit automatiquement. Beaucoup de box en donnent deux : une ancienne (IPv4), souvent partagée, et une récente (IPv6), propre à votre logement."
        deduce="Votre ville approximative, votre opérateur, et la possibilité de vous reconnaître d'une visite à l'autre. L'adresse IPv6 change rarement : elle peut désigner votre foyer pendant des semaines."
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
        mean="C'est l'entreprise qui vous fournit Internet (Orange, Free, SFR, Bouygues…). Son nom se déduit directement de votre adresse IP."
        deduce="Si vous êtes chez vous, au travail ou derrière un VPN, et dans quel pays. Les publicitaires s'en servent aussi pour deviner un profil (fibre ou mobile, particulier ou entreprise)."
        tech-key="ipwho.is › connection.isp"
        :tech-val="net.isp.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🔢"
        title="Réseau d'appartenance (ASN)"
        :value="net.asn.value ?? '…'"
        mean="Internet est un assemblage de grands réseaux, chacun avec un numéro (ASN). Celui-ci dit à quel réseau appartient votre adresse IP."
        deduce="Un réseau de particuliers, d'entreprise ou d'hébergeur ne se ressemble pas : c'est l'un des moyens les plus simples de repérer un VPN."
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
        mean="Un VPN fait passer votre connexion par un autre ordinateur pour cacher votre adresse. Le site croise plusieurs indices : nom du réseau, heure de votre ordinateur différente de celle du pays de l'IP, autre adresse trahie par le navigateur."
        :deduce="net.vpnSignals.value.length ? net.vpnSignals.value.join(' · ') : 'Rien n\'indique un VPN : votre adresse ressemble à celle d\'un particulier et correspond à l\'heure de votre ordinateur.'"
        tech-key="ASN + fuseau IP ∩ Intl + WebRTC"
        :tech-val="`${net.ipTimezone.value ?? '?'} / ${net.browserTimezone}`"
        :severity="net.isVPN.value ? 'moyen' : 'faible'"
        :sev-label="net.isVPN.value ? 'moyen' : 'faible'"
        :loading="net.loading.value || !net.webrtcDone.value"
        :span="4"
      />
      <DataCardV2
        icon="🔓"
        title="Fuite d'adresse (WebRTC)"
        :value="webrtcLabel"
        mean="WebRTC sert aux appels vidéo dans le navigateur. Pour établir l'appel, il peut révéler votre vraie adresse IP et celle de votre appareil sur votre réseau Wi-Fi, même derrière un VPN."
        deduce="Si l'adresse révélée ici diffère de celle vue par le site, votre VPN fuit : votre vraie adresse est exposée. Une adresse locale (192.168…) décrit en plus votre réseau à la maison ou au bureau."
        tech-key="RTCPeerConnection › ICE candidates (host / srflx)"
        :tech-val="webrtcTech"
        :severity="net.webrtcLeak.value || net.localIPs.value.length ? 'critique' : 'moyen'"
        :sev-label="net.webrtcLeak.value || net.localIPs.value.length ? 'critique' : 'moyen'"
        :loading="!net.webrtcDone.value"
        :masked="webrtcMasked"
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
  if (net.mdnsMasked.value) return 'Adresses locales cachées'
  return 'WebRTC bloqué'
})

// Aucune adresse obtenue : le navigateur cache les adresses locales (nom aléatoire en .local) ou bloque WebRTC.
const webrtcMasked = computed(() => {
  if (!net.webrtcDone.value || net.webrtcLeak.value || net.localIPs.value.length || net.webrtcPublicIPs.value.length) return null
  return net.mdnsMasked.value
    ? 'Il remplace l\'adresse de votre appareil par un nom aléatoire (mDNS) : rien ne fuit.'
    : 'Il bloque WebRTC ou passe par un relais : aucune adresse n\'a pu être obtenue.'
})

const webrtcTech = computed(() => [
  `host=${net.localIPs.value.join(',') || (net.mdnsMasked.value ? 'mDNS' : '—')}`,
  `srflx=${net.webrtcPublicIPs.value.join(',') || '—'}`,
].join(' · '))
</script>
