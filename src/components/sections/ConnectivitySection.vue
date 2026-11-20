<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">📡</span>
        <div>
          <h2>Connectivité</h2>
          <p class="th-sub">Type de connexion, vitesse, temps de réponse : tout est mesuré en silence.</p>
        </div>
      </div>
      <div>
        <span class="th-count">7<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌐"
        title="Statut en ligne"
        :value="cn.online.value ? 'En ligne' : 'Hors ligne'"
        mean="Indique simplement si votre appareil est connecté à Internet en ce moment."
        deduce="Un site peut noter quand vous perdez la connexion (métro, mode avion) et en déduire un peu de vos déplacements."
        tech-key="navigator.onLine"
        :tech-val="String(cn.online.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📶"
        title="Type de connexion"
        :value="cn.connectionType.value ?? 'Non fourni'"
        mean="Le type de connexion utilisé : Wi-Fi, réseau mobile ou câble. Surtout donné sur Android."
        deduce="Wi-Fi ou 4G : le site devine si vous êtes chez vous, au bureau ou en déplacement."
        :masked="cn.connectionType.value ? null : NOT_GIVEN"
        tech-key="navigator.connection.type"
        :tech-val="cn.connectionType.value ?? 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="📊"
        title="Qualité de connexion (4G/3G…)"
        :value="cn.effectiveType.value ?? 'Non fourni'"
        mean="Le navigateur classe la qualité réelle de votre connexion dans une catégorie simple (4G, 3G, 2G), quel que soit votre forfait."
        deduce="Une connexion lente trahit une zone mal couverte, un réseau saturé ou un partage de connexion depuis un téléphone."
        :masked="cn.effectiveType.value ? null : NOT_GIVEN"
        tech-key="navigator.connection.effectiveType"
        :tech-val="cn.effectiveType.value ?? 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="⬇️"
        title="Vitesse estimée par le navigateur"
        :value="cn.downlink.value != null ? (cn.downlink.value >= DOWNLINK_CAP ? `${cn.downlink.value} Mb/s ou plus` : `≈ ${cn.downlink.value} Mb/s`) : 'Non fourni'"
        mean="Une estimation grossière de votre vitesse de téléchargement. Elle est volontairement arrondie et plafonnée à 10 Mb/s : une fibre à 1 Gb/s s'affiche « 10 Mb/s ». La vraie mesure est plus bas."
        deduce="Même approximative, elle sépare les connexions lentes (mobile, satellite) des rapides."
        :masked="cn.downlink.value != null ? null : NOT_GIVEN"
        tech-key="navigator.connection.downlink"
        :tech-val="cn.downlink.value != null ? `${cn.downlink.value} Mb/s` : 'N/A'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="⏱️"
        title="Temps de réponse estimé"
        :value="cn.rtt.value != null ? `≈ ${cn.rtt.value} ms` : 'Non fourni'"
        mean="Le temps d'un aller-retour entre votre appareil et Internet, comme un écho, en millièmes de seconde (ms). Plus il est court, plus la connexion réagit vite."
        deduce="Un écho très lent trahit souvent un VPN dont le serveur est loin, une connexion par satellite ou un réseau mobile faible."
        :masked="cn.rtt.value != null ? null : NOT_GIVEN"
        tech-key="navigator.connection.rtt (arrondi 25 ms)"
        :tech-val="cn.rtt.value != null ? `${cn.rtt.value} ms` : 'N/A'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="💡"
        title="Mode économie de données"
        :value="cn.downlink.value == null ? 'Non fourni' : cn.saveData.value ? 'Activé' : 'Désactivé'"
        mean="Indique si vous avez activé l'économiseur de données de votre téléphone ou de votre navigateur."
        deduce="Signale un forfait limité ou cher : une information que des publicitaires utilisent pour deviner votre budget."
        :masked="cn.downlink.value != null ? null : NOT_GIVEN"
        tech-key="navigator.connection.saveData"
        :tech-val="String(cn.saveData.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🚀"
        title="Vitesse réelle mesurée"
        :value="cn.speed.value ? `${cn.speed.value.downMbps} Mb/s · ${cn.speed.value.pingMs} ms` : (cn.speedError.value ? 'Mesure impossible' : '…')"
        mean="Le site mesure lui-même votre connexion en chronométrant le téléchargement d'un fichier, sans rien vous demander. Contrairement aux estimations ci-dessus, c'est le vrai chiffre."
        deduce="La vitesse distingue fibre, ADSL, 4G ou 5G. Et le serveur qui répond est celui le plus proche de chez vous : il révèle une grande ville voisine."
        tech-key="fetch(speed.cloudflare.com/__down) › performance.now()"
        :tech-val="cn.speed.value ? `gigue ${cn.speed.value.jitterMs} ms${cn.speed.value.colo ? ` · PoP ${cn.speed.value.colo}` : ''}` : '—'"
        severity="moyen"
        sev-label="moyen"
        :span="12"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="cn.speed.value" class="pdc-data">
              <div class="pdc-row"><b>Débit descendant</b><span>{{ cn.speed.value.downMbps }} Mb/s</span></div>
              <div class="pdc-row"><b>Latence (médiane)</b><span>{{ cn.speed.value.pingMs }} ms</span></div>
              <div class="pdc-row"><b>Gigue</b><span>{{ cn.speed.value.jitterMs }} ms</span></div>
              <div v-if="cn.speed.value.colo" class="pdc-row"><b>Serveur Cloudflare</b><span>{{ cn.speed.value.colo }}{{ cn.speed.value.city ? ` (${cn.speed.value.city})` : '' }}</span></div>
            </div>
            <p v-else-if="cn.speedError.value" class="pdc-error">Mesure impossible (hors ligne ou requête bloquée).</p>
            <p v-else class="pdc-desc">Mesure en cours auprès de {{ SPEED_TEST_HOST }}…</p>
            <div class="pdc-actions">
              <button class="pdc-btn" @click="cn.runSpeedTest(true)" :disabled="cn.speedTesting.value">
                {{ cn.speedTesting.value ? 'Mesure en cours…' : '↻ Relancer la mesure' }}
              </button>
            </div>
          </div>
        </template>
      </DataCardV2>
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConnectivity, DOWNLINK_CAP, SPEED_TEST_HOST } from '../../composables/useConnectivity'
import { NOT_GIVEN } from '../../composables/useProtection'
import DataCardV2 from '../DataCardV2.vue'
const cn = useConnectivity()
// Lancée à l'ouverture de l'onglet (et non dans le composable, aussi appelé par App.vue au chargement).
onMounted(() => { cn.runSpeedTest() })
</script>
