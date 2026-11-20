import { createApp, createSSRApp } from 'vue'
import './fonts.css'
import './style.css'
import LegalPage from './LegalPage.vue'
import type { LegalPageId } from './types'
import { initAnalytics } from './utils/analytics'

initAnalytics()

// Chaque page HTML (faq/, mentions-legales/, confidentialite/, cookies/) indique laquelle afficher.
const page = document.body.dataset.page as LegalPageId

// En production, le HTML est pré-rendu au build (scripts/prerender.mjs) : on l'hydrate au lieu de le remplacer.
const root = document.getElementById('app')!
const create = root.hasChildNodes() ? createSSRApp : createApp
create(LegalPage, { page }).mount(root)
