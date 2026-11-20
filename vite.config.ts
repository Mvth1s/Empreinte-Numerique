import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { FAQ } from './src/data/faq'

const SITE_URL = 'https://empreinte-numerique.vercel.app/'

// Données structurées injectées statiquement au build (lisibles sans exécuter le JS) : accueil et /faq/.
// La FAQPage est générée depuis src/data/faq.ts, la même source que la section affichée.
function jsonLd(): Plugin {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'Empreinte Numérique',
        description: "Découvrez toutes les données qu'un site web peut collecter sur vous sans aucune permission.",
        inLanguage: 'fr',
        author: { '@id': `${SITE_URL}#author` },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}#app`,
        name: 'Empreinte Numérique',
        url: SITE_URL,
        description: "Outil éducatif qui montre en temps réel, dans le navigateur, les données qu'un site peut collecter passivement et ce qu'on peut en déduire.",
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        author: { '@id': `${SITE_URL}#author` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}#author`,
        name: 'Mvth1s',
        sameAs: ['https://github.com/Mvth1s'],
      },
    ],
  }

  // La FAQPage accompagne la page /faq/ : Google exige que le contenu balisé soit visible sur la page.
  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}faq/#faq`,
    url: `${SITE_URL}faq/`,
    inLanguage: 'fr',
    isPartOf: { '@id': `${SITE_URL}#website` },
    mainEntity: FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  // Échappe "<" pour qu'aucune chaîne ne puisse fermer la balise <script>.
  const serialize = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c')
  const byPage: Record<string, string> = {
    '/index.html': serialize(graph),
    '/faq/index.html': serialize(faqPage),
  }

  return {
    name: 'json-ld',
    transformIndexHtml: (_html, ctx) => byPage[ctx.path]
      ? [{ tag: 'script', attrs: { type: 'application/ld+json' }, children: byPage[ctx.path], injectTo: 'head' }]
      : [],
  }
}

// En-têtes de sécurité de vercel.json (règle globale) réappliqués à `vite preview` pour tester la CSP en local.
const vercel = JSON.parse(readFileSync(resolve(__dirname, 'vercel.json'), 'utf8'))
const securityHeaders: Record<string, string> = Object.fromEntries(
  vercel.headers.find((h: { source: string }) => h.source === '/(.*)').headers.map((h: { key: string; value: string }) => [h.key, h.value]),
)

export default defineConfig({
  plugins: [vue(), jsonLd()],
  preview: { headers: securityHeaders },
  build: {
    rollupOptions: {
      // Pages d'information servies en HTML séparé : /faq/, /mentions-legales/, /confidentialite/, /cookies/
      input: {
        main: resolve(__dirname, 'index.html'),
        faq: resolve(__dirname, 'faq/index.html'),
        'mentions-legales': resolve(__dirname, 'mentions-legales/index.html'),
        confidentialite: resolve(__dirname, 'confidentialite/index.html'),
        cookies: resolve(__dirname, 'cookies/index.html'),
      },
    },
  },
})
