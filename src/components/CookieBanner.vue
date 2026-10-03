<template>
  <div v-if="open" class="cookie-banner" role="dialog" aria-live="polite" aria-labelledby="cookie-title">
    <div class="cookie-text">
      <h2 id="cookie-title">🍪 Mesure d'audience</h2>
      <p>
        Ironie assumée : ce site aimerait compter ses visiteurs avec <b>Google Analytics</b>, qui dépose des cookies
        (<code>_ga</code>, 13 mois max). Rien n'est chargé sans votre accord, et la démo fonctionne à l'identique si vous refusez.
        Vous pouvez changer d'avis à tout moment via « Cookies » en bas de page.
      </p>
    </div>
    <div class="cookie-actions">
      <button @click="choose('denied')">Refuser</button>
      <button class="primary" @click="choose('granted')">Accepter</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setConsent, type Consent } from '../utils/analytics'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

function choose(c: Consent) {
  setConsent(c)
  emit('close')
}
</script>
