<template>
  <section class="section-reveal py-16 border-b border-border" ref="sectionRef">
    <div class="max-w-6xl mx-auto px-6">
      <SectionHeader index="09" icon="🔐" title="Capteurs & Permissions"
        description="L'état de vos permissions est lisible sans les demander — il révèle vos habitudes de sécurité." />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DataCard icon="📍" label="Géolocalisation GPS" :value="permLabel(geolocation)" :sensitivity="permSensitivity(geolocation)"
          inference="Si 'granted': votre position GPS exacte est accessible. Si 'denied': vous avez déjà refusé sur un autre site. Si 'prompt': jamais demandé." />

        <DataCard icon="📷" label="Caméra" :value="permLabel(camera)" :sensitivity="permSensitivity(camera)"
          inference="L'accès à votre caméra révèle potentiellement votre visage, votre environnement et votre activité en temps réel." />

        <DataCard icon="🎤" label="Microphone" :value="permLabel(microphone)" :sensitivity="permSensitivity(microphone)"
          inference="Un microphone accessible permet l'enregistrement audio ambiant. 'granted' sans action de votre part est une anomalie de sécurité." />

        <DataCard icon="🔔" label="Notifications Push" :value="permLabel(notifications)" :sensitivity="permSensitivity(notifications)"
          inference="Les notifications push permettent de vous contacter même navigateur fermé. 'granted' = vous êtes abonné à au moins un site." />

        <DataCard icon="📋" label="Presse-papier (lecture)" :value="permLabel(clipboard)" :sensitivity="permSensitivity(clipboard)"
          inference="L'accès en lecture au presse-papier révèle ce que vous venez de copier : mots de passe, textes confidentiels, URLs." />

        <DataCard icon="💾" label="Stockage persistant" :value="permLabel(persistentStorage)" :sensitivity="permSensitivity(persistentStorage)"
          inference="Autorise le stockage sans expiration. Les sites peuvent stocker des données permanentes difficiles à effacer." />

        <DataCard icon="🎹" label="MIDI" :value="permLabel(midi)" :sensitivity="permSensitivity(midi)"
          inference="L'accès MIDI révèle les instruments connectés et peut identifier un équipement musical professionnel." />

        <DataCard icon="👆" label="Points tactiles max" :value="`${touchPoints} points`" sensitivity="medium"
          inference="maxTouchPoints > 0 = écran tactile. 10 points = smartphone ou tablette moderne. 0 = souris/trackpad uniquement." />

        <DataCard icon="📳" label="Gyroscope/Accéléromètre" :value="hasGyroscope ? 'Disponible (mobile)' : 'Non détecté (desktop)'" sensitivity="medium"
          inference="La présence de capteurs de mouvement confirme un appareil mobile. En combinaison avec la résolution, identifie précisément le type d'appareil." />

        <DataCard icon="🔄" label="Orientation écran" :value="orientation ?? 'Indisponible'" sensitivity="low"
          inference="portrait-primary, landscape-primary… Révèle l'usage courant de l'appareil et confirme mobile vs desktop." />
      </div>

      <!-- Explication visuelle des états -->
      <div class="mt-6 p-4 bg-surface border border-border rounded-lg">
        <div class="font-mono text-[10px] uppercase tracking-widest text-text-s mb-3">Que signifient les états de permission ?</div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-text-s">
          <div class="flex items-start gap-2">
            <span class="text-emerald-400 font-mono mt-0.5">granted</span>
            <span>Vous avez accordé cette permission sur ce site (ou un autre si partagée). L'accès peut être utilisé immédiatement.</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-alert font-mono mt-0.5">denied</span>
            <span>Vous avez explicitement refusé. Révèle que vous utilisez activement vos droits. Certains sites bloquent les utilisateurs qui refusent.</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-yellow-400 font-mono mt-0.5">prompt</span>
            <span>Jamais demandé sur ce navigateur. Le site peut demander à tout moment sans pré-consentement.</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { usePermissions } from '../../composables/usePermissions'
import type { Sensitivity } from '../../types'

const { geolocation, camera, microphone, notifications, clipboard, persistentStorage, midi, touchPoints, hasGyroscope, orientation } = usePermissions()

function permLabel(state: string): string {
  const map: Record<string, string> = {
    granted: 'Accordée ⚠️',
    denied: 'Refusée',
    prompt: 'Pas encore demandée',
    indisponible: 'Non supportée',
  }
  return map[state] ?? state
}

function permSensitivity(state: string): Sensitivity {
  if (state === 'granted') return 'critical'
  if (state === 'denied') return 'low'
  return 'medium'
}

const sectionRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sectionRef.value?.classList.add('visible'); obs.disconnect() } }, { threshold: 0.1 })
  if (sectionRef.value) obs.observe(sectionRef.value)
})
</script>
