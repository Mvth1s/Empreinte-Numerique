import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { FAQ } from './src/data/faq'

const SITE_URL = 'https://empreinte-numerique.vercel.app/'

// Données structurées injectées statiquement dans index.html (lisibles sans exécuter le JS).
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
        name: 'Mathis Aguado',
        url: 'https://mathisaguado.vercel.app',
        sameAs: ['https://github.com/Mvth1s'],
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}#faq`,
        inLanguage: 'fr',
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  }

  // Échappe "<" pour qu'aucune chaîne ne puisse fermer la balise <script>.
  const json = JSON.stringify(graph).replace(/</g, '\\u003c')

  return {
    name: 'json-ld',
    transformIndexHtml: () => [
      { tag: 'script', attrs: { type: 'application/ld+json' }, children: json, injectTo: 'head' },
    ],
  }
}

export default defineConfig({
  plugins: [vue(), jsonLd()],
})
