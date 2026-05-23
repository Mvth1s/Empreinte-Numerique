<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">☠️</span>
        <div>
          <h2>Empreinte numérique combinée</h2>
          <p class="th-sub">Canvas, audio, polices, CSS media — chaque signal est une couche de votre empreinte unique. Combinés, ils vous identifient mieux qu'un cookie.</p>
        </div>
      </div>
      <div>
        <span class="th-count">6<small>signaux collectés</small></span>
      </div>
    </div>

    <!-- Hero fingerprint -->
    <div class="hero-block fp-block">
      <div class="hb-label">EMPREINTE COMBINÉE SHA-256</div>
      <div class="hb-hash">
        <span v-if="fp.loading.value">Calcul en cours…</span>
        <span v-else>{{ fp.combinedHash.value ?? '——————————————' }}</span>
        <span class="caret"></span>
      </div>
      <div class="hb-meta">
        <div>
          <b>{{ fp.canvasHash.value ?? '…' }}</b>
          <span>Canvas Hash</span>
        </div>
        <div>
          <b>{{ fp.audioHash.value ?? '…' }}</b>
          <span>Audio Hash</span>
        </div>
        <div>
          <b>{{ fp.detectedFonts.value.length }}</b>
          <span>Polices détectées</span>
        </div>
        <div>
          <b>{{ fp.cssMedia.value ?? '…' }}</b>
          <span>CSS Media bits</span>
        </div>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖼️"
        title="Canvas Fingerprint"
        :value="fp.canvasHash.value ?? '…'"
        mean="Un texte et des formes sont rendus sur un canvas invisible. Chaque navigateur/OS produit un résultat de pixel légèrement différent."
        deduce="Ce hash est stable entre sessions, résiste à la navigation privée, persiste après effacement des cookies."
        tech-key="HTMLCanvasElement › toDataURL › SHA-256"
        :tech-val="fp.canvasHash.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :loading="fp.loading.value"
        :span="6"
      />
      <DataCardV2
        icon="🎵"
        title="Audio Fingerprint"
        :value="fp.audioHash.value ?? '…'"
        mean="Un oscillateur triangle 10kHz passe par un compresseur dans OfflineAudioContext. Le signal de sortie varie selon le matériel audio."
        deduce="Identifie la chaîne audio (processeur, drivers, OS). Stable entre sessions et résiste aux changements de configuration basiques."
        tech-key="OfflineAudioContext › oscillateur › SHA-256"
        :tech-val="fp.audioHash.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :loading="fp.loading.value"
        :span="6"
      />
      <DataCardV2
        icon="🔤"
        title="Polices détectées"
        :value="`${fp.detectedFonts.value.length} polices sur 80 testées`"
        mean="80 polices sont testées via TextMetrics en comparant la largeur rendue avec une police générique. Les polices installées ont des dimensions différentes."
        deduce="La liste exacte de polices installées est quasi-unique. Elle révèle le profil logiciel et peut trahir un OS ou logiciel spécifique."
        tech-key="canvas.measureText() + baseline fonts"
        :tech-val="`${fp.detectedFonts.value.length}/80`"
        severity="eleve"
        sev-label="élevé"
        :loading="fp.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🎨"
        title="CSS Media bits"
        :value="fp.cssMedia.value ?? '…'"
        mean="10 media queries CSS sont évaluées (mode sombre, mouvement réduit, HDR, pointeur, etc.) et encodées en bits binaires."
        deduce="Cette chaîne binaire identifie vos préférences système et résume votre configuration d'accessibilité en un seul signal."
        tech-key="window.matchMedia() × 10 queries"
        :tech-val="fp.cssMedia.value ?? '…'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🔌"
        title="Plugins navigateur"
        :value="fp.plugins.value.length ? `${fp.plugins.value.length} plugins` : 'Aucun (ou masqués)'"
        mean="navigator.plugins retourne les plugins installés dans le navigateur (PDF viewer, etc.)."
        deduce="La liste de plugins était très identifiante. Les navigateurs modernes la limitent volontairement pour réduire le fingerprinting."
        tech-key="navigator.plugins"
        :tech-val="String(fp.plugins.value.length)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🎬"
        title="Codecs supportés"
        :value="Object.entries(fp.codecs.value).filter(([,v]) => v !== 'non').map(([k]) => k).join(', ') || 'Aucun'"
        mean="canPlayType() teste le support des formats vidéo (H.264, VP9, AV1) et audio (MP3, AAC, Opus, FLAC) par le navigateur."
        deduce="La combinaison de codecs supportés dépend du navigateur, de l'OS et du matériel. Elle contribue au profil d'empreinte."
        tech-key="video.canPlayType() + audio.canPlayType()"
        :tech-val="Object.keys(fp.codecs.value).join(', ')"
        severity="faible"
        sev-label="faible"
        :span="12"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>L'empreinte combinée <strong>ne peut pas être effacée</strong> en vidant vos cookies ou en utilisant la navigation privée. Seule la modification du matériel ou du navigateur peut la faire varier.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFingerprint } from '../../composables/useFingerprint'
import DataCardV2 from '../DataCardV2.vue'
const fp = useFingerprint()
</script>
