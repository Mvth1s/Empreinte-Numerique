<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="01" icon="🌐" title="Réseau & IP"
        description="Votre connexion internet révèle votre identité réseau, votre position et votre fournisseur." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="📡" label="IP Publique" :value="publicIP" sensitivity="critical"
          inference="Votre adresse IP identifie votre connexion internet. Elle permet la géolocalisation à ~20 km et est enregistrée dans tous les logs de serveur."
          :loading="loading" />

        <DataCard icon="🌍" label="Pays / Région" :value="country" sensitivity="high"
          inference="Votre pays est identifié avec quasi-certitude. La région affine la localisation sans aucun accès GPS."
          :loading="loading" />

        <DataCard icon="🏙️" label="Ville approximative" :value="city" sensitivity="high"
          inference="Votre ville probable déduite de l'IP. Précision de 20 à 50 km selon le FAI et le type de connexion."
          :loading="loading" />

        <DataCard icon="🏢" label="Fournisseur d'accès" :value="isp" sensitivity="medium"
          inference="Révèle votre opérateur télécom, votre entreprise ou votre hébergeur. Distingue mobile, ADSL, fibre, datacenter."
          :loading="loading" />

        <DataCard icon="🔢" label="Numéro AS (ASN)" :value="asn" sensitivity="medium"
          inference="L'Autonomous System Number identifie l'entité qui gère vos paquets. Utilisé pour détecter VPN et datacenters."
          :loading="loading" />

        <DataCard icon="🛡️" label="VPN / Datacenter détecté" :value="vpnLabel" sensitivity="high"
          inference="Certains ASN sont connus pour appartenir à des VPN, proxies ou hébergeurs. Ce signal alerte les systèmes anti-fraude."
          :loading="loading" />

        <DataCard icon="🏠" label="IP locale (WebRTC)" :value="localIPsStr" sensitivity="critical"
          inference="Votre adresse IP sur votre réseau local, révélée par WebRTC sans permission. Confirme NAT et type de réseau."
          :loading="!localIPsReady" />

        <DataCard icon="💥" label="Fuite IP via WebRTC" :value="webrtcLeak" sensitivity="critical"
          inference="MÊME derrière un VPN, WebRTC peut révéler votre vraie IP publique. C'est une fuite très utilisée pour dé-anonymiser."
          :loading="!localIPsReady" />

        <DataCard icon="🔍" label="Résolveur DNS" :value="dnsResolver" sensitivity="medium"
          inference="Le serveur DNS que vous utilisez (FAI, Google 8.8.8.8, Cloudflare 1.1.1.1, Pi-hole…) révèle vos habitudes de confidentialité."
          :loading="loading" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useNetwork } from '../../composables/useNetwork'

const { publicIP, country, city, isp, asn, isVPN, localIPs, webrtcLeak, dnsResolver, loading } = useNetwork()

const localIPsStr = computed(() => localIPs.value.length ? localIPs.value.join(' / ') : null)
const localIPsReady = ref(false)
const vpnLabel = computed(() => {
  if (loading.value) return undefined
  if (isVPN.value === true) return 'OUI — ASN de datacenter / hébergeur'
  if (isVPN.value === false) return 'Non détecté'
  return 'Inconnu'
})

// WebRTC prend jusqu'à 5s
setTimeout(() => { localIPsReady.value = true }, 5500)

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
