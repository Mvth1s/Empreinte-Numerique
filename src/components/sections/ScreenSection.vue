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
        <span class="th-count">9<small>signaux</small></span>
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
        mean="Le Device Pixel Ratio indique la densité de pixels de votre écran (1x = standard, 2x = Retina, 3x = Ultra HD)."
        deduce="Identifie les écrans haute résolution, les appareils mobiles premium, contribue au fingerprinting matériel."
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
        mean="Le refresh rate est mesuré en comptant les frames par seconde via requestAnimationFrame."
        deduce="Distingue les écrans gaming 144Hz+, les dalles 120Hz (mobiles premium) des écrans standard 60Hz."
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
