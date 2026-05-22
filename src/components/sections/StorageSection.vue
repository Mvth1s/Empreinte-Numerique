<template>
  <div class="wrap section-wrap">
    <SectionHeader index="07" title="Stockage & État" />
    <div class="en-grid">
      <DataCard icon="📦" label="Stockage local" sectionIdx="section 07"
        :rows="[
          { k: 'LOCAL_STORAGE', v: localStorageAvail ? 'Disponible' : 'Bloqué' },
          { k: 'SESSION_STORAGE', v: sessionStorageAvail ? 'Disponible' : 'Bloqué', cls: 'muted' },
          { k: 'INDEXED_DB', v: indexedDBAvail ? 'Disponible' : 'Bloqué', cls: 'muted' },
          { k: 'QUOTA_ESTIMÉ', v: storageQuota ?? '…', cls: 'muted' },
        ]"
        inference="LocalStorage persiste <strong>indefiniment</strong>, IndexedDB peut stocker des Go. Même en navigation privée, certains persistent. Vecteurs de super-cookie."
        sensitivity="medium" :span="4" :loading="!storageQuota" />

      <DataCard icon="🍪" label="Cookies & Workers" sectionIdx="section 07"
        :rows="[
          { k: 'COOKIES', v: cookiesEnabled ? 'Activés' : 'Désactivés' },
          { k: 'SERVICE_WORKER', v: serviceWorkerAvail ? 'Supporté' : 'Non disponible', cls: 'muted' },
          { k: 'CACHE_API', v: cacheAPIAvail ? 'Disponible' : 'Non disponible', cls: 'muted' },
        ]"
        inference="Les Service Workers <strong>persistent après fermeture du navigateur</strong> et peuvent servir un super-cookie résistant au vidage de cache."
        sensitivity="high" :span="4" />

      <DataCard v-if="cacheTimings.length" icon="⏱️" label="Cache timing (attaque)" sectionIdx="section 07"
        :rows="cacheTimings.map(t => ({ k: t.url.replace('https://', '').split('/')[0], v: `${t.ms} ms${t.cached ? ' ⚡ cache' : ''}`, cls: t.cached ? 'warn' : 'muted' }))"
        inference="En mesurant le temps de chargement de CDN populaires, on détecte si vous les avez chargés récemment — <strong>révélant des sites visités</strong> sans aucun accès historique."
        sensitivity="high" :span="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useStorage } from '../../composables/useStorage'

const { localStorageAvail, sessionStorageAvail, indexedDBAvail, cookiesEnabled, serviceWorkerAvail, cacheAPIAvail, storageQuota, cacheTimings } = useStorage()
</script>
