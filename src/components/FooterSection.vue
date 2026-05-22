<template>
  <footer class="en-footer">
    <div class="wrap">
      <div class="en-footer-grid">
        <!-- Brand -->
        <div class="en-footer-brand">
          <img src="/logo.svg" width="36" height="36" alt="Empreinte Numérique" />
          <div>
            <div class="en-footer-brand-name">Empreinte Numérique</div>
            <div class="en-footer-brand-sub">Open Source · 100% client-side · zéro serveur</div>
          </div>
        </div>

        <!-- Se protéger -->
        <div class="en-footer-col">
          <div class="en-footer-col-title">// Comment se protéger</div>
          <ul class="en-footer-list">
            <li><span class="en-footer-arrow">→</span> <strong>VPN avec protection WebRTC</strong> — masque l'IP, évite la fuite STUN</li>
            <li><span class="en-footer-arrow">→</span> <strong>Firefox + uBlock Origin</strong> — bloque trackers + cookies tiers</li>
            <li><span class="en-footer-arrow">→</span> <strong>Arkenfox user.js</strong> — neutralise le fingerprinting WebGL, canvas, UA</li>
            <li><span class="en-footer-arrow">→</span> <strong>Tor Browser</strong> — uniformise tous les signaux, anonymat maximal</li>
          </ul>
        </div>

        <!-- À propos -->
        <div class="en-footer-col">
          <div class="en-footer-col-title">// À propos</div>
          <ul class="en-footer-list">
            <li><span class="en-footer-arrow">→</span> <a href="https://github.com/Mvth1s/empreinte-numerique" target="_blank" rel="noopener noreferrer">GitHub — code source</a></li>
            <li><span class="en-footer-arrow">→</span> Aucune donnée envoyée à nos serveurs</li>
            <li><span class="en-footer-arrow">→</span> Aucun cookie déposé</li>
            <li><span class="en-footer-arrow">→</span> APIs externes : ipify.org + ip-api.com</li>
          </ul>
        </div>
      </div>

      <div class="en-footer-bottom">
        <span>Empreinte Numérique · {{ new Date().getFullYear() }}</span>
        <span>Aucun cookie — Aucun tracking — Aucune donnée envoyée</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
