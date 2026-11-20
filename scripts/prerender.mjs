// Injecte le HTML pré-rendu dans dist/ après `vite build` + `vite build --ssr src/entry-server.ts --outDir .ssr`.
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = resolve(fileURLToPath(import.meta.url), '../..')
const ssrDir = resolve(root, '.ssr')
const { LEGAL_PAGES, renderLegal } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href)

async function inject(file, marker, html) {
  const path = resolve(root, 'dist', file)
  const src = await readFile(path, 'utf8')
  if (!src.includes(marker)) throw new Error(`${file} : « ${marker} » introuvable`)
  await writeFile(path, src.replace(marker, html))
  console.log(`prerender: ${file}`)
}

for (const page of LEGAL_PAGES) {
  await inject(`${page}/index.html`, '<div id="app"></div>', `<div id="app">${await renderLegal(page)}</div>`)
}

await rm(ssrDir, { recursive: true, force: true })
