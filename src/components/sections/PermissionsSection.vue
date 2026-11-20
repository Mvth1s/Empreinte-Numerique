<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🔐</span>
        <div>
          <h2>Permissions</h2>
          <p class="th-sub">Même un refus est une information.</p>
        </div>
      </div>
      <div>
        <span class="th-count">9<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">

      <!-- Géolocalisation — avec démo inline -->
      <DataCardV2
        icon="📍"
        title="Géolocalisation"
        :value="permLabel(pm.geolocation.value)"
        mean="Le site peut savoir, sans rien vous demander, si vous l'avez déjà autorisé à connaître votre position."
        deduce="Si c'est « accordé », votre position précise (à quelques mètres) peut être relue à chaque visite, sans nouvelle question."
        tech-key="permissions.query({name:'geolocation'})"
        :tech-val="pm.geolocation.value"
        :severity="permSeverity(pm.geolocation.value)"
        :sev-label="pm.geolocation.value"
        :span="4"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="geoResult" class="pdc-data">
              <div class="pdc-row"><b>Ville</b><span>{{ geoCityLoading ? '🔍 Recherche…' : (geoCity ?? '—') }}</span></div>
              <div class="pdc-row"><b>Latitude</b><span>{{ geoResult.lat.toFixed(6) }}</span></div>
              <div class="pdc-row"><b>Longitude</b><span>{{ geoResult.lon.toFixed(6) }}</span></div>
              <div class="pdc-row"><b>Précision</b><span>± {{ geoResult.accuracy }} m</span></div>
            </div>
            <div v-else-if="geoError" class="pdc-error">⚠️ {{ geoError }}</div>
            <button v-if="!geoResult && !geoError" class="pdc-btn" @click="requestGeo" :disabled="geoLoading">
              {{ geoLoading ? 'Localisation…' : '📍 Voir ma position exacte' }}
            </button>
          </div>
        </template>
      </DataCardV2>

      <!-- Caméra — avec démo inline -->
      <DataCardV2
        icon="📷"
        title="Caméra"
        :value="permLabel(pm.camera.value)"
        mean="Le site peut savoir, sans rien afficher, si vous lui avez déjà autorisé la caméra."
        deduce="Une caméra autorisée peut filmer dès que la page est ouverte. Le navigateur affiche alors un voyant : apprenez à le repérer."
        tech-key="permissions.query({name:'camera'})"
        :tech-val="pm.camera.value"
        :severity="permSeverity(pm.camera.value)"
        :sev-label="pm.camera.value"
        :span="4"
      >
        <template #demo>
          <div class="c-inline-demo">
            <video v-if="cameraStream" ref="videoEl" autoplay muted playsinline class="pdc-video"></video>
            <div v-if="cameraStream" class="pdc-data">
              <div v-if="cameraInfo.label" class="pdc-row"><b>Appareil</b><span>{{ cameraInfo.label }}</span></div>
              <div class="pdc-row"><b>Résolution</b><span>{{ cameraInfo.width }}×{{ cameraInfo.height }}</span></div>
              <div class="pdc-row"><b>Cadence</b><span>{{ cameraInfo.fps }} fps</span></div>
            </div>
            <div v-else-if="cameraError" class="pdc-error">⚠️ {{ cameraError }}</div>
            <button v-if="!cameraStream && !cameraError" class="pdc-btn" @click="requestCamera" :disabled="cameraLoading">
              {{ cameraLoading ? 'Ouverture…' : '📷 Activer la caméra' }}
            </button>
            <button v-if="cameraStream" class="pdc-btn pdc-btn-stop" @click="stopCamera">⏹ Couper la caméra</button>
          </div>
        </template>
      </DataCardV2>

      <!-- Microphone — avec démo inline -->
      <DataCardV2
        icon="🎤"
        title="Microphone"
        :value="permLabel(pm.microphone.value)"
        mean="Le site peut savoir, sans rien demander, si vous lui avez déjà autorisé le micro."
        deduce="Un micro autorisé peut enregistrer ce qui se dit autour de vous tant que la page est ouverte : c'est l'autorisation la plus sensible."
        tech-key="permissions.query({name:'microphone'})"
        :tech-val="pm.microphone.value"
        :severity="permSeverity(pm.microphone.value)"
        :sev-label="pm.microphone.value"
        :span="4"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="micStream">
              <div class="pdc-vumeter"><div class="pdc-vu-bar" :style="{ width: micLevel * 100 + '%' }"></div></div>
              <div class="pdc-data">
                <div v-if="micInfo.label" class="pdc-row"><b>Appareil</b><span>{{ micInfo.label }}</span></div>
                <div v-if="micInfo.sampleRate" class="pdc-row"><b>Fréquence</b><span>{{ micInfo.sampleRate }} Hz</span></div>
                <div class="pdc-row"><b>Niveau</b><span>{{ Math.round(micLevel * 100) }} %</span></div>
              </div>
            </div>
            <div v-else-if="micError" class="pdc-error">⚠️ {{ micError }}</div>
            <button v-if="!micStream && !micError" class="pdc-btn" @click="requestMic" :disabled="micLoading">
              {{ micLoading ? 'Activation…' : '🎤 Activer le micro' }}
            </button>
            <button v-if="micStream" class="pdc-btn pdc-btn-stop" @click="stopMic">⏹ Couper le micro</button>
          </div>
        </template>
      </DataCardV2>

      <!-- Notifications — avec démo inline -->
      <DataCardV2
        icon="🔔"
        title="Notifications"
        :value="permLabel(pm.notifications.value)"
        mean="Le site peut savoir, sans rien demander, si vous acceptez ses notifications."
        deduce="Les notifications vous atteignent même site fermé : beaucoup de sites s'en servent pour de la publicité, voire des arnaques."
        tech-key="permissions.query({name:'notifications'})"
        :tech-val="pm.notifications.value"
        :severity="permSeverity(pm.notifications.value)"
        :sev-label="pm.notifications.value"
        :span="4"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="notifSent" class="pdc-data">
              <div class="pdc-row"><b>Statut</b><span class="pdc-granted">✓ Notification envoyée</span></div>
              <div class="pdc-row"><b>Portée</b><span>Onglet fermé inclus</span></div>
            </div>
            <div v-else-if="notifError" class="pdc-error">⚠️ {{ notifError }}</div>
            <button v-if="!notifSent && !notifError" class="pdc-btn" @click="requestNotifications" :disabled="notifLoading">
              {{ notifLoading ? 'Demande…' : '🔔 Envoyer une notification' }}
            </button>
          </div>
        </template>
      </DataCardV2>

      <!-- Presse-papiers — avec démo inline -->
      <DataCardV2
        icon="📋"
        title="Presse-papiers"
        :value="permLabel(pm.clipboard.value)"
        mean="Le presse-papiers contient ce que vous avez copié (Ctrl+C). Le site peut savoir s'il a le droit de le lire."
        deduce="S'il peut le lire, il voit ce que vous avez copié : un mot de passe, un numéro de carte, un message privé…"
        tech-key="permissions.query({name:'clipboard-read'})"
        :tech-val="pm.clipboard.value"
        :severity="permSeverity(pm.clipboard.value)"
        :sev-label="pm.clipboard.value"
        :span="4"
      >
        <template #demo>
          <div class="c-inline-demo">
            <div v-if="clipContent !== null">
              <div class="pdc-clip-preview">{{ clipPreview }}</div>
              <div class="pdc-data">
                <div class="pdc-row"><b>Longueur</b><span>{{ clipContent.length }} caractères</span></div>
              </div>
            </div>
            <div v-else-if="clipError" class="pdc-error">⚠️ {{ clipError }}</div>
            <div v-else class="pdc-clip-warn">⚠ Très sensible — peut exposer mots de passe et clés copiées.</div>
            <button v-if="clipContent === null && !clipError" class="pdc-btn" @click="requestClipboard">
              📋 Lire le presse-papiers
            </button>
          </div>
        </template>
      </DataCardV2>

      <!-- Stockage persistant -->
      <DataCardV2
        icon="💾"
        title="Stockage protégé du ménage"
        :value="permLabel(pm.persistentStorage.value)"
        mean="Indique si les données de ce site sont protégées du nettoyage automatique que fait le navigateur quand le disque se remplit."
        deduce="Des données protégées restent jusqu'à ce que vous les effaciez vous-même : un identifiant peut y survivre longtemps."
        tech-key="permissions.query({name:'persistent-storage'})"
        :tech-val="pm.persistentStorage.value"
        :severity="permSeverity(pm.persistentStorage.value)"
        :sev-label="pm.persistentStorage.value"
        :span="4"
      />

      <!-- MIDI -->
      <DataCardV2
        icon="🎹"
        title="Instruments de musique (MIDI)"
        :value="permLabel(pm.midi.value)"
        mean="Permet à un site de communiquer avec un instrument de musique électronique branché (clavier, boîte à rythmes…)."
        deduce="Les instruments branchés sont rares : leur présence vous distingue nettement des autres visiteurs."
        tech-key="permissions.query({name:'midi'})"
        :tech-val="pm.midi.value"
        :severity="permSeverity(pm.midi.value)"
        :sev-label="pm.midi.value"
        :span="4"
      />

      <!-- Gyroscope -->
      <DataCardV2
        icon="📱"
        title="Capteurs de mouvement"
        :value="pm.hasGyroscope.value === null ? 'Inconnu (iOS : permission requise)' : pm.hasGyroscope.value ? 'Détecté — mesures reçues' : 'Absent'"
        mean="Les capteurs qui détectent quand vous bougez ou tournez votre appareil. La page les écoute une seconde pour savoir s'ils existent."
        deduce="Révèle un téléphone ou une tablette. Lus en continu, ces capteurs peuvent même trahir votre façon de tenir l'appareil ou de marcher."
        tech-key="devicemotion › rotationRate / acceleration"
        :tech-val="String(pm.hasGyroscope.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />

      <!-- Orientation -->
      <DataCardV2
        icon="🔄"
        title="Orientation de l'écran"
        :value="pm.orientation.value ?? 'Non disponible'"
        mean="Si votre écran est en hauteur (portrait) ou en largeur (paysage), lisible sans rien demander."
        deduce="En hauteur : sans doute un téléphone tenu en main. En largeur : un ordinateur ou une tablette posée."
        tech-key="screen.orientation.type"
        :tech-val="pm.orientation.value ?? 'N/A'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />

    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Les états de permission ont été lus <strong>sans aucune permission</strong>. Les données ci-dessus nécessitent votre accord explicite.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { usePermissions } from '../../composables/usePermissions'
