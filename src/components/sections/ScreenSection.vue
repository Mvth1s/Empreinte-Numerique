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
        mean="La taille de votre écran, en points. Le site peut en déduire le nombre réel de pixels de l'écran (voir le pied de la carte)."
        deduce="Téléphone, portable, grand écran 4K… La taille de l'écran est l'un des éléments de base pour vous reconnaître parmi d'autres visiteurs."
        tech-key="screen.width × devicePixelRatio"
        :tech-val="`physique ≈ ${sc.physicalResolution.value}`"
        severity="moyen"
        sev-label="moyen"
        :masked="screenMasked"
        :span="4"
      />
      <DataCardV2
        icon="📐"
        title="Résolution disponible"
        :value="sc.availResolution.value"
        mean="La partie de l'écran réellement utilisable, sans la barre des tâches (Windows) ou le Dock (Mac)."
        deduce="La place prise par la barre des tâches dépend de votre système et de vos réglages (taille, position, masquage automatique) : un détail de plus qui vous distingue."
        tech-key="screen.availWidth × screen.availHeight"
        :tech-val="sc.availResolution.value"
        severity="faible"
        sev-label="faible"
        :masked="screenMasked"
        :span="4"
      />
      <DataCardV2
        icon="🔍"
        title="Finesse de l'écran"
        :value="`×${sc.pixelRatio.value}`"
        mean="Le nombre de vrais pixels utilisés pour dessiner un point. ×2 veut dire un écran deux fois plus fin que la normale (écran « Retina »). Votre niveau de zoom change aussi ce chiffre."
        deduce="Les écrans très fins équipent surtout les téléphones et ordinateurs haut de gamme : un indice sur votre appareil et son prix."
        tech-key="window.devicePixelRatio"
        :tech-val="String(sc.pixelRatio.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="⚙️"
        title="Cœurs du processeur"
        :value="sc.cores.value ? `${sc.cores.value} cœurs logiques` : 'Non fourni'"
        mean="Le nombre de tâches que votre processeur peut mener en même temps. Plus il y en a, plus l'appareil est puissant."
        deduce="Distingue un petit téléphone (4 cœurs) d'un ordinateur de jeu ou de travail (16 ou plus) : la gamme et le prix de votre appareil."
        tech-key="navigator.hardwareConcurrency"
        :tech-val="String(sc.cores.value ?? 'N/A')"
        severity="moyen"
        sev-label="moyen"
        :masked="coresMasked"
        :span="4"
      />
      <DataCardV2
        icon="🧠"
        title="Mémoire vive (RAM)"
        :value="sc.memoryLabel.value ?? 'Non fournie'"
        :mean="sc.memoryCapped.value
          ? `La mémoire de travail de votre appareil. Le navigateur l'arrondit et s'arrête volontairement à un plafond : « ${sc.memory.value} Go ou plus » veut dire que vous en avez au moins ${sc.memory.value}, peut-être bien davantage.`
          : 'La mémoire de travail de votre appareil, arrondie volontairement par le navigateur (1, 2, 4, 8 Go…) pour rester approximative.'"
        deduce="Même approximative, elle sépare un téléphone d'entrée de gamme (4 Go ou moins) d'un ordinateur récent."
        tech-key="navigator.deviceMemory"
        :tech-val="sc.memory.value != null ? `${sc.memory.value}${sc.memoryCapped.value ? ' (plafonné)' : ''}` : 'undefined'"
        severity="moyen"
        sev-label="moyen"
        :masked="sc.memory.value == null ? NOT_GIVEN : null"
        :span="4"
      />
      <DataCardV2
        icon="🔄"
        title="Fluidité de l'écran"
        :value="sc.refreshRate.value ? `${sc.refreshRate.value} Hz` : 'Calcul…'"
        mean="Le nombre d'images que votre écran affiche chaque seconde (60, 120, 144…). Le site le mesure simplement en chronométrant l'affichage de la page."
        deduce="Un écran à 120 ou 144 images par seconde trahit un joueur ou un téléphone haut de gamme : une valeur peu courante qui vous distingue."
        tech-key="requestAnimationFrame › médiane Δt"
        :tech-val="sc.refreshRate.value ? `${sc.refreshRate.value}Hz` : '…'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🎨"
        title="Nombre de couleurs"
        :value="`${sc.colorDepth.value} bits`"
        mean="La précision des couleurs de votre écran. 24 bits, c'est environ 16 millions de couleurs : la valeur de la plupart des écrans."
        deduce="Une valeur différente de 24 (30 bits, par exemple) signale un écran haut de gamme ou professionnel, donc rare."
        tech-key="screen.colorDepth"
        :tech-val="`${sc.colorDepth.value} bits`"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🌈"
        title="Écran HDR et couleurs"
        :value="`${sc.hdr.value ? 'HDR actif' : 'SDR'} · ${sc.colorGamut.value}`"
        mean="Le site demande si votre écran affiche le HDR (lumières plus éclatantes) et quelle palette de couleurs il couvre : standard (sRGB) ou étendue (P3, Rec.2020)."
        deduce="Un écran HDR ou à couleurs étendues équipe surtout les appareils haut de gamme (iPhone, MacBook, écrans OLED) : un indice sur votre matériel."
        tech-key="matchMedia('(dynamic-range: high)') + color-gamut"
        :tech-val="`hdr=${sc.hdr.value} gamut=${sc.colorGamut.value}`"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="👆"
        title="Écran tactile"
        :value="sc.touchPoints.value === 0 ? 'Aucun — souris' : `${sc.touchPoints.value} points simultanés`"
        mean="Le nombre de doigts que votre écran peut détecter en même temps. Zéro veut dire pas d'écran tactile."
        deduce="Distingue un ordinateur classique d'un téléphone, d'une tablette ou d'un ordinateur portable à écran tactile."
        tech-key="navigator.maxTouchPoints"
        :tech-val="String(sc.touchPoints.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🧮"
        title="Mémoire de cet onglet"
        :value="sc.heapUsed.value !== null ? `${sc.heapUsed.value} Mo utilisés / ${sc.heapLimit.value} Mo max` : 'Non fournie'"
        mean="La mémoire utilisée par cette page, et la limite que le navigateur lui accorde. Seuls Chrome, Edge et les navigateurs de la même famille la donnent."
        deduce="La limite change selon l'appareil (ordinateur ou téléphone) et sa mémoire : un indice de plus sur votre matériel."
        tech-key="performance.memory.usedJSHeapSize"
        :tech-val="sc.heapUsed.value !== null ? `${sc.heapUsed.value}MB / ${sc.heapLimit.value}MB` : 'N/A'"
        severity="moyen"
        sev-label="moyen"
        :masked="sc.heapUsed.value === null ? NOT_GIVEN : null"
        :span="6"
      />
      <DataCardV2
        icon="🔋"
        title="Batterie"
        :value="sc.battery.value ? `${sc.battery.value.level}% — ${sc.battery.value.charging ? 'en charge' : 'sur batterie'}` : 'Non fournie'"
        mean="Le niveau de votre batterie, si elle est en charge, et le temps restant estimé."
        deduce="Un niveau précis (par exemple 37 %) change lentement : deux onglets ouverts au même moment avec la même valeur appartiennent probablement à la même personne."
        tech-key="navigator.getBattery()"
        :tech-val="sc.battery.value ? `${sc.battery.value.level}% charging=${sc.battery.value.charging}` : 'N/A'"
        severity="faible"
        sev-label="faible"
        :masked="sc.battery.value ? null : NOT_GIVEN"
        :span="6"
      />
      <DataCardV2
        icon="🖥️"
        title="Écrans multiples"
        :value="sc.isExtended.value === null ? 'Non fourni' : sc.isExtended.value ? 'Oui, plusieurs écrans' : 'Non, un seul écran'"
        mean="Indique si votre ordinateur est branché à plusieurs écrans."
        deduce="Peu de gens travaillent sur plusieurs écrans : c'est un signe rare, qui évoque plutôt un usage professionnel ou de jeu."
        tech-key="screen.isExtended"
        :tech-val="String(sc.isExtended.value)"
        severity="faible"
        sev-label="faible"
        :masked="sc.isExtended.value === null ? NOT_GIVEN : null"
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
import { computed } from 'vue'
import { useScreen } from '../../composables/useScreen'
import { useProtection, NOT_GIVEN } from '../../composables/useProtection'
import DataCardV2 from '../DataCardV2.vue'
const sc = useScreen()
const prot = useProtection()

const screenMasked = computed(() => prot.screenSpoofed.value
  ? 'Il annonce la taille de la fenêtre au lieu de celle de l\'écran (Firefox en mode anti-empreinte ou Tor Browser).'
  : null)
// Brave remplace le nombre de cœurs par une valeur au hasard (inférieure ou égale au vrai nombre).
const coresMasked = computed(() => prot.braveFarbling.value
  ? 'Brave remplace ce nombre par une valeur tirée au hasard, inférieure ou égale au vrai nombre de cœurs.'
  : sc.cores.value ? null : NOT_GIVEN)
</script>
