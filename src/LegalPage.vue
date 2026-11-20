<template>
  <div class="app legal-page">
    <a class="skip-link" href="#main">Aller au contenu</a>
    <header class="top">
      <a href="/" class="brand">
        <img src="/logo.webp" alt="" class="brand-logo" width="40" height="40" />
        <div>
          <div class="brand-name">Empreinte Numérique</div>
          <div class="tag">Ce que chaque site sait sur vous</div>
        </div>
      </a>
      <div class="top-right">
        <a href="/" class="back-link">← Retour à l'analyse</a>
        <ThemeToggle />
      </div>
    </header>

    <nav class="legal-nav" aria-label="Pages d'information">
      <a v-for="p in PAGES" :key="p.id" :href="`/${p.id}/`" :aria-current="p.id === page ? 'page' : undefined">{{ p.label }}</a>
    </nav>

    <main id="main" tabindex="-1">
      <component :is="current.component" />
    </main>

    <SiteFooter @manage-cookies="cookieBannerOpen = true" />
    <CookieBanner :open="cookieBannerOpen" @close="cookieBannerOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SiteFooter from './components/SiteFooter.vue'
import CookieBanner from './components/CookieBanner.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import FaqSection from './components/FaqSection.vue'
import LegalNotice from './components/legal/LegalNotice.vue'
import PrivacyPolicy from './components/legal/PrivacyPolicy.vue'
import CookiePolicy from './components/legal/CookiePolicy.vue'
import { readConsent } from './utils/analytics'
import type { LegalPageId } from './types'

const props = defineProps<{ page: LegalPageId }>()

const PAGES = [
  { id: 'faq', label: 'FAQ', component: FaqSection },
  { id: 'mentions-legales', label: 'Mentions légales', component: LegalNotice },
  { id: 'confidentialite', label: 'Confidentialité', component: PrivacyPolicy },
  { id: 'cookies', label: 'Cookies', component: CookiePolicy },
] as const

const current = computed(() => PAGES.find(p => p.id === props.page) ?? PAGES[0])
const cookieBannerOpen = ref(false)
// Lu au montage seulement : le HTML pré-rendu au build (sans localStorage) doit être identique à l'hydratation.
// Sur la page cookies, le bloc « Votre choix actuel » fait déjà office de bandeau.
onMounted(() => { cookieBannerOpen.value = readConsent() === null && props.page !== 'cookies' })
</script>
