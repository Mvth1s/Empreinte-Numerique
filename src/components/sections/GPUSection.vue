<template>
  <div class="wrap section-wrap">
    <SectionHeader index="05" title="GPU & Rendu" />
    <div class="en-grid">
      <DataCard icon="🎮" label="GPU non masqué" sectionIdx="section 05"
        :rows="[
          { k: 'GPU', v: renderer },
          { k: 'VENDOR', v: vendor, cls: 'muted' },
          { k: 'WEBGL_VER', v: webgl2 ? 'WebGL 2.0' : 'WebGL 1.0', cls: 'muted' },
          { k: 'WEBGPU', v: webgpu ? 'Supporté' : 'Non disponible', cls: 'muted' },
          { k: 'EXTENSIONS', v: formatsStr, cls: 'muted' },
        ]"
        inference="Le rendu graphique varie selon votre <strong>carte, ses pilotes et la composition de l'OS</strong>. WEBGL_debug_renderer_info révèle le modèle exact du GPU sans aucune permission."
        sensitivity="critical" :span="6" :loading="!renderer" />

      <DataCard icon="🎲" label="Empreinte de rendu WebGL" sectionIdx="section 05"
        :rows="[{ k: 'RENDER_HASH', v: renderHash }]"
        inference="Un triangle 3D rendu produit des pixels <strong>légèrement différents selon votre GPU, driver et OS</strong>. Ce hash est votre signature graphique — quasi-unique et stable."
        sensitivity="critical" :span="6" :loading="!renderHash" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useGPU } from '../../composables/useGPU'

const { vendor, renderer, webgl2, webgpu, renderHash, supportedTextureFormats } = useGPU()

const formatsStr = computed(() =>
  supportedTextureFormats.value.length ? supportedTextureFormats.value.join(', ') : 'Aucun format compressé')
</script>
