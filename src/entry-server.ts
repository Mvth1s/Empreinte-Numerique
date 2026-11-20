// Rendu au build (voir scripts/prerender.mjs) : la FAQ et les pages légales existent dans le HTML servi,
// lisibles par les robots qui n'exécutent pas JavaScript.
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import LegalPage from './LegalPage.vue'
import type { LegalPageId } from './types'

export const LEGAL_PAGES: LegalPageId[] = ['faq', 'mentions-legales', 'confidentialite', 'cookies']

export function renderLegal(page: LegalPageId) {
  return renderToString(createSSRApp(LegalPage, { page }))
}
