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
        <span class="th-count">7<small>signaux</small></span>
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
        tech-key="indexedDB.open() › onsuccess"
        :tech-val="String(st.indexedDBAvail.value)"
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
        :span="6"
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
        :span="6"
      />
      <DataCardV2
        icon="💽"
        title="Quota de stockage"
        :value="st.diskEstimate.value ? `Disque ≈ ${st.diskEstimate.value}` : st.ephemeralProfile.value ? `${st.storageQuota.value} — navigation privée probable` : (st.storageQuota.value ?? '…')"
        :mean="st.ephemeralProfile.value
          ? `Le quota accordé (${st.storageQuota.value}) est une valeur fixe et ronde : c'est la signature d'un profil temporaire, typiquement la navigation privée. Le site le sait sans rien vous demander.`
          : st.diskEstimate.value
          ? `Votre navigateur accorde à ce site un quota de ${st.storageQuota.value}. Chrome, Edge et Brave fixent ce quota à environ 60 % de la taille totale du disque : on en déduit la capacité de votre disque.`
          : 'navigator.storage.estimate() retourne l\'espace alloué au site par le navigateur, qui dépend de la taille du disque.'"
        deduce="La taille du disque distingue un ordinateur d'entrée de gamme (256 Go) d'une station de travail (2 To). Un quota anormalement faible trahit la navigation privée."
        tech-key="navigator.storage.estimate().quota ÷ 0,6"
        :tech-val="`quota=${st.storageQuota.value ?? '…'} · utilisé=${st.storageUsage.value ?? '…'}`"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="⏱️"
        title="Timing de cache CDN"
        :value="st.cacheTimings.value.length ? `${st.cacheTimings.value.filter(t => t.cached).length}/${st.cacheTimings.value.length} en cache` : (st.cacheTesting.value ? '…' : 'Test non lancé')"
        mean="Des requêtes vers des CDN populaires (jQuery, Google Fonts) mesurent si ces ressources sont déjà en cache. Depuis 2020-2021, Chrome, Firefox et Safari partitionnent leur cache par site, ce qui neutralise en grande partie cette technique."
        deduce="Révèle vos visites récentes de sites utilisant ces CDN. Historiquement utilisé pour reconstruire votre historique de navigation."
        tech-key="performance.now() › fetch(cdn, force-cache)"
        :tech-val="st.cacheTimings.value.length ? st.cacheTimings.value.map(t => `${t.url}: ${t.ms}ms`).join(', ') : '—'"
        severity="eleve"
        sev-label="élevé"
        :span="6"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="st.cacheTimings.value.length" class="pdc-data">
              <div v-for="t in st.cacheTimings.value" :key="t.url" class="pdc-row">
                <b>{{ t.url }}</b><span>{{ t.ms }} ms · {{ t.cached ? 'en cache' : 'non caché' }}</span>
              </div>
            </div>
            <template v-else>
              <p class="pdc-desc">Ce test contacte {{ hosts }}. Ces serveurs verront votre adresse IP.</p>
              <button class="pdc-btn" @click="st.runCacheTest" :disabled="st.cacheTesting.value">
                {{ st.cacheTesting.value ? 'Mesure en cours…' : '▸ Lancer le test' }}
              </button>
            </template>
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
import { useStorage, CACHE_TEST_TARGETS } from '../../composables/useStorage'
import DataCardV2 from '../DataCardV2.vue'
const st = useStorage()
const hosts = CACHE_TEST_TARGETS.map(t => t.host).join(', ')
</script>
