import { createApp } from 'vue'
import './fonts.css'
import './style.css'
import LegalPage from './LegalPage.vue'
import type { LegalPageId } from './types'
import { initAnalytics } from './utils/analytics'

initAnalytics()

// Chaque page HTML (mentions-legales/, confidentialite/, cookies/) indique laquelle afficher.
const page = document.body.dataset.page as LegalPageId

createApp(LegalPage, { page }).mount('#app')
