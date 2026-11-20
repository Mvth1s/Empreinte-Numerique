<template>
  <section id="cookies" class="faq" aria-labelledby="cookies-title">
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🍪</span>
        <div>
          <h2 id="cookies-title">Politique cookies</h2>
          <p class="th-sub">Un seul traceur possible, et uniquement si vous l'acceptez.</p>
        </div>
      </div>
    </div>

    <div class="cards">
      <article class="card faq-card col-12">
        <h3>Votre choix actuel</h3>
        <div class="c-box">
          <p>
            Mesure d'audience Google Analytics :
            <b class="consent-state">{{ STATE_LABEL[consent ?? 'none'] }}</b>.
            Vous pouvez le modifier ici à tout moment ; refuser est aussi simple qu'accepter.
          </p>
          <div class="cookie-actions">
            <button type="button" :aria-pressed="consent === 'denied'" @click="choose('denied')">Refuser</button>
            <button type="button" class="primary" :aria-pressed="consent === 'granted'" @click="choose('granted')">Accepter</button>
          </div>
        </div>
      </article>
      <article v-for="item in COOKIES" :key="item.q" class="card faq-card col-6">
        <h3>{{ item.q }}</h3>
        <div class="c-box">
          <p>{{ item.a }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { readConsent, setConsent, type Consent } from '../../utils/analytics'

const STATE_LABEL: Record<Consent | 'none', string> = {
  granted: 'acceptée',
  denied: 'refusée',
  none: 'aucun choix enregistré (donc désactivée)',
}

// Lu au montage : le HTML pré-rendu au build ne connaît pas le choix du visiteur.
const consent = ref<Consent | null>(null)
onMounted(() => { consent.value = readConsent() })

function choose(c: Consent) {
  setConsent(c)
  consent.value = c
}

const COOKIES = [
  {
    q: 'Cookies de mesure d\'audience (avec consentement)',
    a: "Google Analytics 4 (identifiant G-X83M1WF7KK) dépose les cookies _ga et _ga_<identifiant> pour compter les visites et leur provenance, avec anonymisation de l'IP et sans finalité publicitaire (stockage publicitaire refusé). Durée de vie : 13 mois maximum. Ces cookies ne sont déposés, et le script Google n'est téléchargé, qu'après un clic sur « Accepter ».",
  },
  {
    q: 'Retrait du consentement',
    a: "Un clic sur « Refuser » (ici ou via « Gérer les cookies » en bas de chaque page) désactive la mesure et supprime immédiatement les cookies _ga. Les données déjà transmises à Google sont conservées 2 mois, puis effacées.",
  },
  {
    q: 'Stockage local (sans consentement)',
    a: "Votre choix est mémorisé dans le localStorage de votre navigateur (clé en-consent), ce qui évite de vous redemander à chaque visite. Ce n'est pas un cookie, il n'est jamais envoyé à un serveur et il est strictement nécessaire au respect de votre choix.",
  },
  {
    q: 'Aucun autre cookie',
    a: "Le site n'utilise aucun cookie publicitaire, de réseau social ou de session. Les tests de la démo (bloqueur de publicité, cache, débit) interrogent des domaines tiers sans envoyer de cookie. Vous pouvez aussi bloquer ou effacer les cookies depuis les réglages de votre navigateur.",
  },
]
</script>
