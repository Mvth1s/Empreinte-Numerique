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
      <h3>// Ce que ce site a collecté sur vous — sans permission</h3>
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
          <span class="ch-val ch-mono">{{ shortFp ?? '…' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Polices détectées</span>
          <span class="ch-val">{{ fp.detectedFonts.value.length > 0 ? fp.detectedFonts.value.length + ' polices' : '…' }}</span>
        </div>
        <div class="ch-item">
          <span class="ch-label">Résolveur DNS</span>
          <span class="ch-val">{{ net.dnsResolver.value ?? 'opérateur par défaut' }}</span>
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
          <span class="pc-ico">🦁</span>
          <h4>Brave Browser</h4>
        </div>
        <p>Navigateur basé sur Chrome qui bloque le fingerprinting par défaut en ajoutant du bruit dans les API exposées.</p>
        <div v-if="shortFp" class="pc-personal">
          Votre empreinte <code>{{ shortFp }}</code> serait différente à chaque visite — vous rendant non traçable entre sessions.
        </div>
        <ul>
          <li>Canvas et audio fingerprints randomisés</li>
          <li>Compatible avec les extensions Chrome</li>
          <li>Bouclier anti-traceur intégré</li>
        </ul>
        <div class="pc-level easy">Niveau : Débutant</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🦊</span>
          <h4>Firefox + arkenfox</h4>
        </div>
        <p>Firefox configuré avec le profil arkenfox durcit le navigateur contre le fingerprinting avancé.</p>
        <div class="pc-personal">
          <template v-if="shortCanvas && shortAudio">
            Vos hashs canvas <code>{{ shortCanvas }}</code> et audio <code>{{ shortAudio }}</code> seraient bruités aléatoirement.
          </template>
          <template v-else>
            Vos empreintes canvas et audio seraient bruitées aléatoirement à chaque session.
          </template>
        </div>
        <ul>
          <li>Résiste au fingerprinting avancé</li>
          <li>Isolation de première partie (dFPI)</li>
          <li>Configuration open-source et auditée</li>
        </ul>
        <div class="pc-level medium">Niveau : Intermédiaire</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🔒</span>
          <h4>VPN de confiance</h4>
        </div>
        <p>Masque votre IP publique et chiffre votre trafic. Choisissez un provider sans logs, audité.</p>
        <div class="pc-personal">
          <template v-if="net.publicIP.value">
            Votre IP <code>{{ net.publicIP.value }}</code>{{ locationShort }} serait masquée derrière le serveur VPN.
          </template>
          <template v-else>
            Votre IP publique serait masquée derrière le serveur VPN.
          </template>
        </div>
        <ul>
          <li>Mullvad, ProtonVPN ou IVPN recommandés</li>
          <li>Vérifiez la politique de non-journalisation</li>
          <li>Ne protège pas contre le fingerprinting</li>
        </ul>
        <div class="pc-level medium">Niveau : Intermédiaire</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🛡️</span>
          <h4>uBlock Origin</h4>
        </div>
        <p>L'extension la plus efficace pour bloquer les scripts de fingerprinting et les traqueurs tiers.</p>
        <div class="pc-personal">
          <template v-if="fp.detectedFonts.value.length > 0">
            Vos {{ fp.detectedFonts.value.length }} polices détectées sont une composante de votre fingerprint — uBlock bloquerait les scripts qui les sondent.
          </template>
          <template v-else>
            Les scripts qui sondent vos polices et plugins seraient bloqués avant exécution.
          </template>
        </div>
        <ul>
          <li>Bloque les scripts de traceurs connus</li>
          <li>Filtres maintenus par la communauté</li>
          <li>Disponible sur Firefox et Chrome</li>
        </ul>
        <div class="pc-level easy">Niveau : Débutant</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🌐</span>
          <h4>DNS privé</h4>
        </div>
        <p>Par défaut, chaque adresse visitée passe par le DNS de votre opérateur. Cloudflare (1.1.1.1) et Quad9 ne loguent pas vos requêtes.</p>
        <div class="pc-personal">
          Résolveur détecté : <code>{{ net.dnsResolver.value ?? 'opérateur par défaut' }}</code>.
          {{ net.dnsResolver.value ? 'Vos visites DNS sont déjà partiellement protégées.' : 'Vos visites sont actuellement loguées par votre FAI.' }}
        </div>
        <ul>
          <li>Masque vos visites à votre FAI</li>
          <li>DNS-over-HTTPS disponible</li>
          <li>Configuré en 2 minutes dans l'OS</li>
        </ul>
        <div class="pc-level easy">Niveau : Débutant</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🧅</span>
          <h4>Tor Browser</h4>
        </div>
        <p>Tous les utilisateurs de Tor partagent le même fingerprint standardisé. IP masquée par trois relais chiffrés.</p>
        <div class="pc-personal">
          <template v-if="shortFp">
            Votre identifiant unique <code>{{ shortFp }}</code> serait remplacé par un profil générique partagé par des milliers d'utilisateurs.
          </template>
          <template v-else>
            Votre empreinte unique serait remplacée par un profil générique partagé par des milliers d'utilisateurs.
          </template>
        </div>
        <ul>
          <li>Anonymat réseau maximal</li>
          <li>Fingerprinting volontairement générique</li>
          <li>Gratuit, maintenu par une ONG</li>
        </ul>
        <div class="pc-level hard">Niveau : Avancé</div>
      </div>

    </div>

    <div class="tab-foot">
      <span class="tf-key">💡</span>
      <span>Aucune solution n'est parfaite — la combinaison de plusieurs couches est la stratégie la plus efficace.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNetwork } from '../../composables/useNetwork'
import { useFingerprint } from '../../composables/useFingerprint'
import { useGPU } from '../../composables/useGPU'

const net = useNetwork()
const fp = useFingerprint()
const gpu = useGPU()

const shortFp = computed(() => fp.combinedHash.value ? fp.combinedHash.value.slice(0, 12).toUpperCase() : null)
const shortCanvas = computed(() => fp.canvasHash.value ? fp.canvasHash.value.slice(0, 8).toUpperCase() : null)
const shortAudio = computed(() => fp.audioHash.value ? fp.audioHash.value.slice(0, 8).toUpperCase() : null)

const shortGpu = computed(() => {
  const r = gpu.renderer.value ?? ''
  if (!r) return '…'
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
