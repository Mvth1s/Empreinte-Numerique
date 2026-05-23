<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🔐</span>
        <div>
          <h2>Permissions &amp; Accès aux capteurs</h2>
          <p class="th-sub">L'API Permissions révèle l'état d'accès à votre géolocalisation, caméra, micro et bien d'autres — même sans que vous les ayez accordées.</p>
        </div>
      </div>
      <div>
        <span class="th-count">9<small>signaux collectés</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="📍"
        title="Géolocalisation"
        :value="permLabel(pm.geolocation.value)"
        mean="navigator.permissions.query({name:'geolocation'}) révèle l'état d'autorisation sans déclencher de popup."
        deduce="Un état 'granted' signifie que vous avez déjà autorisé la géolocalisation sur ce site ou un autre."
        tech-key="permissions.query({name:'geolocation'})"
        :tech-val="pm.geolocation.value"
        :severity="permSeverity(pm.geolocation.value)"
        :sev-label="pm.geolocation.value"
        :span="4"
      />
      <DataCardV2
        icon="📷"
        title="Caméra"
        :value="permLabel(pm.camera.value)"
        mean="L'état d'autorisation de la caméra est vérifiable sans déclencher de demande d'accès."
        deduce="Un accès caméra 'granted' permet le suivi des expressions faciales, le scan de documents, la surveillance passive."
        tech-key="permissions.query({name:'camera'})"
        :tech-val="pm.camera.value"
        :severity="permSeverity(pm.camera.value)"
        :sev-label="pm.camera.value"
        :span="4"
      />
      <DataCardV2
        icon="🎤"
        title="Microphone"
        :value="permLabel(pm.microphone.value)"
        mean="L'accès au microphone est l'une des permissions les plus sensibles — elle permet l'enregistrement audio."
        deduce="Un accès 'granted' permettrait l'écoute passive de conversations, la transcription en temps réel, l'empreinte vocale."
        tech-key="permissions.query({name:'microphone'})"
        :tech-val="pm.microphone.value"
        :severity="permSeverity(pm.microphone.value)"
        :sev-label="pm.microphone.value"
        :span="4"
      />
      <DataCardV2
        icon="🔔"
        title="Notifications"
        :value="permLabel(pm.notifications.value)"
        mean="L'état d'autorisation des notifications push peut être vérifié sans déclencher de demande."
        deduce="Les notifications permettent un re-engagement même quand le site n'est pas ouvert, souvent utilisées pour des publicités."
        tech-key="permissions.query({name:'notifications'})"
        :tech-val="pm.notifications.value"
        :severity="permSeverity(pm.notifications.value)"
        :sev-label="pm.notifications.value"
        :span="4"
      />
      <DataCardV2
        icon="📋"
        title="Presse-papiers"
        :value="permLabel(pm.clipboard.value)"
        mean="clipboard-read permet la lecture du presse-papiers. Son état d'autorisation est consultable silencieusement."
        deduce="Un accès 'granted' permettrait de lire des mots de passe, clés API ou données copiées récemment."
        tech-key="permissions.query({name:'clipboard-read'})"
        :tech-val="pm.clipboard.value"
        :severity="permSeverity(pm.clipboard.value)"
        :sev-label="pm.clipboard.value"
        :span="4"
      />
      <DataCardV2
        icon="💾"
        title="Stockage persistant"
        :value="permLabel(pm.persistentStorage.value)"
        mean="Le stockage persistant empêche le navigateur de supprimer automatiquement les données du site."
        deduce="Permet aux trackers de stocker des données à long terme qui survivent aux nettoyages automatiques du navigateur."
        tech-key="permissions.query({name:'persistent-storage'})"
        :tech-val="pm.persistentStorage.value"
        :severity="permSeverity(pm.persistentStorage.value)"
        :sev-label="pm.persistentStorage.value"
        :span="4"
      />
      <DataCardV2
        icon="🎹"
        title="MIDI"
        :value="permLabel(pm.midi.value)"
        mean="L'API Web MIDI permet la communication avec des instruments musicaux connectés via USB ou Bluetooth."
        deduce="L'accès MIDI peut révéler le matériel musical connecté. Rarement bloqué, il constitue un vecteur de fingerprinting matériel."
        tech-key="permissions.query({name:'midi'})"
        :tech-val="pm.midi.value"
        :severity="permSeverity(pm.midi.value)"
        :sev-label="pm.midi.value"
        :span="4"
      />
      <DataCardV2
        icon="📱"
        title="Gyroscope / Accéléromètre"
        :value="pm.hasGyroscope.value ? 'Détecté' : 'Absent'"
        mean="La présence de l'événement DeviceMotionEvent indique si l'appareil dispose de capteurs de mouvement."
        deduce="Révèle un appareil mobile ou tablette, peut être exploité pour du fingerprinting d'orientation et de posture."
        tech-key="'DeviceMotionEvent' in window"
        :tech-val="String(pm.hasGyroscope.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🔄"
        title="Orientation écran"
        :value="pm.orientation.value ?? 'Non disponible'"
        mean="screen.orientation.type retourne l'orientation actuelle de l'écran (portrait, paysage, etc.)."
        deduce="Complète le profil matériel : portrait = mobile/tablette, paysage = desktop ou tablette en mode horizontal."
        tech-key="screen.orientation.type"
        :tech-val="pm.orientation.value ?? 'N/A'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>L'API Permissions permet de <strong>sonder silencieusement</strong> l'état de toutes vos autorisations sans déclencher aucune popup. Un état "granted" révèle des accès accordés précédemment.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePermissions } from '../../composables/usePermissions'
import DataCardV2 from '../DataCardV2.vue'

const pm = usePermissions()

type Sev = 'faible' | 'moyen' | 'eleve' | 'critique'
type PermState = 'granted' | 'denied' | 'prompt' | 'indisponible'

function permLabel(state: PermState) {
  const map: Record<PermState, string> = {
    granted: '✅ Accordé',
    denied: '❌ Refusé',
    prompt: '⏳ Demande possible',
    indisponible: '— Non disponible',
  }
  return map[state] ?? state
}

function permSeverity(state: PermState): Sev {
  if (state === 'granted') return 'critique'
  if (state === 'prompt') return 'moyen'
  return 'faible'
}
</script>
