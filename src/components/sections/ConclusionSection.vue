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

    <div class="conclusion-hero">
      <h3>// La bonne nouvelle</h3>
      <p>
        Vous ne pouvez pas disparaître totalement d'internet — mais vous pouvez rendre le traçage beaucoup plus difficile et coûteux.
        Chaque couche de protection que vous ajoutez réduit la précision de votre profil.
        Ces outils existent, sont gratuits pour la plupart, et ne nécessitent aucune compétence technique.
      </p>
    </div>

    <div class="protect-grid">
      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🦁</span>
          <h4>Brave Browser</h4>
        </div>
        <p>Navigateur basé sur Chrome qui bloque le fingerprinting par défaut, ajoute du bruit dans les données exposées et ne collecte aucune donnée de navigation.</p>
        <ul>
          <li>Bloque les canvas et audio fingerprints</li>
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
        <p>Firefox configuré avec le profil arkenfox (user.js) durcit considérablement le navigateur contre le fingerprinting et le traçage inter-sites.</p>
        <ul>
          <li>Résiste au fingerprinting avancé</li>
          <li>Isolation de première partie (dFPI)</li>
          <li>Configuration open-source et auditée</li>
        </ul>
        <div class="pc-level medium">Niveau : Intermédiaire</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🧅</span>
          <h4>Tor Browser</h4>
        </div>
        <p>Tous les utilisateurs de Tor partagent le même fingerprinting standardisé. Votre IP est masquée derrière trois relais chiffrés dans le monde.</p>
        <ul>
          <li>Anonymat réseau maximal</li>
          <li>Fingerprinting volontairement générique</li>
          <li>Gratuit, maintenu par une ONG</li>
        </ul>
        <div class="pc-level hard">Niveau : Avancé</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🛡️</span>
          <h4>uBlock Origin</h4>
        </div>
        <p>L'extension la plus efficace pour bloquer les traqueurs publicitaires, les scripts de fingerprinting et les requêtes tierces indésirables.</p>
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
        <p>Par défaut, chaque adresse que vous visitez passe par le DNS de votre opérateur. Cloudflare (1.1.1.1) et Quad9 (9.9.9.9) ne loguent pas vos requêtes.</p>
        <ul>
          <li>Masque vos visites à votre FAI</li>
          <li>DNS-over-HTTPS disponible</li>
          <li>Configuré en 2 minutes dans l'OS</li>
        </ul>
        <div class="pc-level easy">Niveau : Débutant</div>
      </div>

      <div class="protect-card">
        <div class="protect-card-head">
          <span class="pc-ico">🔒</span>
          <h4>VPN de confiance</h4>
        </div>
        <p>Un VPN masque votre IP publique et chiffre votre trafic entre vous et le serveur VPN. Choisissez un provider sans logs, audité indépendamment.</p>
        <ul>
          <li>Mullvad, ProtonVPN ou IVPN</li>
          <li>Vérifiez la politique de non-journalisation</li>
          <li>Ne protège pas contre le fingerprinting</li>
        </ul>
        <div class="pc-level medium">Niveau : Intermédiaire</div>
      </div>
    </div>

    <div class="tab-foot">
      <span class="tf-key">💡</span>
      <span>Aucune solution n'est parfaite — la combinaison de plusieurs couches est la stratégie la plus efficace.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
