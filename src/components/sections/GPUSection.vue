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
        tech-key="WEBGL_debug_renderer_info › UNMASKED_VENDOR"
        :tech-val="gpu.vendor.value ?? 'N/A'"
        severity="eleve"
        sev-label="élevé"
        :span="6"
      />
      <DataCardV2
        icon="🖼️"
        title="Modèle GPU exact"
        :value="gpu.renderer.value ?? 'Non disponible'"
        mean="Le modèle exact du GPU est retourné par la même extension WebGL. C'est l'une des données les plus identifiantes du navigateur."
        deduce="Identifie précisément votre machine : RTX 4090 vs GTX 1650 vs M3 Pro. Fréquence d'occurrence extrêmement faible."
        tech-key="WEBGL_debug_renderer_info › UNMASKED_RENDERER"
        :tech-val="gpu.renderer.value ?? 'N/A'"
        severity="critique"
        sev-label="critique"
        :span="6"
      />
      <DataCardV2
        icon="🔢"
        title="Hash de rendu WebGL"
        :value="gpu.renderHash.value ?? '…'"
        mean="Un triangle coloré est rendu en WebGL, les pixels sont lus et hashés. Chaque GPU produit un résultat légèrement différent."
        deduce="Ce hash est quasi-unique par GPU et driver. Il persiste même si vous changez navigateur ou activez le mode privé."
        tech-key="WebGL readPixels › SHA-256 (16 chars)"
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
        :value="gpu.webgpu.value ? 'Disponible' : 'Non disponible'"
        mean="WebGPU est la nouvelle API graphique haut niveau, accessible via navigator.gpu dans les navigateurs modernes."
        deduce="Sa disponibilité identifie les utilisateurs de navigateurs récents et réduit l'anonymat par segmentation."
        tech-key="'gpu' in navigator"
        :tech-val="String(gpu.webgpu.value)"
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
        tech-key="WEBGL_compressed_texture_* extensions"
        :tech-val="gpu.supportedTextureFormats.value.join(', ') || 'none'"
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
