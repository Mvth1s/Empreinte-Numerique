<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🎮</span>
        <div>
          <h2>GPU &amp; Rendu</h2>
          <p class="th-sub">Votre carte graphique a une voix : on l'entend dès qu'elle dessine.</p>
        </div>
      </div>
      <div>
        <span class="th-count">6<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🏷️"
        title="Fabricant GPU"
        :value="gpu.vendor.value ?? 'Non disponible'"
        mean="Le navigateur peut interroger votre carte graphique et obtenir le nom exact de son fabricant — sans aucune permission."
        deduce="Que vous ayez NVIDIA, AMD, Intel ou une puce Apple — votre fabricant indique la gamme de votre appareil et réduit significativement l'espace d'anonymat."
        :tech-key="gpu.rendererSource.value === 'standard' ? 'gl.getParameter(gl.VENDOR)' : 'WEBGL_debug_renderer_info › UNMASKED_VENDOR'"
        :tech-val="gpu.vendor.value ?? 'N/A'"
        severity="eleve"
        sev-label="élevé"
        :span="6"
      />
      <DataCardV2
        icon="🖼️"
        title="Modèle GPU exact"
        :value="gpu.renderer.value ?? 'Non disponible'"
        :mean="gpu.rendererSource.value === 'standard'
          ? 'Votre navigateur (Firefox ?) a retiré l\'extension de débogage et renvoie un nom de GPU simplifié — mais toujours assez précis pour situer la gamme de votre machine.'
          : 'Le modèle exact du GPU et de son pilote est retourné par l\'extension WebGL de débogage. C\'est l\'une des données les plus identifiantes du navigateur.'"
        deduce="Identifie précisément votre machine : RTX 4090 vs GTX 1650 vs M3 Pro. Fréquence d'occurrence extrêmement faible."
        :tech-key="gpu.rendererSource.value === 'standard' ? 'gl.getParameter(gl.RENDERER)' : 'WEBGL_debug_renderer_info › UNMASKED_RENDERER'"
        :tech-val="gpu.renderer.value ?? 'N/A'"
        severity="critique"
        sev-label="critique"
        :span="6"
      />
      <DataCardV2
        icon="🔢"
        title="Hash de rendu WebGL"
        :value="gpu.renderHash.value ?? '…'"
        mean="Une scène avec dégradés et fonctions trigonométriques en haute précision est rendue en WebGL, puis tous ses pixels sont hashés. Chaque GPU et pilote arrondit ces calculs un peu différemment."
        deduce="Ce hash est quasi-unique par GPU et driver. Il persiste même si vous changez navigateur ou activez le mode privé."
        tech-key="WebGL readPixels (256×128) › SHA-256"
        :tech-val="gpu.renderHash.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :span="4"
      />
      <DataCardV2
        icon="🌐"
        title="WebGL 2"
        :value="gpu.webgl2.value ? 'Supporté' : 'Non supporté'"
        mean="WebGL 2 est la version moderne de l'API graphique web, offrant des capacités de rendu avancées."
        deduce="Réduit l'espace d'anonymat en divisant les utilisateurs selon leur support WebGL2, contribue au fingerprinting."
        tech-key="canvas.getContext('webgl2')"
        :tech-val="String(gpu.webgl2.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🚀"
        title="WebGPU"
        :value="gpu.webgpuInfo.value ?? (gpu.webgpu.value ? 'Disponible' : 'Non disponible')"
        mean="WebGPU, la nouvelle API graphique, décrit l'adaptateur sans extension ni permission : fabricant et architecture de la puce (ex. nvidia · ampere, apple · metal-3)."
        deduce="L'architecture GPU date votre matériel à la génération près et complète le nom WebGL, même quand celui-ci est masqué."
        tech-key="navigator.gpu.requestAdapter() › adapter.info"
        :tech-val="gpu.webgpuFeatures.value != null ? `${gpu.webgpuFeatures.value} features` : String(gpu.webgpu.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📦"
        title="Formats de texture"
        :value="gpu.supportedTextureFormats.value.length ? gpu.supportedTextureFormats.value.join(', ') : 'Aucun détecté'"
        mean="Votre carte graphique supporte certains formats d'images optimisés pour le rendu 3D. La liste exacte dépend du fabricant, du modèle et des pilotes installés."
        deduce="La combinaison de formats supportés est propre à votre matériel. Elle s'ajoute aux autres signaux GPU pour vous identifier avec précision."
        tech-key="getSupportedExtensions() + MAX_TEXTURE_SIZE"
        :tech-val="`${gpu.glExtensions.value ?? '?'} extensions · max ${gpu.maxTextureSize.value ?? '?'} px`"
        severity="moyen"
        sev-label="moyen"
        :span="12"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useGPU } from '../../composables/useGPU'
import DataCardV2 from '../DataCardV2.vue'
const gpu = useGPU()
</script>