import { reverseGeocode } from '../../utils/geocode'
import DataCardV2 from '../DataCardV2.vue'

const pm = usePermissions()

type Sev = 'faible' | 'moyen' | 'eleve' | 'critique'
type PermState = 'granted' | 'denied' | 'prompt' | 'indisponible'

function permLabel(state: PermState) {
  const map: Record<PermState, string> = {
    granted: '✅ Accordé', denied: '❌ Refusé',
    prompt: '⏳ Demande possible', indisponible: '— Non disponible',
  }
  return map[state] ?? state
}

function permSeverity(state: PermState): Sev {
  if (state === 'granted') return 'critique'
  if (state === 'prompt') return 'moyen'
  return 'faible'
}

// ---- Camera ----
const cameraStream = ref<MediaStream | null>(null)
const cameraError = ref<string | null>(null)
const cameraLoading = ref(false)
const cameraInfo = ref({ label: '', width: 0, height: 0, fps: 0 })
const videoEl = ref<HTMLVideoElement | null>(null)

async function requestCamera() {
  cameraLoading.value = true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
    cameraStream.value = stream
    const track = stream.getVideoTracks()[0]
    const s = track.getSettings()
    cameraInfo.value = { label: track.label || '', width: s.width ?? 0, height: s.height ?? 0, fps: Math.round(s.frameRate ?? 0) }
    await nextTick()
    if (videoEl.value) videoEl.value.srcObject = stream
  } catch {
    cameraError.value = 'Permission refusée ou caméra non disponible'
  } finally {
    cameraLoading.value = false
  }
}

