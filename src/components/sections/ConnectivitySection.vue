<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">📡</span>
        <div>
          <h2>Connectivité</h2>
          <p class="th-sub">Type de connexion, débit, latence : tout est mesuré en silence.</p>
        </div>
      </div>
      <div>
        <span class="th-count">6<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌐"
        title="Statut en ligne"
        :value="cn.online.value ? 'En ligne' : 'Hors ligne'"
        mean="navigator.onLine retourne true si le navigateur a accès au réseau, false en mode hors ligne."
        deduce="Permet d'adapter le contenu servi et de détecter les utilisateurs en mode avion ou avec une connexion intermittente."
        tech-key="navigator.onLine"
        :tech-val="String(cn.online.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📶"
        title="Type de connexion"
        :value="cn.connectionType.value ?? 'Non disponible'"
        mean="navigator.connection.type retourne le type de réseau : wifi, cellular, ethernet, bluetooth, none…"
        deduce="Distingue Wi-Fi, données mobiles, ethernet. Révèle le contexte de connexion (domicile, bureau, mobile)."
        tech-key="navigator.connection.type"
        :tech-val="cn.connectionType.value ?? 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="📊"
        title="Type effectif (4G/3G…)"
        :value="cn.effectiveType.value ?? 'Non disponible'"
        mean="Même si votre forfait est théoriquement 5G ou fibre, le navigateur estime la qualité réelle de votre connexion en observant concrètement comment les données circulent."
        deduce="On peut savoir si vous êtes dans une zone de mauvaise couverture, si votre réseau est saturé, ou si vous êtes connecté via un partage de connexion téléphonique."
        tech-key="navigator.connection.effectiveType"
        :tech-val="cn.effectiveType.value ?? 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="⬇️"
        title="Débit descendant estimé"
        :value="cn.downlink.value != null ? `${cn.downlink.value} Mb/s` : 'Non disponible'"
        mean="downlink est une estimation de la bande passante descendante en mégabits par seconde, fournie par le système."
        deduce="Permet aux sites d'adapter la qualité des médias servis et révèle votre type de connexion internet."
        tech-key="navigator.connection.downlink"
        :tech-val="cn.downlink.value != null ? `${cn.downlink.value} Mb/s` : 'N/A'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="⏱️"
        title="Latence estimée (RTT)"
        :value="cn.rtt.value != null ? `${cn.rtt.value} ms` : 'Non disponible'"
        mean="La latence est le temps qu'il faut pour qu'une information parte de votre appareil et revienne — comme un écho. Plus ce délai est court, plus votre connexion réagit vite."
        deduce="Une latence très élevée trahit souvent un VPN avec un serveur lointain, une connexion satellite, ou un réseau mobile dégradé."
        tech-key="navigator.connection.rtt"
        :tech-val="cn.rtt.value != null ? `${cn.rtt.value} ms` : 'N/A'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="💡"
        title="Mode économie de données"
        :value="cn.saveData.value ? 'Activé' : 'Désactivé'"
        mean="saveData indique si l'utilisateur a activé le mode économie de données sur son appareil ou opérateur."
        deduce="Révèle une connexion data limitée ou coûteuse, souvent associée aux forfaits mobiles prépayés ou à la couverture réduite."
        tech-key="navigator.connection.saveData"
        :tech-val="String(cn.saveData.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useConnectivity } from '../../composables/useConnectivity'
import DataCardV2 from '../DataCardV2.vue'
const cn = useConnectivity()
</script>
