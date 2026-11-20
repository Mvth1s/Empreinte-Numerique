<template>
  <footer class="site-foot">
    <p>Empreinte Numérique — outil éducatif open-source, 100 % côté client.</p>
    <nav aria-label="Liens du projet">
      <a href="https://github.com/Mvth1s/Empreinte-Numerique" target="_blank" rel="noopener">Code source (GitHub)</a>
      <a href="https://github.com/Mvth1s" target="_blank" rel="noopener">GitHub de l'auteur</a>
      <a href="/faq/">FAQ</a>
      <a href="/mentions-legales/">Mentions légales</a>
      <a href="/confidentialite/">Politique de confidentialité</a>
      <a href="/cookies/">Politique cookies</a>
      <button type="button" class="foot-link" @click="emit('manage-cookies')">Gérer les cookies</button>
    </nav>
  </footer>
</template>

<script setup lang="ts">
const emit = defineEmits<{ 'manage-cookies': [] }>()
</script>