function stopCamera() {
  cameraStream.value?.getTracks().forEach(t => t.stop())
  cameraStream.value = null; cameraError.value = null
}

// ---- Microphone ----
const micStream = ref<MediaStream | null>(null)
const micError = ref<string | null>(null)
const micLoading = ref(false)
const micLevel = ref(0)
const micInfo = ref({ label: '', sampleRate: 0 })
let micRaf = 0
let audioCtx: AudioContext | null = null

async function requestMic() {
  micLoading.value = true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    micStream.value = stream
    const track = stream.getAudioTracks()[0]
    const s = track.getSettings()
    micInfo.value = { label: track.label || '', sampleRate: s.sampleRate ?? 0 }
    audioCtx = new AudioContext()
    const src = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    function tick() {
      analyser.getByteFrequencyData(data)
      micLevel.value = data.reduce((a, b) => Math.max(a, b), 0) / 255
      micRaf = requestAnimationFrame(tick)
    }
    tick()
  } catch {
    micError.value = 'Permission refusée ou microphone non disponible'
  } finally {
    micLoading.value = false
  }
}

function stopMic() {
  cancelAnimationFrame(micRaf)
  micStream.value?.getTracks().forEach(t => t.stop())
  audioCtx?.close()
  micStream.value = null; micLevel.value = 0; micError.value = null
}

