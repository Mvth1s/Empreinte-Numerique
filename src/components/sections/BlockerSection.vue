<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🚫</span>
        <div>
          <h2>Bloqueurs de pub</h2>
          <p class="th-sub">Un site sait si vous bloquez ses publicités — et lesquelles.</p>
        </div>
      </div>
      <div>
        <span class="th-count">4<small>signaux</small></span>
      </div>
    </div>

    <!-- Encadré publicitaire factice : porte les mêmes classes que les vraies bannières -->
    <div class="fake-ad-wrap">
      <div ref="adEl" :class="['fake-ad', BAIT_CLASSES]" id="ad-banner">
        <span class="fake-ad-tag">Publicité</span>
        <div class="fake-ad-body">
          <b>Cet encadré imite une bannière publicitaire.</b>
          <span>Si vous le voyez, aucun bloqueur ne l'a reconnu : un vrai site afficherait ici une pub ciblée grâce à tout ce que vous avez vu dans les autres onglets.</span>
        </div>
      </div>
      <div v-if="adHidden" class="fake-ad-blocked">
        <span>🛡️</span>
        <span>Un encadré publicitaire factice se trouvait ici. <b>Votre bloqueur l'a masqué</b> — et la page vient de le constater en mesurant sa hauteur.</span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🧹"
        title="Filtrage cosmétique"
        :value="bl.cosmeticBlocked.value === null ? 'Analyse…' : bl.cosmeticBlocked.value ? 'Actif — leurre masqué' : 'Inactif — leurre visible'"
        mean="Un élément invisible porteur de classes typiques des publicités (adsbox, ad-banner, adsbygoogle…) est inséré dans la page. Les extensions comme uBlock Origin, AdGuard ou AdBlock Plus le masquent automatiquement."
        deduce="Il suffit ensuite de mesurer sa hauteur : si elle vaut 0, le site sait qu'un bloqueur tourne et peut afficher un mur « désactivez votre bloqueur » ou vous classer dans un segment à part."
        tech-key="div.adsbox › offsetHeight === 0"
        :tech-val="String(bl.cosmeticBlocked.value)"
        :severity="bl.cosmeticBlocked.value ? 'faible' : 'moyen'"
        :sev-label="bl.cosmeticBlocked.value ? 'protégé' : 'exposé'"
        :loading="bl.cosmeticBlocked.value === null"
        :span="6"
      />
      <DataCardV2
        icon="🦁"
        title="Brave Shields"
        :value="bl.isBrave.value ? 'Navigateur Brave détecté' : 'Non (navigateur standard)'"
        mean="Brave se déclare comme Chrome dans son User-Agent mais expose l'objet navigator.brave. Son bloqueur intégré (Shields) agit au niveau réseau plutôt qu'en masquant des éléments."
        deduce="Un utilisateur de Brave est un profil minoritaire et soucieux de sa vie privée : paradoxalement, ce simple fait le distingue des autres visiteurs."
        tech-key="navigator.brave.isBrave()"
        :tech-val="String(bl.isBrave.value)"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="📡"
        title="Blocage des régies et traceurs"
        :value="bl.networkResults.value.length ? `${bl.networkBlocked.value}/${bl.networkResults.value.length} domaines bloqués` : '…'"
        mean="Le site tente de charger les scripts des grandes régies publicitaires et outils de pistage. Une requête qui échoue instantanément a été coupée par une extension, un DNS filtrant (Pi-hole, NextDNS, AdGuard DNS) ou la protection anti-pistage du navigateur."
        deduce="La liste précise des domaines bloqués révèle quelle liste de filtres vous utilisez — encore un détail qui affine votre empreinte."
        tech-key="fetch(no-cors) › TypeError = bloqué"
        :tech-val="bl.networkResults.value.length ? bl.networkResults.value.filter(r => r.blocked).map(r => r.name).join(', ') || 'aucun' : '—'"
        :severity="bl.networkBlocked.value ? 'faible' : 'eleve'"
        :sev-label="bl.networkBlocked.value ? 'protégé' : 'élevé'"
        :span="12"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="bl.networkResults.value.length" class="pdc-data">
              <p v-if="bl.networkInconclusive.value" class="pdc-error">Requête témoin échouée : vous semblez hors ligne, résultat non concluant.</p>
              <div v-for="r in bl.networkResults.value" :key="r.name" class="pdc-row">
                <b>{{ r.name }} <small>({{ r.kind }})</small></b>
                <span :class="r.blocked ? 'pdc-granted' : 'pdc-denied'">{{ r.blocked ? `✕ bloqué · ${r.ms} ms` : `✓ chargé · ${r.ms} ms` }}</span>
              </div>
            </div>
            <p v-else class="pdc-desc">Test en cours auprès de {{ AD_TEST_TARGETS.length }} serveurs publicitaires et de pistage…</p>
            <div class="pdc-actions">
              <button class="pdc-btn" @click="bl.runNetworkTest(true)" :disabled="bl.networkTesting.value">
                {{ bl.networkTesting.value ? 'Test en cours…' : '↻ Relancer le test' }}
              </button>
            </div>
          </div>
        </template>
      </DataCardV2>
      <DataCardV2
        icon="🧾"
        title="Verdict"
        :value="bl.verdict.value"
        mean="Combinaison des tests : filtrage cosmétique (extension), blocage réseau (extension, DNS filtrant ou navigateur) et détection de Brave."
        deduce="Les sites utilisent ce verdict pour afficher des murs anti-bloqueur, réduire le contenu gratuit ou adapter leurs techniques de pistage pour contourner vos protections."
        tech-key="cosmétique ∧ réseau ∧ navigator.brave"
        :tech-val="`cosmétique=${bl.cosmeticBlocked.value} · réseau=${bl.networkBlocked.value ?? 'non testé'}`"
        severity="moyen"
        sev-label="moyen"
        :span="12"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Le test cosmétique n'a besoin d'<strong>aucune requête réseau</strong> : quelques lignes de JavaScript suffisent à n'importe quel site.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBlockers, BAIT_CLASSES, AD_TEST_TARGETS } from '../../composables/useBlockers'
import DataCardV2 from '../DataCardV2.vue'

const bl = useBlockers()
const adEl = ref<HTMLElement | null>(null)
const adHidden = ref(false)

onMounted(() => {
  // Laisse aux bloqueurs le temps d'appliquer leurs feuilles de style génériques.
  setTimeout(() => { adHidden.value = !adEl.value || bl.isHidden(adEl.value) }, 1300)
})
</script>
