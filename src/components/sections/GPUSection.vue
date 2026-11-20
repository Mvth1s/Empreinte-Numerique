<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🎮</span>
        <div>
          <h2>Carte graphique</h2>
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
        title="Fabricant de la carte graphique"
        :value="gpu.vendor.value ?? 'Non fourni'"
        :mean="gpu.masked.value
          ? `La puce qui dessine tout ce que vous voyez à l'écran. Votre navigateur a répondu « ${gpu.vendor.value} » au lieu de son vrai fabricant.`
          : 'La carte graphique est la puce qui dessine tout ce que vous voyez à l\'écran. Le site peut connaître son fabricant sans rien demander.'"
        :deduce="gpu.masked.value
          ? 'Bonne nouvelle : le site ne connaît pas votre fabricant. Il apprend en revanche que vous utilisez une protection, ce qui est un indice en soi : peu de gens en utilisent.'
          : 'NVIDIA, AMD, Intel ou Apple : le fabricant donne une idée du type et du prix de votre appareil.'"
        :tech-key="gpu.rendererSource.value === 'standard' ? 'gl.getParameter(gl.VENDOR)' : 'WEBGL_debug_renderer_info › UNMASKED_VENDOR'"
        :tech-val="gpu.vendor.value ?? 'N/A'"
        severity="eleve"
        sev-label="élevé"
        :masked="gpu.masked.value ? `Il répond « ${gpu.vendor.value} » au lieu du vrai fabricant.` : null"
        :span="6"
      />
      <DataCardV2
        icon="🖼️"
        title="Modèle exact de la carte graphique"
        :value="gpu.renderer.value ?? 'Non fourni'"
        :mean="gpu.masked.value
          ? `Le vrai nom a été remplacé par « ${gpu.renderer.value} ». Sans protection, cette carte afficherait le modèle exact, par exemple « NVIDIA GeForce RTX 3060 ».`
          : gpu.rendererSource.value === 'standard'
          ? 'Votre navigateur donne un nom simplifié de votre carte graphique, mais il reste assez précis pour situer la gamme de votre machine.'
          : 'Le nom exact de votre carte graphique, version comprise. C\'est l\'une des informations qui vous distinguent le plus des autres visiteurs.'"
        :deduce="gpu.masked.value
          ? 'Le modèle est caché. La carte « Dessin 3D » ci-dessous montre si votre navigateur brouille aussi la façon dont la carte dessine.'
          : 'Une carte de jeu à 2 000 € ou une puce d\'entrée de gamme : le modèle situe précisément votre machine, et très peu de visiteurs ont exactement la même.'"
        :tech-key="gpu.rendererSource.value === 'standard' ? 'gl.getParameter(gl.RENDERER)' : 'WEBGL_debug_renderer_info › UNMASKED_RENDERER'"
        :tech-val="gpu.renderer.value ?? 'N/A'"
        severity="critique"
        sev-label="critique"
        :masked="gpu.masked.value ? `Il répond « ${gpu.renderer.value} » au lieu du vrai modèle.` : null"
        :span="6"
      />
      <DataCardV2
        icon="🔢"
        title="Dessin 3D (signature)"
        :value="gpu.renderHash.value ?? '…'"
        mean="Le site fait dessiner une petite scène 3D invisible, puis la résume en un code. Chaque carte graphique dessine avec d'infimes différences, invisibles à l'œil."
        deduce="Ce code est presque propre à votre carte graphique : il reste le même en navigation privée, et souvent même d'un navigateur à l'autre."
        tech-key="WebGL readPixels (256×128) › SHA-256"
        :tech-val="gpu.renderHash.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :masked="prot.webglTampered.value ? 'Il ajoute un léger brouillage au dessin : ce code change d\'une session à l\'autre et ne permet plus de vous reconnaître.' : null"
        :span="4"
      />
      <DataCardV2
        icon="🌐"
        title="WebGL 2"
        :value="gpu.webgl2.value ? 'Supporté' : 'Non supporté'"
        mean="WebGL 2 permet d'afficher de la 3D avancée dans une page (jeux, cartes, visualisations)."
        deduce="Presque tous les appareils récents le gèrent : son absence signale un appareil ancien ou un navigateur particulier."
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
        mean="WebGPU est la nouvelle façon de faire travailler la carte graphique depuis une page. Elle décrit la puce (fabricant, génération) sans rien demander."
        deduce="La génération de la puce date votre matériel, et peut révéler votre carte graphique même quand son nom est caché ailleurs."
        tech-key="navigator.gpu.requestAdapter() › adapter.info"
        :tech-val="gpu.webgpuFeatures.value != null ? `${gpu.webgpuFeatures.value} features` : String(gpu.webgpu.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📦"
        title="Capacités graphiques"
        :value="gpu.supportedTextureFormats.value.length ? gpu.supportedTextureFormats.value.join(', ') : 'Aucun détecté'"
        mean="La liste des formats d'image et des options 3D que votre carte graphique sait gérer. Elle dépend du fabricant, du modèle et de ses pilotes."
        deduce="Cette liste varie d'un appareil à l'autre : ajoutée au reste, elle aide à vous reconnaître."
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
import { useProtection } from '../../composables/useProtection'
import DataCardV2 from '../DataCardV2.vue'
const gpu = useGPU()
const prot = useProtection()
</script>
