<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="08" icon="📶" title="Connectivité"
        description="Le type et la qualité de votre connexion révèlent votre contexte : domicile, bureau, mobile ou réseau d'entreprise." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="📡" label="Type de connexion" :value="connectionType ?? 'Indisponible (non-Chromium)'" sensitivity="medium"
          inference="WiFi, 4G, Ethernet, Bluetooth. Distingue mobile du desktop et révèle le contexte d'usage (bureau, domicile, déplacement)." />

        <DataCard icon="⚡" label="Type effectif (qualité)" :value="effectiveType ?? 'Indisponible'" sensitivity="medium"
          inference="4G, 3G, 2G, slow-2G. La qualité réelle de la connexion. Un VPN dégrade souvent l'effectiveType — signal de détection." />

        <DataCard icon="📥" label="Débit estimé" :value="downlink ? `${downlink} Mbps` : 'Indisponible'" sensitivity="medium"
          inference="Mbps approximatifs, arrondi par le navigateur. Distingue connexion professionnelle (>50 Mbps) de résidentielle ou mobile." />

        <DataCard icon="🏓" label="Latence (RTT)" :value="rtt ? `${rtt} ms` : 'Indisponible'" sensitivity="medium"
          inference="Round-trip time. Un RTT élevé (>100ms) peut indiquer un VPN ou une connexion mobile. Utilisé pour l'analyse de qualité réseau." />

        <DataCard icon="💤" label="Mode économie données" :value="saveData === null ? 'Indisponible' : saveData ? 'Activé' : 'Désactivé'" sensitivity="low"
          inference="Activé dans les paramètres mobiles ou avec des extensions. Révèle une contrainte de connexion ou un profil d'utilisateur conscient." />

        <DataCard icon="🟢" label="Statut connexion" :value="online ? 'En ligne' : 'Hors ligne'" sensitivity="low"
          inference="navigator.onLine indique l'état réseau global. Basique mais toujours disponible, utilisé pour adapter l'expérience offline." />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useConnectivity } from '../../composables/useConnectivity'

const { connectionType, effectiveType, downlink, rtt, saveData, online } = useConnectivity()

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
