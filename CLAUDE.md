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

- **Vite 5 + Vue 3 + TypeScript** (Composition API `<script setup>`) — `vue-tsc` vérifie les types avant `vite build`
- **CSS vanilla** avec variables CSS dans `src/style.css` — `tailwindcss` est dans les devDeps mais n'est pas utilisé pour la mise en page principale
- **100% client-side** — aucun backend, aucun cookie, aucun test automatisé
- APIs externes (par ordre de priorité HTTPS) :
  - `api.ipify.org` — IP publique (HTTPS)
  - `ip-api.com` — géo complète avec détection proxy/VPN (HTTP seulement, free tier ; utilisé en dev HTTP)
  - `ipwho.is` — géo + détection VPN/proxy/tor (HTTPS, sans clé API ; utilisé en production)
  - `ipapi.co` — géo basique (HTTPS, dernier recours si ipwho.is échoue, sans détection proxy)
  - `nominatim.openstreetmap.org` — geocodage inverse GPS → nom de ville

> Sur HTTPS (production), ip-api.com est ignoré (mixed content). `ipwho.is` est le provider principal : il retourne `security.vpn`, `security.proxy`, `security.tor`. `ipapi.co` sert uniquement de dernier recours et ne détecte pas les VPN.

## Architecture

### Flux de données

```
App.vue
├── useNetwork()        → IP, géo, VPN/proxy/tor, WebRTC leak, DNS résolveur
├── useFingerprint()    → canvas, audio, polices, CSS media, TTS, périphériques
├── useScreen()         → résolution, DPR, CPU, RAM, batterie, heap, refresh rate
├── useGPU()            → WebGL vendor/renderer/hash, WebGPU
└── score de traçabilité calculé ici (composables appelés en double côté sections)
```

Le **fetch réseau** est mis en cache au niveau module via `_geoPromise` dans `useNetwork.ts` — plusieurs composants peuvent appeler `useNetwork()` sans déclencher plusieurs requêtes. Les refs réactives sont créées à chaque appel (pas de Pinia ni de store global).

### Grille de mise en page

La grille est en CSS pur dans `src/style.css` — 12 colonnes, gap 20px. Chaque section utilise `.cards` comme conteneur et les cartes portent leur propre classe de span via `DataCardV2` (`:span` prop → `.col-N`). Classes disponibles : `.col-3`, `.col-4`, `.col-6`, `.col-8`, `.col-12`. Responsive : ≤1100px → 6 colonnes max, ≤720px → pleine largeur.

### Composant DataCardV2

Toute donnée s'affiche via `DataCardV2.vue` (`src/components/DataCardV2.vue`) avec les props :
- `icon: string` — emoji affiché en en-tête
- `title: string` — titre de la carte (h3)
- `value: string | number` — valeur principale affichée
- `mean: string` — explication "Ce que ça veut dire"
- `deduce: string` — implication "Ce qu'on peut en déduire"
- `tech-key: string` — API/méthode technique utilisée
- `tech-val: string | number` — valeur brute technique
- `severity: 'faible' | 'moyen' | 'eleve' | 'critique'` — badge de sensibilité
- `sev-label: string` — libellé du badge (affiché tel quel)
- `loading?: boolean` — état squelette
- `span?: number` — colonnes grille (défaut 4)

Le slot nommé `#demo` permet d'injecter une démo interactive inline dans la carte (ex : caméra live, VU-mètre micro, presse-papiers dans `PermissionsSection`).

### Classes CSS clés

| Classe | Usage |
|---|---|
| `.cards` | Conteneur grille 12 colonnes (gap 20px) |
| `.card` | Carte de base — span 4 par défaut, animation reveal au scroll |
| `.col-3/4/6/8/12` | Override de span — doit être déclaré APRÈS `.card` dans le CSS |
| `.badge` / `.b-faible/moyen/eleve/critique` | Badge de sensibilité coloré |
| `.sev-faible/moyen/eleve/critique` | Border-left colorée sur `.card` |
| `.tab-header` / `.tab-foot` | En-tête et pied de section (titre + compteur / avertissement) |
| `.th-count` | Compteur de signaux (coin haut droit du tab-header) |
| `.hero-block` | Bloc hero pleine largeur en haut de section |
| `.fp-block` | Variante hero pour FingerprintSection (fond grille) |
| `.loc-block` / `.loc-map` / `.loc-line` | Layout LocationSection (carte radar + infos) |
| `.beh-block` | Layout BehaviorSection (heatmap canvas) |
| `.conclusion-hero` / `.protect-grid` / `.protect-card` | Layout ConclusionSection |
| `.ch-summary` / `.ch-item` / `.ch-label` / `.ch-val` | Grille de données collectées dans la conclusion |
| `.pc-personal` | Bloc de données personnalisées dans les protect-cards |
| `.c-inline-demo` / `.pdc-*` | Démos interactives inline dans les cartes PermissionsSection |

