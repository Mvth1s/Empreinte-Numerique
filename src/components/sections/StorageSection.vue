<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="07" icon="💾" title="Stockage & État"
        description="Les mécanismes de stockage du navigateur sont au cœur du tracking persistant — et certains résistent même à la navigation privée." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="📦" label="LocalStorage" :value="localStorageAvail ? `Disponible — quota: ${storageQuota ?? '…'}` : 'Bloqué'" sensitivity="low"
          inference="Stockage persistant par domaine, illimité dans le temps. Utilisé pour remplacer les cookies avec une durée de vie permanente."
          :loading="!storageQuota" />

        <DataCard icon="⏳" label="SessionStorage" :value="sessionStorageAvail ? 'Disponible' : 'Bloqué'" sensitivity="low"
          inference="Stockage de session, effacé à la fermeture de l'onglet. Moins utilisé pour le tracking, mais permet le suivi intra-session." />

        <DataCard icon="🗄️" label="IndexedDB" :value="indexedDBAvail ? 'Disponible' : 'Bloqué'" sensitivity="low"
          inference="Base de données locale structurée. Peut stocker des gigaoctets de données. Résiste souvent à la navigation privée." />

        <DataCard icon="🍪" label="Cookies activés" :value="cookiesEnabled ? 'Oui — tracking possible' : 'Désactivés'" sensitivity="medium"
          inference="Le mécanisme de tracking principal du web. Un cookie peut persister des années et vous identifier à travers tous les onglets." />

        <DataCard icon="⚙️" label="Service Workers" :value="serviceWorkerAvail ? 'Supportés' : 'Non disponibles'" sensitivity="medium"
          inference="Les SW persistent après la fermeture du navigateur, peuvent mettre en cache du contenu et fonctionner hors-ligne. Vecteur de super-cookie." />

        <DataCard icon="💿" label="Cache API" :value="cacheAPIAvail ? 'Disponible' : 'Non disponible'" sensitivity="low"
          inference="Permet de stocker des ressources web (images, scripts) qui persistent entre les sessions, même en navigation privée." />
      </div>

      <!-- Cache timing attack -->
      <div v-if="cacheTimings.length" class="mt-6 p-4 bg-surface border border-border rounded-lg">
        <div class="font-mono text-[10px] uppercase tracking-widest text-text-s mb-1">⏱️ Attaque de cache (timing)</div>
        <p class="text-xs text-text-s mb-3">
          En mesurant le temps de chargement de ressources CDN populaires, il est possible de détecter si vous les avez chargées récemment — révélant des sites visités.
        </p>
        <div class="space-y-2">
          <div v-for="t in cacheTimings" :key="t.url" class="flex items-center justify-between font-mono text-[11px]">
            <span class="text-text-s truncate mr-4">{{ t.url }}</span>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-cyan">{{ t.ms }} ms</span>
              <span :class="t.cached ? 'text-yellow-400' : 'text-text-s'">
                {{ t.cached ? '⚡ Probablement en cache' : '○ Non en cache' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useStorage } from '../../composables/useStorage'

const { localStorageAvail, sessionStorageAvail, indexedDBAvail, cookiesEnabled, serviceWorkerAvail, cacheAPIAvail, storageQuota, cacheTimings } = useStorage()

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