// ---- Geolocation ----
const geoResult = ref<{ lat: number; lon: number; accuracy: number } | null>(null)
const geoCity = ref<string | null>(null)
const geoCityLoading = ref(false)
const geoError = ref<string | null>(null)
const geoLoading = ref(false)

function requestGeo() {
  if (!navigator.geolocation) { geoError.value = 'Non supporté'; return }
  geoLoading.value = true
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lon = pos.coords.longitude
      geoResult.value = { lat, lon, accuracy: Math.round(pos.coords.accuracy) }
      geoLoading.value = false
      geoCityLoading.value = true
      geoCity.value = await reverseGeocode(lat, lon)
      geoCityLoading.value = false
    },
    () => { geoError.value = 'Permission refusée'; geoLoading.value = false },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

// ---- Notifications ----
const notifSent = ref(false)
const notifError = ref<string | null>(null)
const notifLoading = ref(false)

async function requestNotifications() {
  notifLoading.value = true
  try {
    const result = await Notification.requestPermission()
    if (result === 'granted') {
      new Notification('Empreinte Numérique', {
        body: 'Ce site peut vous envoyer des notifications, même quand cet onglet est fermé.',
        icon: '/icon-192.png',
      })
      notifSent.value = true
    } else {
      notifError.value = 'Permission refusée'
    }
  } catch {
    notifError.value = 'Non supporté sur ce navigateur'
  } finally {
    notifLoading.value = false
  }
}

// ---- Clipboard ----
const clipContent = ref<string | null>(null)
const clipError = ref<string | null>(null)

async function requestClipboard() {
  try {
    clipContent.value = await navigator.clipboard.readText()
  } catch {
    clipError.value = 'Permission refusée — activez-la dans les paramètres du site'
  }
}

const clipPreview = computed(() => {
  const c = clipContent.value ?? ''
  if (!c) return '(presse-papiers vide)'
  return c.length > 120 ? c.slice(0, 117) + '…' : c
})

onUnmounted(() => { stopCamera(); stopMic() })
</script>
