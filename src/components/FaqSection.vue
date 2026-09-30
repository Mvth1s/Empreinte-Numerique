<template>
  <section id="faq" class="faq" aria-labelledby="faq-title">
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">❓</span>
        <div>
          <h2 id="faq-title">Questions fréquentes</h2>
          <p class="th-sub">L'essentiel sur l'empreinte numérique et le fonctionnement de ce site.</p>
        </div>
      </div>
    </div>

    <div class="cards">
      <article v-for="item in FAQ" :key="item.q" class="card faq-card col-6">
        <h3>{{ item.q }}</h3>
        <div class="c-box">
          <span class="c-box-label">💬 Réponse</span>
          <p>{{ item.a }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FAQ } from '../data/faq'
</script>
