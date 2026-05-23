<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">💻</span>
        <div>
          <h2>Écran &amp; Matériel</h2>
          <p class="th-sub">La forme de votre écran, à elle seule, est presque une signature.</p>
        </div>
      </div>
      <div>
        <span class="th-count">11<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖥️"
        title="Résolution d'écran"
        :value="sc.resolution.value"
        mean="La résolution totale de votre écran physique est accessible via l'objet screen du navigateur."
        deduce="Contribue à l'empreinte unique de votre appareil, révèle la catégorie de périphérique (mobile/desktop/4K)."
        tech-key="screen.width × screen.height"
        :tech-val="sc.resolution.value"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="📐"
        title="Résolution disponible"
        :value="sc.availResolution.value"
        mean="La zone disponible exclut la barre des tâches, les docks et autres éléments OS fixes."
        deduce="Permet de déduire le système d'exploitation et la configuration de l'interface (barre de tâches visible, etc.)."
        tech-key="screen.availWidth × screen.availHeight"
        :tech-val="sc.availResolution.value"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🔍"
        title="Ratio de pixels (DPR)"
        :value="`×${sc.pixelRatio.value}`"
        mean="C'est le rapport entre les pixels physiques de votre écran et ce que le site perçoit. Un ratio de 2 signifie que votre écran est deux fois plus dense que la normale — c'est ce qu'on appelle un écran Retina ou haute densité."
        deduce="Ce ratio identifie les écrans premium (iPhone, MacBook, Android haut de gamme) et contribue à votre empreinte matérielle unique."
        tech-key="window.devicePixelRatio"
        :tech-val="String(sc.pixelRatio.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="⚙️"
        title="Cœurs CPU logiques"
        :value="sc.cores.value ? `${sc.cores.value} cœurs` : 'Non disponible'"
        mean="navigator.hardwareConcurrency retourne le nombre de threads logiques disponibles pour votre processeur."
        deduce="Révèle la gamme de votre processeur, distingue les appareils mobiles entry-level des workstations haut de gamme."
        tech-key="navigator.hardwareConcurrency"
        :tech-val="String(sc.cores.value ?? 'N/A')"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🧠"
        title="RAM approximative"
        :value="sc.memory.value ? `${sc.memory.value} Go` : 'Non disponible'"
        mean="navigator.deviceMemory retourne la RAM en Go, arrondie à la valeur binaire inférieure (1, 2, 4, 8, etc.)."
        deduce="Identifie la gamme de l'appareil, distingue un smartphone bas de gamme d'un ordinateur professionnel."
        tech-key="navigator.deviceMemory"
        :tech-val="sc.memory.value ? `${sc.memory.value} GB` : 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🔄"
        title="Taux de rafraîchissement"
        :value="sc.refreshRate.value ? `${sc.refreshRate.value} Hz` : 'Calcul…'"
        mean="Votre écran actualise son image un certain nombre de fois par seconde. Le site le mesure en comptant combien de mises à jour se produisent en un temps donné."
        deduce="Un écran à 144Hz ou 120Hz trahit un gameur ou un téléphone premium. Ces valeurs atypiques réduisent considérablement votre anonymat."
        tech-key="requestAnimationFrame › fps measure"
        :tech-val="sc.refreshRate.value ? `${sc.refreshRate.value}Hz` : '…'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🎨"
        title="Profondeur couleur"
        :value="`${sc.colorDepth.value} bits`"
        mean="La profondeur de couleur indique le nombre de bits utilisés pour représenter chaque pixel."
        deduce="Distingue les écrans standards des écrans HDR professionnels, contribue au fingerprinting de la configuration graphique."
        tech-key="screen.colorDepth"
        :tech-val="`${sc.colorDepth.value} bits`"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🌈"
        title="Support HDR (P3)"
        :value="sc.hdr.value ? 'Oui — gamut P3 supporté' : 'Non — gamut sRGB standard'"
        mean="L'API matchMedia détecte si votre écran supporte la large gamme de couleurs DCI-P3 (HDR)."
        deduce="Identifie les dalles premium (iPhone Pro, MacBook, OLED), contribue à l'empreinte matérielle unique."
        tech-key="matchMedia('(color-gamut: p3)')"
        :tech-val="String(sc.hdr.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="👆"
        title="Points de toucher"
        :value="sc.touchPoints.value === 0 ? 'Aucun — souris' : `${sc.touchPoints.value} points simultanés`"
        mean="navigator.maxTouchPoints retourne le nombre de points de contact simultanés supportés par l'écran."
        deduce="Distingue les appareils tactiles des ordinateurs de bureau, identifie les tablettes et écrans tactiles professionnels."
        tech-key="navigator.maxTouchPoints"
        :tech-val="String(sc.touchPoints.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🧮"
        title="Mémoire JS (Heap)"
        :value="sc.heapUsed.value !== null ? `${sc.heapUsed.value} Mo utilisés / ${sc.heapLimit.value} Mo max` : 'Non disponible (Firefox/Safari)'"
        mean="performance.memory expose l'utilisation du tas JavaScript : mémoire utilisée, allouée et limite maximale autorisée."
        deduce="Révèle approximativement la mémoire libre de votre appareil. Chrome uniquement — son absence identifie Firefox ou Safari."
        tech-key="performance.memory.usedJSHeapSize"
        :tech-val="sc.heapUsed.value !== null ? `${sc.heapUsed.value}MB / ${sc.heapLimit.value}MB` : 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="🖥️"
        title="Écrans multiples"
        :value="sc.isExtended.value === null ? 'Non disponible' : sc.isExtended.value ? 'Oui — multi-moniteur détecté' : 'Non — écran unique'"
        mean="screen.isExtended indique si l'écran fait partie d'un setup multi-moniteur. Disponible dans les navigateurs récents."
        deduce="Un setup multi-écrans est un signal rare qui réduit significativement l'ensemble d'anonymat. Révèle un profil pro/développeur."
        tech-key="screen.isExtended"
        :tech-val="String(sc.isExtended.value)"
        severity="faible"
        sev-label="faible"
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
import { useScreen } from '../../composables/useScreen'
import DataCardV2 from '../DataCardV2.vue'
const sc = useScreen()
</script>
