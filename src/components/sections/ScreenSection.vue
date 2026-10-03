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
        <span class="th-count">12<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖥️"
        title="Résolution d'écran"
        :value="sc.resolution.value"
        mean="La résolution de votre écran en pixels CSS est accessible via l'objet screen. Multipliée par le ratio de pixels, elle donne la définition physique réelle de la dalle."
        deduce="Contribue à l'empreinte unique de votre appareil, révèle la catégorie de périphérique (mobile/desktop/4K)."
        tech-key="screen.width × devicePixelRatio"
        :tech-val="`physique ≈ ${sc.physicalResolution.value}`"
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
        :value="sc.cores.value ? `${sc.cores.value} threads logiques` : 'Non disponible'"
        mean="navigator.hardwareConcurrency retourne le nombre de threads logiques (cœurs × hyperthreading). Valeur exacte sur Chrome/Edge ; Safari peut la plafonner, Brave et Firefox (mode anti-fingerprinting) la falsifient."
        deduce="Révèle la gamme de votre processeur, distingue les appareils mobiles entry-level des workstations haut de gamme."
        tech-key="navigator.hardwareConcurrency"
        :tech-val="String(sc.cores.value ?? 'N/A')"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🧠"
        title="RAM (tranche)"
        :value="sc.memoryLabel.value ?? 'Non exposée (Firefox/Safari)'"
        :mean="sc.memoryCapped.value
          ? `navigator.deviceMemory est arrondi et plafonné pour limiter le fingerprinting : la plupart des navigateurs s'arrêtent à 8 Go (une machine de 16 ou 32 Go renvoie aussi 8), Chrome récent à 32 Go. Votre valeur (${sc.memory.value}) est un plafond : on sait seulement que vous avez au moins ${sc.memory.value} Go.`
          : 'navigator.deviceMemory renvoie la RAM arrondie à une puissance de 2 (0,25 · 0,5 · 1 · 2 · 4 · 8 · 16 · 32 Go). Chromium uniquement : Firefox et Safari ne l\'exposent pas.'"
        deduce="Même grossière, cette tranche distingue un smartphone d'entrée de gamme (≤ 4 Go) d'un ordinateur récent. Le plafond existe précisément pour limiter le fingerprinting."
        tech-key="navigator.deviceMemory"
        :tech-val="sc.memory.value != null ? `${sc.memory.value}${sc.memoryCapped.value ? ' (plafonné)' : ''}` : 'undefined'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🔄"
        title="Taux de rafraîchissement"
        :value="sc.refreshRate.value ? `${sc.refreshRate.value} Hz` : 'Calcul…'"
        mean="Votre écran actualise son image un certain nombre de fois par seconde. Le site mesure l'intervalle médian entre 90 images consécutives puis l'arrondit à la fréquence standard la plus proche (60, 120, 144 Hz…)."
        deduce="Un écran à 144Hz ou 120Hz trahit un gameur ou un téléphone premium. Ces valeurs atypiques réduisent considérablement votre anonymat."
        tech-key="requestAnimationFrame › médiane Δt"
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
        title="HDR & gamut couleur"
        :value="`${sc.hdr.value ? 'HDR actif' : 'SDR'} · ${sc.colorGamut.value}`"
        mean="Deux media queries distinctes : dynamic-range indique si l'écran affiche du HDR, color-gamut la largeur de la palette (sRGB, Display P3, Rec.2020)."
        deduce="Un écran HDR ou P3 identifie une dalle premium (iPhone Pro, MacBook, OLED, moniteur HDR) et contribue à l'empreinte matérielle unique."
        tech-key="matchMedia('(dynamic-range: high)') + color-gamut"
        :tech-val="`hdr=${sc.hdr.value} gamut=${sc.colorGamut.value}`"
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
        mean="performance.memory expose l'utilisation du tas JavaScript de cet onglet et la limite fixée par le moteur V8 (≈ 4 Go sur un ordinateur 64 bits, moins sur mobile)."
        deduce="La limite trahit l'architecture (32/64 bits, mobile ou desktop). Chromium uniquement — son absence identifie Firefox ou Safari."
        tech-key="performance.memory.usedJSHeapSize"
        :tech-val="sc.heapUsed.value !== null ? `${sc.heapUsed.value}MB / ${sc.heapLimit.value}MB` : 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="🔋"
        title="Batterie"
        :value="sc.battery.value ? `${sc.battery.value.level}% — ${sc.battery.value.charging ? 'en charge' : 'sur batterie'}` : 'Non disponible (Firefox/Safari)'"
        mean="L'API Battery Status expose le niveau de charge, l'état de charge et les temps estimés de charge/décharge."
        deduce="Un niveau de batterie faible peut indiquer une utilisation mobile. Les variations de charge identifient les sessions au fil du temps et contribuent au fingerprinting comportemental."
        tech-key="navigator.getBattery()"
        :tech-val="sc.battery.value ? `${sc.battery.value.level}% charging=${sc.battery.value.charging}` : 'N/A'"
        severity="faible"
        sev-label="faible"
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
