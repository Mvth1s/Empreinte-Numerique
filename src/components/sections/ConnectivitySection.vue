<template>
  <div class="wrap section-wrap">
    <SectionHeader index="08" title="Connectivité" />
    <div class="en-grid">
      <DataCard icon="📡" label="Connexion réseau" sectionIdx="section 08"
        :rows="[
          { k: 'TYPE', v: connectionType ?? 'Non disponible (non-Chromium)' },
          { k: 'QUALITÉ', v: effectiveType ?? 'Non disponible', cls: 'muted' },
          { k: 'DÉBIT', v: downlink ? `${downlink} Mbps` : 'Non disponible', cls: 'muted' },
          { k: 'LATENCE_RTT', v: rtt ? `${rtt} ms` : 'Non disponible', cls: 'muted' },
        ]"
        inference="WiFi, 4G, Ethernet. La qualité réelle distingue <strong>mobile de desktop</strong> et révèle le contexte d'usage. Un VPN dégrade souvent l'effectiveType."
        sensitivity="medium" :span="6" />

      <DataCard icon="🟢" label="État & Économie" sectionIdx="section 08"
        :rows="[
          { k: 'STATUT', v: online ? 'En ligne' : 'Hors ligne' },
          { k: 'ÉCONOMIE_DONNÉES', v: saveData === null ? 'Non disponible' : saveData ? 'Activé' : 'Désactivé', cls: 'muted' },
        ]"
        inference="<code>navigator.onLine</code> + <code>saveData</code> révèlent vos <strong>contraintes réseau et préférences</strong>. Le mode économie indique souvent un profil mobile ou connexion limitée."
        sensitivity="low" :span="6" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useConnectivity } from '../../composables/useConnectivity'

const { connectionType, effectiveType, downlink, rtt, saveData, online } = useConnectivity()
</script>
