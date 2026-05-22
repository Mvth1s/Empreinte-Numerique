<template>
  <div class="wrap section-wrap">
    <SectionHeader index="01" title="Réseau & IP" />
    <div class="en-grid">
      <DataCard icon="🌐" label="Adresse IP & Géolocalisation" sectionIdx="section 01"
        :rows="[
          { k: 'IP_PUBLIQUE', v: publicIP },
          { k: 'PAYS / RÉGION', v: country },
          { k: 'VILLE', v: city },
          { k: 'FAI', v: isp },
          { k: 'ASN', v: asn },
        ]"
        inference="Votre IP révèle votre <strong>fournisseur d'accès</strong>, votre <strong>pays</strong>, votre <strong>région</strong> et souvent votre <strong>ville</strong>. Combinée à d'autres signaux, elle suffit à vous reconnaître entre deux sessions."
        sensitivity="high" :span="4" :loading="loading" />

      <DataCard icon="🛡️" label="Anonymat réseau" sectionIdx="section 01"
        :rows="[
          { k: 'VPN / DATACENTER', v: vpnLabel, cls: isVPN ? 'bad' : '' },
          { k: 'PROXY', v: isProxy ? 'Détecté ⚠️' : 'Non détecté', cls: isProxy ? 'bad' : '' },
        ]"
        inference="Certains <strong>ASN sont connus</strong> pour appartenir à des VPN, proxies ou hébergeurs. Ce signal est utilisé par les systèmes anti-fraude et les DRM pour bloquer les connexions anonymisées."
        sensitivity="high" :span="4" :loading="loading" />

      <DataCard icon="💥" label="Fuite IP via WebRTC" sectionIdx="section 01"
        :rows="[
          { k: 'IP_LOCALE (RTCPeer)', v: localIPsStr, cls: localIPs.length ? 'bad' : '' },
          { k: 'IP_RÉELLE_EXPOSÉE', v: webrtcLeak, cls: webrtcLeak ? 'bad' : '' },
        ]"
        inference="<strong>Même derrière un VPN</strong>, WebRTC peut révéler votre vraie IP publique via STUN. Aucune permission requise. La plupart des VPN grand public ne bloquent pas cette fuite."
        sensitivity="critical" :span="4" :loading="!localIPsReady" />

      <DataCard icon="🔍" label="Résolveur DNS" sectionIdx="section 01"
        :rows="[{ k: 'RÉSOLVEUR_DNS', v: dnsResolver }]"
        inference="Le serveur DNS que vous utilisez (FAI, Google 8.8.8.8, Cloudflare 1.1.1.1…) révèle vos habitudes de confidentialité et peut journaliser tous les domaines que vous visitez."
        sensitivity="medium" :span="4" :loading="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useNetwork } from '../../composables/useNetwork'

const { publicIP, country, city, isp, asn, isVPN, isProxy, localIPs, webrtcLeak, dnsResolver, loading } = useNetwork()

const localIPsStr = computed(() => localIPs.value.length ? localIPs.value.join(' / ') : 'Non détecté')
const vpnLabel = computed(() => {
  if (loading.value) return undefined
  return isVPN.value ? 'OUI — ASN de datacenter / hébergeur' : 'Non détecté'
})

const localIPsReady = ref(false)
setTimeout(() => { localIPsReady.value = true }, 5500)
</script>
