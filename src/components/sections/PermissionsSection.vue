<template>
  <div class="wrap section-wrap">
    <SectionHeader index="09" title="Capteurs & Permissions" />
    <div class="en-grid">
      <DataCard icon="🔐" label="Permissions API" sectionIdx="section 09"
        :rows="[
          { k: 'GÉOLOCALISATION', v: permLabel(geolocation), cls: permCls(geolocation) },
          { k: 'CAMÉRA', v: permLabel(camera), cls: permCls(camera) },
          { k: 'MICROPHONE', v: permLabel(microphone), cls: permCls(microphone) },
          { k: 'NOTIFICATIONS', v: permLabel(notifications), cls: permCls(notifications) },
          { k: 'PRESSE_PAPIER', v: permLabel(clipboard), cls: permCls(clipboard) },
          { k: 'STOCKAGE_PERSIST', v: permLabel(persistentStorage), cls: permCls(persistentStorage) },
          { k: 'MIDI', v: permLabel(midi), cls: permCls(midi) },
        ]"
        inference="L'état de vos permissions est lisible <strong>sans les demander</strong>. <code>granted</code> révèle un accès actif, <code>denied</code> votre comportement de sécurité, <code>prompt</code> = jamais sollicité."
        sensitivity="high" :span="6" />

      <DataCard icon="📳" label="Capteurs & Appareil" sectionIdx="section 09"
        :rows="[
          { k: 'TACTILE_MAX', v: `${touchPoints} points`, cls: touchPoints > 0 ? '' : 'muted' },
          { k: 'GYROSCOPE', v: hasGyroscope ? 'Disponible (mobile/tablette)' : 'Non détecté (desktop)', cls: hasGyroscope ? '' : 'muted' },
          { k: 'ORIENTATION', v: orientation ?? 'Non disponible', cls: 'muted' },
        ]"
        inference="La présence de capteurs IMU <strong>confirme un appareil mobile</strong>. Combiné à la résolution et DPR, identifie précisément le type de matériel — sans permission requise."
        sensitivity="medium" :span="6" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { usePermissions } from '../../composables/usePermissions'

const { geolocation, camera, microphone, notifications, clipboard, persistentStorage, midi, touchPoints, hasGyroscope, orientation } = usePermissions()

function permLabel(state: string): string {
  const map: Record<string, string> = {
    granted: 'ACCORDÉE ⚠️',
    denied: 'Refusée',
    prompt: 'Pas encore demandée',
    indisponible: 'Non supportée',
  }
  return map[state] ?? state
}

function permCls(state: string): string {
  if (state === 'granted') return 'bad'
  if (state === 'denied') return 'warn'
  return 'muted'
}
</script>
