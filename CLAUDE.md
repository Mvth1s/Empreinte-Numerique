# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objectif du projet

**Empreinte Numérique** est un site éducatif 100% client-side qui démontre en temps réel toutes les données collectables passivement lors d'une visite web. But : sensibiliser à la vie privée de façon percutante.

## Commandes

```bash
npm run dev      # Serveur de développement (http://localhost:5173)
npm run build    # Build de production (vue-tsc + vite build)
npm run preview  # Prévisualisation du build dist/
```

## Stack

- **Vite 5 + Vue 3 + TypeScript** (Composition API `<script setup>`)
- **CSS vanilla** avec variables CSS dans `src/style.css` — pas de Tailwind pour la mise en page principale
- **100% client-side** — aucun backend, aucun cookie
- APIs externes : `api.ipify.org` (HTTPS) + `ip-api.com` (HTTP — free tier, fallback `ipapi.co`)

> `ip-api.com` ne supporte HTTPS que sur abonnement. Le composable `useNetwork` bascule sur `ipapi.co` si la requête HTTP échoue (mixed content en production HTTPS).

## Architecture

### Flux de données

```
App.vue
├── useNetwork()        → IP, géo, WebRTC leak, DNS résolveur
├── useFingerprint()    → canvas, audio, polices, CSS media
├── useScreen()         → résolution, DPR, CPU, RAM, batterie
├── useGPU()            → WebGL vendor/renderer/hash, WebGPU
└── score + dataPoints calculés ici → props à HeaderSection
```

Chaque composable est un **singleton côté module** pour les données async partagées (pattern `_geoPromise` dans `useNetwork.ts`). Plusieurs sections peuvent appeler le même composable sans doublon.

### Grille de mise en page (`.en-grid`)

La grille est en CSS pur dans `src/style.css` — 12 colonnes, gap 20px. Classes de span : `.col-4`, `.col-6`, `.col-8`, `.col-12`. Responsive : ≤1100px → 6 colonnes max, ≤720px → 12 colonnes (fullwidth).

### Composant DataCard

Toute donnée s'affiche via `DataCard.vue` avec les props :
- `rows: { k: string; v: string|null; cls?: 'muted'|'warn'|'bad' }[]`
- `sensitivity: 'low'|'medium'|'high'|'critical'`
- `span?: number` (colonnes grille, défaut 4)
- `loading?: boolean` (skeleton sur la première ligne)
- `inference?: string` (HTML autorisé, dans un `<details>`)

DataCard gère son propre `IntersectionObserver` pour l'animation de révélation au scroll. Les cartes custom (`.en-card` sans DataCard) doivent implémenter leur propre observer — voir `FingerprintSection.vue` et `BehaviorSection.vue`.

### Classes CSS clés

| Classe | Usage |
|---|---|
| `.en-grid` | Grille 12 colonnes |
| `.en-card` | Carte de base (opaque 0 → reveal) |
| `.en-card-head` | En-tête de carte (flex, border-bottom) |
| `.en-vals` / `.en-row` | Tableau clé-valeur mono |
| `.en-deduce` | Accordéon `<details>` pour l'inférence |
| `.sev-faible/moyen/eleve/critique` | Badges de sensibilité |
| `.fp-hash` / `.fp-caret` | Hash fingerprint + curseur clignotant |
| `.heat-canvas` | Canvas heatmap souris |
| `.en-term` / `.en-term-line` | Terminal pseudo-code (LocationSection) |
| `.en-closer` | Section de conclusion pleine largeur |
| `.en-footer` / `.en-footer-grid` | Footer 3 colonnes |

### Composables (`src/composables/`)

| Fichier | Données retournées |
|---|---|
| `useNetwork.ts` | `publicIP, country, city, isp, asn, isVPN, isProxy, localIPs, webrtcLeak, dnsResolver, loading` |
| `useBrowser.ts` | `userAgent, detectedOS, detectedBrowser, language, languages, platform, doNotTrack, cookiesEnabled, thirdPartyCookies, headless` |
| `useTimezone.ts` | `timezone, locale, utcOffset, isDST, localTime, dateFormat, numberFormat` |
| `useScreen.ts` | `resolution, availResolution, colorDepth, pixelRatio, cores, memory, battery, hdr, prefersColorScheme, refreshRate, touchPoints` |
| `useGPU.ts` | `vendor, renderer, webgl2, webgpu, renderHash, supportedTextureFormats` |
| `useFingerprint.ts` | `canvasHash, audioHash, cssMedia, detectedFonts, plugins, codecs, combinedHash, loading` |
| `useStorage.ts` | `localStorageAvail, sessionStorageAvail, indexedDBAvail, cookiesEnabled, serviceWorkerAvail, cacheAPIAvail, storageQuota, cacheTimings` |
| `useConnectivity.ts` | `connectionType, effectiveType, downlink, rtt, saveData, online` |
| `usePermissions.ts` | `geolocation, camera, microphone, notifications, clipboard, persistentStorage, midi, touchPoints, hasGyroscope, orientation` |
| `useBehavior.ts` | `scrollDepth, timeOnPage, tabSwitches, mousePositions, avgMouseSpeed` |

### Score de traçabilité (App.vue)

| Signal | Points |
|---|---|
| IP publique collectée | +15 |
| Ville géolocalisée | +10 |
| Fuite WebRTC | +15 |
| Canvas fingerprint | +15 |
| Audio fingerprint | +10 |
| GPU exact | +8 |
| Polices détectées (>5) | +8 |
| Signaux statiques (UA, timezone, écran) | +14 |

### Palette de couleurs (variables CSS)

```
--bg: #0a0a0f      --card: #0f0f17    --line: #1f1f2b
--bg-2: #111118    --card-2: #14141d  --line-2: #2a2a38
--cyan: #00e5ff    --red: #ff3b30     --yellow: #ffd60a
--mute: #6d6d80    --mute-2: #9a9aae  --fg: #f0f0f0
```

Polices : **IBM Plex Mono** (mono, data, labels) · **DM Sans** (corps, titres)
