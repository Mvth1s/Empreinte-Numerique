<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🛡️</span>
        <div>
          <h2>Se protéger</h2>
          <p class="th-sub">Vous avez vu ce qu'on sait. Voici comment limiter les dégâts.</p>
        </div>
      </div>
    </div>

    <!-- Hero: synthèse personnalisée -->
    <div class="conclusion-hero">
      <h3>Ce que ce site a collecté sur vous, sans aucune permission</h3>
      <div class="ch-summary">
        <div class="ch-item">
          <span class="ch-label">IP publique</span>
          <span class="ch-val">{{ net.publicIP.value ?? '…' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Localisation</span>
          <span class="ch-val">{{ locationStr }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">GPU</span>
          <span class="ch-val">{{ shortGpu }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Empreinte unique</span>
          <span class="ch-val ch-mono">{{ fingerprintScrambled ? 'Brouillée par votre navigateur' : shortFp ?? '…' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Polices détectées</span>
          <span class="ch-val">{{ fp.detectedFonts.value.length > 0 ? fp.detectedFonts.value.length + ' polices' : '…' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Résolveur DNS</span>
          <span class="ch-val">{{ net.dnsResolverInfo.value ?? net.dnsResolver.value ?? '…' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Bloqueur de pub</span>
          <span class="ch-val">{{ bl.verdict.value }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">VPN / proxy</span>
          <span class="ch-val">{{ net.isVPN.value === null ? '…' : net.isVPN.value ? 'Indices de VPN' : 'Aucun indice' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Fuite WebRTC</span>
          <span class="ch-val">{{ !net.webrtcDone.value ? '…' : net.webrtcLeak.value ?? (net.localIPs.value.length ? net.localIPs.value[0] : 'Aucune') }}</span>
        </div>
      </div>
      <p>
        Ces données ont été collectées <strong>automatiquement, en quelques secondes, sans votre accord</strong>.
        Chaque protection ci-dessous aurait empêché une partie de cette collecte lors de votre visite.
      </p>
    </div>

    <div class="protect-grid">
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico" aria-hidden="true">🦁</span>
          <h4>Brave</h4>
        </div>
        <p>Un navigateur gratuit, aussi simple que Chrome, qui bloque d'office publicités et traqueurs et brouille votre empreinte.</p>
        <div class="pc-personal">
          <template v-if="prot.braveFarbling.value">C'est déjà le cas ici : votre empreinte est brouillée et change à chaque session.</template>
          <template v-else-if="shortFp">Votre empreinte <code>{{ shortFp }}</code> changerait à chaque session : impossible de vous suivre avec.</template>
          <template v-else>Votre empreinte changerait à chaque session : impossible de vous suivre avec.</template>
        </div>
        <ul>
          <li>Empreintes dessin, son et 3D brouillées</li>
          <li>Bloqueur intégré, rien à installer</li>
          <li>Accepte les extensions de Chrome, et permet encore d'activer uBlock Origin</li>
        </ul>
        <div class="pc-level easy">Niveau : débutant</div>
      </div>
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico" aria-hidden="true">🦊</span>
          <h4>Firefox en mode « Strict »</h4>
        </div>
        <p>Dans les réglages de Firefox (Vie privée et sécurité › Protection renforcée contre le pistage), choisissez « Stricte » : depuis Firefox 145, ce mode active aussi des protections contre l'empreinte.</p>
        <div class="pc-personal">
          <template v-if="shortCanvas && shortAudio">Vos signatures dessin <code>{{ shortCanvas }}</code> et son <code>{{ shortAudio }}</code> seraient brouillées.</template>
          <template v-else>Vos signatures dessin et son seraient brouillées.</template>
        </div>
        <ul>
          <li>Un réglage à changer, c'est tout</li>
          <li>Déjà actif en navigation privée</li>
          <li>Pour aller plus loin : le profil « arkenfox » (avancé)</li>
        </ul>
        <div class="pc-level easy">Niveau : débutant</div>
      </div>
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico" aria-hidden="true">🛡️</span>
          <h4>uBlock Origin</h4>
        </div>
        <p>L'extension de référence pour bloquer publicités et traqueurs. Attention : la version complète ne fonctionne plus dans Chrome.</p>
        <div class="pc-personal">
          <template v-if="bl.cosmeticBlocked.value">Un bloqueur est déjà actif ici : le faux encart publicitaire de l'onglet « Bloqueurs » a disparu.</template>
          <template v-else>Les scripts qui testent vos polices, votre écran ou votre carte graphique seraient bloqués avant même de démarrer.</template>
        </div>
        <ul>
          <li>Firefox : version complète</li>
          <li>Brave : version complète, à activer dans les extensions</li>
          <li>Chrome et Edge : seulement « uBlock Origin Lite », plus limitée</li>
        </ul>
        <div class="pc-level easy">Niveau : débutant</div>
      </div>
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico" aria-hidden="true">🔒</span>
          <h4>VPN de confiance</h4>
        </div>
        <p>Il fait passer votre connexion par un autre ordinateur : les sites voient son adresse IP au lieu de la vôtre.</p>
        <div class="pc-personal">
          <template v-if="net.publicIP.value">Votre adresse <code>{{ net.publicIP.value }}</code>{{ locationShort }} serait remplacée par celle du serveur VPN.</template>
          <template v-else>Votre adresse IP serait remplacée par celle du serveur VPN.</template>
        </div>
        <ul>
          <li>Choisir un service payant et audité (Mullvad, Proton VPN, IVPN…)</li>
          <li>Méfiance envers les VPN gratuits</li>
          <li>Ne change rien à l'empreinte de votre appareil</li>
        </ul>
        <div class="pc-level medium">Niveau : intermédiaire</div>
      </div>
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico" aria-hidden="true">🌐</span>
          <h4>Annuaire DNS privé</h4>
        </div>
        <p>Par défaut, votre opérateur sert d'annuaire Internet et voit donc le nom de chaque site visité. Un annuaire chiffré (Cloudflare 1.1.1.1, Quad9…) lui en cache une bonne partie.</p>
        <div class="pc-personal">
          Annuaire détecté : <code>{{ net.dnsResolverInfo.value ?? net.dnsResolver.value ?? 'inconnu' }}</code>.
          {{ net.dnsIsPublic.value ? 'Vous utilisez déjà un service public : votre opérateur ne voit plus la liste de vos recherches d\'adresses.' : 'C\'est probablement celui de votre opérateur : il peut noter chaque site que vous visitez.' }}
        </div>
        <ul>
          <li>Option « DNS sécurisé » dans les réglages du navigateur</li>
          <li>Se règle en deux minutes</li>
          <li>Votre opérateur voit encore à quels serveurs vous vous connectez</li>
        </ul>
        <div class="pc-level easy">Niveau : débutant</div>
      </div>
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico" aria-hidden="true">🧅</span>
          <h4>Tor Browser</h4>
        </div>
        <p>Votre connexion rebondit sur trois relais dans le monde, et tous les utilisateurs de Tor présentent la même empreinte : vous vous fondez dans la foule.</p>
        <div class="pc-personal">
          <template v-if="shortFp">Votre identifiant <code>{{ shortFp }}</code> serait remplacé par un profil identique pour tous les utilisateurs.</template>
          <template v-else>Votre empreinte serait remplacée par un profil identique pour tous les utilisateurs.</template>
        </div>
        <ul>
          <li>La protection la plus forte</li>
          <li>Navigation plus lente, certains sites bloquent Tor</li>
          <li>Gratuit, développé par une association à but non lucratif</li>
        </ul>
        <div class="pc-level hard">Niveau : avancé</div>
      </div>
    </div>

    <div class="tab-foot">
      <span class="tf-key" aria-hidden="true">💡</span>
      <span>Aucune solution n'est parfaite : combiner plusieurs protections reste le plus efficace. Recommandations vérifiées le <strong class="reviewed">{{ CONTENT_REVIEWED_LABEL }}</strong>.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNetwork } from '../../composables/useNetwork'
import { useFingerprint } from '../../composables/useFingerprint'
import { useGPU } from '../../composables/useGPU'
import { useBlockers } from '../../composables/useBlockers'
import { useProtection } from '../../composables/useProtection'
import { CONTENT_REVIEWED_LABEL } from '../../data/meta'

const net = useNetwork()
const fp = useFingerprint()
const gpu = useGPU()
const bl = useBlockers()
const prot = useProtection()

const fingerprintScrambled = computed(() => fp.canvasNoise.value || fp.audioNoise.value || prot.canvasTampered.value || prot.audioTampered.value)

const shortFp = computed(() => fp.combinedHash.value ? fp.combinedHash.value.slice(0, 12).toUpperCase() : null)
const shortCanvas = computed(() => fp.canvasHash.value ? fp.canvasHash.value.slice(0, 8).toUpperCase() : null)
const shortAudio = computed(() => fp.audioHash.value ? fp.audioHash.value.slice(0, 8).toUpperCase() : null)

const shortGpu = computed(() => {
  const r = gpu.renderer.value ?? ''
  if (!r) return '…'
  if (gpu.masked.value) return 'Masqué par votre navigateur'
  return r.length > 30 ? r.slice(0, 27) + '…' : r
})

const locationStr = computed(() => {
  const parts = [net.city.value, net.country.value].filter(Boolean)
  return parts.length ? parts.join(', ') : '…'
})

const locationShort = computed(() =>
  net.city.value ? ` (${net.city.value})` : ''
)
</script>
