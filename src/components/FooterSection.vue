<template>
  <footer class="py-16 border-t border-border">
    <div class="max-w-6xl mx-auto px-6">
      <!-- Message final -->
      <div class="text-center mb-12">
        <div class="inline-block p-6 border border-alert/30 bg-alert/5 rounded-xl max-w-2xl">
          <p class="font-mono text-sm leading-relaxed text-text-p">
            "Toutes ces données ont été collectées par <span class="text-cyan">Empreinte Numérique</span>
            <strong class="text-alert"> sans aucune permission</strong>.
            Aucun cookie n'a été déposé.
            Aucun malware n'est impliqué.
            C'est le <strong class="text-text-p">fonctionnement normal du Web</strong>."
          </p>
        </div>
      </div>

      <!-- Protection -->
      <div class="mb-12">
        <h2 class="font-mono text-sm font-bold uppercase tracking-[0.15em] text-text-p mb-6 text-center">
          🛡️ Comment se protéger
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="tip in tips" :key="tip.title"
               class="p-4 bg-surface border border-border rounded-lg">
            <div class="text-xl mb-2">{{ tip.icon }}</div>
            <div class="font-mono text-xs font-bold text-text-p mb-1 uppercase tracking-wider">{{ tip.title }}</div>
            <p class="text-xs text-text-s leading-relaxed">{{ tip.description }}</p>
          </div>
        </div>
      </div>

      <!-- Liens -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
        <div class="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
            <path d="M32 8c-6.6 0-12.8 2.6-17.4 7.2C9.8 19.8 7 26 7 32.6c0 4.8 1.3 9.4 3.8 13.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="32" cy="27" rx="6" ry="7" stroke="#00e5ff" stroke-width="2.5"/>
            <path d="M20 28c0 7 5.4 12.8 12 14.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M44 28c0 10-5.4 18.6-13.4 22.4" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <div>
            <div class="font-mono text-xs font-bold text-text-p">Empreinte Numérique</div>
            <div class="font-mono text-[10px] text-text-s">Open Source — 100% client-side</div>
          </div>
        </div>

        <div class="flex items-center gap-4 font-mono text-[11px] text-text-s">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             class="hover:text-cyan transition-colors flex items-center gap-1.5">
            <span>⌥</span> GitHub
          </a>
          <span class="text-border">|</span>
          <span>Aucun cookie — Aucun tracking — Aucune donnée envoyée</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const tips = [
  {
    icon: '🔒',
    title: 'VPN',
    description: 'Cache votre IP publique et géolocalisation. ATTENTION: les fuites WebRTC contournent les VPN. Utilisez un client avec kill-switch et protection WebRTC.',
  },
  {
    icon: '🦊',
    title: 'Firefox + uBlock Origin',
    description: 'Firefox bloque les cookies tiers par défaut. uBlock Origin bloque les trackers. Combinés, ils réduisent drastiquement la surface de fingerprinting.',
  },
  {
    icon: '⚙️',
    title: 'Arkenfox user.js',
    description: 'Configuration avancée de Firefox qui désactive le fingerprinting, normalise l\'UA, bloque WebGL et réduit les signaux identifiants à leur minimum.',
  },
  {
    icon: '🧅',
    title: 'Tor Browser',
    description: 'L\'anonymat maximal. Uniformise tous les signaux du navigateur, route via le réseau Tor, et résiste au fingerprinting. Lent mais très efficace.',
  },
]
</script>