### Utilitaires partagés

- `src/types/index.ts` — types exportés : `Sensitivity`, `DataItem`, `GeoData`
- `src/utils/hash.ts` — `sha256(str): Promise<hex>` (Web Crypto API) + `shortHash(hash): string` (16 premiers caractères en majuscules)
- `src/utils/geocode.ts` — `reverseGeocode(lat, lon): Promise<string | null>` via Nominatim (OpenStreetMap), partagé par `LocationSection` et `PermissionsSection`

### Composables (`src/composables/`)

| Fichier | Données retournées |
|---|---|
| `useNetwork.ts` | `publicIP, country, countryCode, city, regionName, lat, lon, isp, asn, isVPN, isProxy, localIPs, webrtcLeak, dnsResolver, loading, networkError` |
| `useBrowser.ts` | `userAgent, detectedOS, detectedBrowser, language, languages, platform, doNotTrack, cookiesEnabled, thirdPartyCookies, headless, clientHintBrands, clientHintMobile, chromeSizeW, chromeSizeH, pdfViewerEnabled, globalPrivacyControl` |
| `useTimezone.ts` | `timezone, locale, utcOffset, isDST, localTime, dateFormat, numberFormat` |
| `useScreen.ts` | `resolution, availResolution, colorDepth, pixelRatio, cores, memory, battery, hdr, prefersColorScheme, refreshRate, touchPoints, heapUsed, heapLimit, isExtended` |
| `useGPU.ts` | `vendor, renderer, webgl2, webgpu, renderHash, supportedTextureFormats` |
| `useFingerprint.ts` | `canvasHash, audioHash, cssMedia, detectedFonts, plugins, codecs, ttsVoices, mediaDeviceCount, combinedHash, loading` + constante `FONTS_COUNT` exportée |
| `useStorage.ts` | `localStorageAvail, sessionStorageAvail, indexedDBAvail, cookiesEnabled, serviceWorkerAvail, cacheAPIAvail, storageQuota, cacheTimings` |
| `useConnectivity.ts` | `connectionType, effectiveType, downlink, rtt, saveData, online` |
| `usePermissions.ts` | `geolocation, camera, microphone, notifications, clipboard, persistentStorage, midi, touchPoints, hasGyroscope, orientation` |
| `useBehavior.ts` | `scrollDepth, timeOnPage, tabSwitches, mousePositions, avgMouseSpeed, avgKeyInterval, handedness` |

### Score de traçabilité (App.vue)

Le score (0–100) est calculé dans `App.vue`. Les composables `useNetwork`, `useFingerprint`, `useScreen`, `useGPU`, `useConnectivity` sont appelés ici pour le score ; les sections les appellent à nouveau de leur côté (la mise en cache de `_geoPromise` évite les doublons réseau).

| Signal | Points |
|---|---|
| Base (UA, timezone, écran toujours lisibles) | +20 |
| IP publique collectée | +15 |
| Ville géolocalisée | +10 |
| IPs locales via WebRTC | +15 |
| Canvas fingerprint | +15 |
| Audio fingerprint | +10 |
| GPU exact | +8 |
| Polices détectées (>5) | +7 |

Score total max : 100 (cap via `Math.min(s, 100)`).

### Palette de couleurs (variables CSS)

```
--bg: #0a0a0f      --card: #0f0f17    --line: #1f1f2b
--bg-2: #111118    --card-2: #14141d  --line-2: #2a2a38
--cyan: #00e5ff    --red: #ff3b30     --yellow: #ffd60a
--mute: #6d6d80    --mute-2: #9a9aae  --fg: #f0f0f0
```

Polices : **IBM Plex Mono** (mono, data, labels) · **DM Sans** (corps, titres)
