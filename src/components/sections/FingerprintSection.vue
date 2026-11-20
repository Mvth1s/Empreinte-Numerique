<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🖐️</span>
        <div>
          <h2>Empreinte unique</h2>
          <p class="th-sub">Tout ce qui précède, résumé en un seul code qui vous reconnaît. Sans cookie, sans compte.</p>
        </div>
      </div>
      <div>
        <span class="th-count">8<small>signaux</small></span>
      </div>
    </div>

    <!-- Hero fingerprint -->
    <div class="hero-block fp-block">
      <div class="hb-label">Votre identifiant unique probable</div>
      <div class="hb-hash" id="fp-hash">
        <span>{{ typedHash }}</span><span class="caret"></span>
      </div>
      <div class="hb-meta">
        <div v-if="scrambled"><b>Brouillée</b><span>votre navigateur la fait changer à chaque session</span></div>
        <div v-else><b>Stable</b><span>même code à chaque visite</span></div>
        <div><b>Sans cookie</b><span>rien n'est stocké chez vous</span></div>
        <div><b>Sans compte</b><span>ni aucune permission</span></div>
        <!-- Études : Laperdrix et al. 2016 (AmIUnique, 89 %) ; Gómez-Boix et al. 2018 (2 M de visiteurs, 33,6 %). -->
        <div><b>33 à 89 %</b><span>des navigateurs ont une empreinte unique, selon les études</span></div>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖼️"
        title="Empreinte par dessin (canvas)"
        :value="fp.canvasHash.value ?? '…'"
        mean="Le site fait dessiner en cachette un petit texte et quelques formes, puis résume l'image en un code. Selon votre appareil, ses polices et sa carte graphique, le dessin diffère de quelques pixels."
        :deduce="canvasScrambled
          ? 'Le code change d\'une session à l\'autre : il ne permet plus de vous suivre. Le site voit seulement que vous êtes protégé.'
          : 'Ce code reste le même à chaque visite, en navigation privée comme après avoir effacé vos cookies : il suffit à vous reconnaître.'"
        tech-key="HTMLCanvasElement › toDataURL › SHA-256"
        :tech-val="fp.canvasHash.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :loading="fp.loading.value"
        :masked="canvasScrambled ? (prot.canvasBlocked.value ? 'Il empêche le site de lire le dessin : le code ne dit rien de votre appareil.' : 'Il ajoute un léger brouillage invisible au dessin, différent à chaque session.') : null"
        :span="6"
      />
      <DataCardV2
        icon="🎵"
        title="Empreinte sonore (audio)"
        :value="fp.audioHash.value ?? '…'"
        mean="Le site fait calculer un son en silence (rien n'est joué), puis le résume en un code. Chaque appareil fait ce calcul avec d'infimes différences."
        :deduce="audioScrambled
          ? 'Le code change d\'une session à l\'autre : il ne permet plus de vous suivre.'
          : 'Même après avoir effacé vos cookies ou en navigation privée, ce code reste identique : il vous reconnaît sans que vous le sachiez.'"
        tech-key="OfflineAudioContext › oscillateur › SHA-256"
        :tech-val="fp.audioHash.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :loading="fp.loading.value"
        :masked="audioScrambled ? 'Il modifie très légèrement le son calculé, différemment à chaque session.' : null"
        :span="6"
      />
      <DataCardV2
        icon="🔤"
        title="Polices installées"
        :value="`${fp.detectedFonts.value.length} polices sur ${FONTS_COUNT} testées`"
        mean="Le site teste discrètement quelles polices d'écriture sont installées sur votre appareil. Les polices propres à ce site sont exclues, seules les vôtres comptent."
        deduce="Les logiciels installés (Office, Adobe, jeux…) ajoutent leurs polices : votre liste raconte ce que vous utilisez, et elle est souvent unique."
        :masked="fontsMasked"
        tech-key="canvas.measureText() + baseline fonts"
        :tech-val="fp.detectedFonts.value.slice(0, 6).join(', ') + (fp.detectedFonts.value.length > 6 ? '…' : '')"
        severity="eleve"
        sev-label="élevé"
        :loading="fp.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🎨"
        title="Préférences d'affichage"
        :value="fp.cssMedia.value ?? '…'"
        mean="12 réglages d'affichage de votre appareil (mode sombre, animations réduites, contraste renforcé, souris ou doigt…) résumés en une suite de 0 et de 1."
        deduce="Vos réglages d'accessibilité (texte contrasté, animations coupées) sont peu courants : ils vous distinguent et peuvent trahir un besoin particulier."
        tech-key="window.matchMedia() × 12 queries"
        :tech-val="fp.cssMedia.value ?? '…'"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🔌"
        title="Modules du navigateur (plugins)"
        :value="fp.plugins.value.length ? `${fp.plugins.value.length} modules` : 'Aucun fourni'"
        mean="La liste des modules ajoutés au navigateur. Aujourd'hui, presque tous les navigateurs renvoient la même liste standard (le lecteur PDF)."
        deduce="Autrefois (Flash, Java…), cette liste suffisait presque à vous identifier. Les navigateurs l'ont figée pour cette raison."
        :masked="pluginsMasked"
        tech-key="navigator.plugins"
        :tech-val="String(fp.plugins.value.length)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🎬"
        title="Formats vidéo et audio"
        :value="Object.entries(fp.codecs.value).filter(([,v]) => v !== 'non').map(([k]) => k).join(', ') || 'Aucun'"
        mean="Les formats de vidéo et de son que votre appareil sait lire, et ceux qu'il lit avec une puce spécialisée, sans fatiguer le processeur."
        :deduce="fp.hwDecoders.value.length
          ? `Lus par une puce spécialisée : ${fp.hwDecoders.value.join(', ')}. Les formats récents (AV1, HEVC) ne sont gérés que par le matériel récent : cela date votre appareil.`
          : 'Cette liste dépend du navigateur, du système et du matériel : un indice de plus pour vous reconnaître.'"
        tech-key="canPlayType() + mediaCapabilities.decodingInfo()"
        :tech-val="`matériel : ${fp.hwDecoders.value.join(', ') || 'aucun'}`"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="🔊"
        title="Voix de lecture à voix haute"
        :value="fp.ttsVoices.value.length ? `${fp.ttsVoices.value.length} voix détectées` : fp.ttsDone.value ? 'Aucune voix fournie' : '…'"
        mean="Les voix que votre appareil utiliserait pour lire un texte à voix haute. Le site peut en obtenir la liste complète."
        deduce="Elle dépend de votre système et des langues installées : elle révèle votre type d'appareil et votre région avec une précision surprenante."
        tech-key="speechSynthesis.getVoices()"
        :tech-val="`${fp.ttsVoices.value.length} voix`"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="📷"
        title="Caméras, micros et haut-parleurs"
        :value="fp.mediaDevices.value ? `${fp.mediaDevices.value.videoinput} caméra · ${fp.mediaDevices.value.audioinput} micro · ${fp.mediaDevices.value.audiooutput} sortie audio` : 'Non fourni'"
        :mean="fp.mediaDevices.value?.labelled
          ? 'Vous avez déjà autorisé la caméra ou le micro pour ce site : il voit la liste complète de vos appareils, avec leurs noms (par exemple « Logitech C920 »).'
          : 'Le site voit si vous avez une caméra, un micro et des haut-parleurs, sans pouvoir les utiliser.'"
        deduce="Un ordinateur sans caméra, ou avec deux webcams et un micro externe, est peu courant : votre équipement devient un indice de plus."
        :masked="fp.mediaDevices.value && !fp.mediaDevices.value.labelled ? 'Tant que vous n\'avez rien autorisé, il cache les noms de vos appareils et n\'en montre qu\'un par type.' : fp.mediaDevices.value ? null : NOT_GIVEN"
        tech-key="navigator.mediaDevices.enumerateDevices()"
        :tech-val="fp.mediaDevices.value ? `${fp.mediaDeviceCount.value} entrées · libellés ${fp.mediaDevices.value.labelled ? 'visibles' : 'masqués'}` : 'N/A'"
        severity="faible"
        sev-label="faible"
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
import { ref, computed, watch } from 'vue'
import { useFingerprint, FONTS_COUNT } from '../../composables/useFingerprint'
import { useProtection, STANDARD_PLUGINS, NOT_GIVEN } from '../../composables/useProtection'
import DataCardV2 from '../DataCardV2.vue'

