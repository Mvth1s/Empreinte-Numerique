<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">💾</span>
        <div>
          <h2>Stockage</h2>
          <p class="th-sub">Bloquer les cookies ne suffit plus depuis longtemps.</p>
        </div>
      </div>
      <div>
        <span class="th-count">8<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="📦"
        title="localStorage"
        :value="st.localStorageAvail.value ? 'Disponible' : 'Bloqué'"
        mean="localStorage permet de stocker des données persistantes côté client, sans expiration. Idéal pour les trackers à long terme."
        deduce="Si disponible, permet de stocker un identifiant unique persistant qui survit à la fermeture du navigateur."
        tech-key="localStorage.setItem/getItem"
        :tech-val="String(st.localStorageAvail.value)"
        severity="eleve"
        sev-label="élevé"
        :span="4"
      />
      <DataCardV2
        icon="📋"
        title="sessionStorage"
        :value="st.sessionStorageAvail.value ? 'Disponible' : 'Bloqué'"
        mean="sessionStorage stocke des données pour la durée de l'onglet uniquement. Effacé à la fermeture."
        deduce="Permet le suivi de session sans cookie, partage les données entre iframes de même origine."
        tech-key="sessionStorage.setItem/getItem"
        :tech-val="String(st.sessionStorageAvail.value)"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🗄️"
        title="IndexedDB"
        :value="st.indexedDBAvail.value ? 'Disponible' : 'Bloqué'"
        mean="IndexedDB est une base de données NoSQL côté client, capable de stocker des gigaoctets de données structurées."
        deduce="Les trackers avancés utilisent IndexedDB pour stocker des empreintes, des historiques de session et des données de ciblage."
        tech-key="'indexedDB' in window"
        :tech-val="String(st.indexedDBAvail.value)"
        severity="eleve"
        sev-label="élevé"
        :span="4"
      />
      <DataCardV2
        icon="🍪"
        title="Cookies activés"
        :value="st.cookiesEnabled.value ? 'Oui' : 'Non'"
        mean="Les cookies restent le mécanisme de suivi le plus utilisé. Ils permettent le suivi cross-session et la persistance d'identifiants."
        deduce="Avec les cookies, chaque site peut vous assigner un identifiant unique et vous suivre sur toutes vos visites."
        tech-key="navigator.cookieEnabled"
        :tech-val="String(st.cookiesEnabled.value)"
        severity="eleve"
        sev-label="élevé"
        :span="4"
      />
      <DataCardV2
        icon="⚙️"
        title="Service Worker"
        :value="st.serviceWorkerAvail.value ? 'Disponible' : 'Non disponible'"
        mean="Les Service Workers sont des scripts qui s'exécutent en arrière-plan, interceptent les requêtes réseau et peuvent cacher du contenu."
        deduce="Peuvent être utilisés pour du tracking persistant difficile à effacer, même après vidage du cache."
        tech-key="'serviceWorker' in navigator"
        :tech-val="String(st.serviceWorkerAvail.value)"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="📡"
        title="Cache API"
        :value="st.cacheAPIAvail.value ? 'Disponible' : 'Non disponible'"
        mean="L'API Cache permet aux pages et Service Workers de stocker des ressources réseau pour une utilisation hors ligne."
        deduce="Peut être exploitée pour un stockage persistant supplémentaire. Les timings de cache révèlent vos habitudes de navigation."
        tech-key="'caches' in window"
        :tech-val="String(st.cacheAPIAvail.value)"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="💽"
        title="Quota de stockage"
        :value="st.storageQuota.value ?? '…'"
        mean="navigator.storage.estimate() retourne l'espace alloué au site par le navigateur, qui varie selon la capacité du disque."
        deduce="Le quota maximal dépend de votre espace disque disponible — il peut révéler la capacité approximative de votre stockage."
        tech-key="navigator.storage.estimate().quota"
        :tech-val="st.storageQuota.value ?? '…'"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="⏱️"
        title="Timing de cache CDN"
        :value="st.cacheTimings.value.length ? `${st.cacheTimings.value.filter(t => t.cached).length}/${st.cacheTimings.value.length} en cache` : '…'"
        mean="Des requêtes vers des CDN populaires (jQuery, Google Fonts) mesurent si ces ressources sont déjà en cache."
        deduce="Révèle vos visites récentes de sites utilisant ces CDN. Historiquement utilisé pour reconstruire votre historique de navigation."
        tech-key="performance.now() › fetch(cdn, force-cache)"
        :tech-val="st.cacheTimings.value.map(t => `${t.url}: ${t.ms}ms`).join(', ')"
        severity="eleve"
        sev-label="élevé"
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
import { useStorage } from '../../composables/useStorage'
import DataCardV2 from '../DataCardV2.vue'
const st = useStorage()
</script>
