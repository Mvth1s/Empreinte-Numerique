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
        title="Stockage permanent (localStorage)"
        :value="st.localStorageAvail.value ? 'Disponible' : 'Bloqué'"
        mean="Un petit espace dans votre navigateur où un site peut ranger des informations qui restent indéfiniment, même après avoir éteint l'ordinateur."
        deduce="Un site peut y glisser un numéro qui vous est propre et le relire à chaque visite : une sorte de cookie, mais que l'on pense moins souvent à effacer."
        :masked="st.localStorageAvail.value ? null : 'Votre navigateur bloque ce stockage pour ce site : rien ne peut y être enregistré.'"
        tech-key="localStorage.setItem/getItem"
        :tech-val="String(st.localStorageAvail.value)"
        severity="eleve"
        sev-label="élevé"
        :span="4"
      />
      <DataCardV2
        icon="📋"
        title="Stockage de l'onglet (sessionStorage)"
        :value="st.sessionStorageAvail.value ? 'Disponible' : 'Bloqué'"
        mean="Le même principe, mais tout est effacé quand vous fermez l'onglet."
        deduce="Suffit pour suivre tout votre parcours sur le site pendant la visite, sans aucun cookie."
        :masked="st.sessionStorageAvail.value ? null : 'Votre navigateur bloque ce stockage pour ce site : rien ne peut y être enregistré.'"
        tech-key="sessionStorage.setItem/getItem"
        :tech-val="String(st.sessionStorageAvail.value)"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🗄️"
        title="Base de données (IndexedDB)"
        :value="st.indexedDBAvail.value ? 'Disponible' : 'Bloqué'"
        mean="Une vraie base de données rangée dans votre navigateur, capable de contenir de grandes quantités d'informations."
        deduce="Les outils de pistage s'en servent pour garder votre identifiant et votre historique sur le site, à un endroit qu'on vide rarement."
        :masked="st.indexedDBAvail.value ? null : 'Votre navigateur bloque ce stockage pour ce site : rien ne peut y être enregistré.'"
        tech-key="indexedDB.open() › onsuccess"
        :tech-val="String(st.indexedDBAvail.value)"
        severity="eleve"
        sev-label="élevé"
        :span="4"
      />
      <DataCardV2
        icon="⚙️"
        title="Programme en arrière-plan (Service Worker)"
        :value="st.serviceWorkerAvail.value ? 'Disponible' : 'Non disponible'"
        mean="Un petit programme qu'un site peut installer dans votre navigateur. Il continue de tourner en arrière-plan et sert surtout à faire marcher le site sans connexion."
        deduce="Mal utilisé, il peut garder une trace de vous même après un nettoyage partiel du navigateur."
        tech-key="'serviceWorker' in navigator"
        :tech-val="String(st.serviceWorkerAvail.value)"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="📡"
        title="Réserve de fichiers (Cache API)"
        :value="st.cacheAPIAvail.value ? 'Disponible' : 'Non disponible'"
        mean="Un espace où un site garde des copies de ses fichiers (images, scripts) pour se charger plus vite ou fonctionner hors ligne."
        deduce="Encore un endroit où un site peut cacher un identifiant, en plus des cookies."
        tech-key="'caches' in window"
        :tech-val="String(st.cacheAPIAvail.value)"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="💽"
        title="Espace accordé (et taille du disque)"
        :value="st.diskEstimate.value ? `Disque ≈ ${st.diskEstimate.value}` : st.ephemeralProfile.value ? `${st.storageQuota.value} — navigation privée probable` : (st.storageQuota.value ?? '…')"
        :mean="st.ephemeralProfile.value
          ? `L'espace accordé à ce site (${st.storageQuota.value}) est un nombre rond et fixe : c'est la marque de la navigation privée. Le site le sait sans rien vous demander.`
          : st.diskEstimate.value
          ? `Votre navigateur accorde à ce site ${st.storageQuota.value}. Chrome, Edge et Brave accordent environ 60 % de la taille du disque : on en déduit la taille de votre disque.`
          : 'L\'espace de stockage que votre navigateur accorde à ce site. Il dépend en général de la taille de votre disque.'"
        deduce="256 Go ou 2 To : la taille du disque situe la gamme de votre ordinateur. Et la navigation privée, censée vous rendre discret, se repère ici facilement."
        tech-key="navigator.storage.estimate().quota ÷ 0,6"
        :tech-val="`quota=${st.storageQuota.value ?? '…'} · utilisé=${st.storageUsage.value ?? '…'}`"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="⏱️"
        title="Sites déjà visités ? (test du cache)"
        :value="st.cacheTimings.value.length ? `${st.cacheTimings.value.filter(t => t.cached).length}/${st.cacheTimings.value.length} en cache` : (st.cacheTesting.value ? '…' : 'Test non lancé')"
        mean="Le site chronomètre le chargement de fichiers très répandus sur le web. S'ils arrivent instantanément, c'est qu'ils étaient déjà dans votre navigateur."
        deduce="Cette astuce servait à deviner les sites visités. Depuis 2020-2021, les navigateurs gardent une réserve séparée par site : le test ne révèle plus que vos visites sur ce site-ci."
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