const fp = useFingerprint()
const prot = useProtection()

// Deux rendus différents OU un dessin témoin mal relu : le navigateur brouille (le test témoin attrape aussi
// le bruit de Brave et Safari, identique pendant toute une session).
const canvasScrambled = computed(() => fp.canvasNoise.value || prot.canvasTampered.value)
const audioScrambled = computed(() => fp.audioNoise.value || prot.audioTampered.value)
const scrambled = computed(() => canvasScrambled.value || audioScrambled.value)

const fontsMasked = computed(() => prot.braveFarbling.value || prot.firefoxResist.value
  ? 'Il ne laisse voir que les polices installées d\'office avec votre système, pas celles ajoutées par vos logiciels.'
  : null)
// Liste normalisée partout : un autre nom de module est inventé (Brave en ajoute au hasard).
const pluginsMasked = computed(() => {
  if (!fp.plugins.value.length) return NOT_GIVEN
  return fp.plugins.value.some(p => !STANDARD_PLUGINS.includes(p))
    && prot.braveFarbling.value ? 'Brave ajoute des modules imaginaires à la liste pour la rendre inutilisable.' : null
})
const typedHash = ref('')

watch(() => fp.combinedHash.value, (hash) => {
  if (!hash) return
  const target = hash + ' · ' + (fp.canvasHash.value ?? '————')
  let i = 0
  typedHash.value = ''
  const t = setInterval(() => {
    i++
    typedHash.value = target.slice(0, i)
    if (i >= target.length) clearInterval(t)
  }, 35)
}, { immediate: true })
</script>
