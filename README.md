# Empreinte Numérique

Site éducatif 100% client-side qui démontre en temps réel toutes les données collectables passivement lors d'une visite web — et ce qu'il est possible d'en déduire — **sans cookie, sans permission, sans login**.

## Aperçu

Le site collecte et affiche 12 catégories de données (~85 signaux au total) :

| # | Section | Signaux | Données clés |
|---|---|---|---|
| 01 | Réseau & IP | 5 | IP publique, pays/ville/région, VPN/proxy/tor détecté, fuite WebRTC, résolveur DNS |
| 02 | Navigateur & OS | 13 | User-Agent, OS, langues, DNT, GPC, Client Hints UA-CH, taille barres d'outils, PDF viewer, headless |
| 03 | Fuseau & Locale | 7 | Timezone IANA, offset UTC, DST, heure locale, locale système, formats date/nombre |
| 04 | Écran & Matériel | 12 | Résolution, DPR, CPU cores, RAM, batterie, refresh rate, heap JS, multi-écrans, HDR |
| 05 | GPU & Rendu | 6 | Fabricant/modèle GPU (WebGL), hash de rendu 3D, WebGL2, WebGPU, formats texture |
| 06 | Fingerprinting | 8 | Canvas hash, audio hash, 97 polices testées, CSS media bits, voix TTS, périphériques médias |
| 07 | Stockage & État | 7 | localStorage, sessionStorage, IndexedDB, Service Worker, Cache API, quota, timing CDN |
| 08 | Connectivité | 6 | Statut en ligne, type réseau, type effectif (4G/5G…), débit estimé, latence RTT, économie data |
| 09 | Permissions | 9 | 7 états de permission lus silencieusement + gyroscope + orientation écran |
| 10 | Comportement | 7 | Heatmap souris live, rythme de frappe biométrique, latéralité, scroll depth, temps de lecture, changements d'onglet |
| 11 | Localisation | 5–6 | Triangulation IP, GPS optionnel (±<10 m avec permission), fusion fuseau/IP pour détecter VPN |
| 12 | Se protéger | — | Synthèse personnalisée des données collectées + 6 recommandations avec vos vraies données de session |

## Stack technique

- **Vite 5 + Vue 3 + TypeScript** — Composition API `<script setup>`, `vue-tsc` vérifie les types avant le build
- **CSS vanilla** avec variables custom (`--cyan`, `--card`, `--line`…) — pas de framework CSS
- **100% client-side** — aucun backend, aucune donnée transmise, aucun cookie
- APIs externes (par ordre de priorité) :
  - `api.ipify.org` — IP publique (HTTPS)
  - `ip-api.com` — géo complète + détection proxy/VPN (HTTP seulement, utilisé en dev)
  - `ipwho.is` — géo + détection VPN/proxy/tor (HTTPS, utilisé en production)
  - `ipapi.co` — géo basique (HTTPS, dernier recours)
  - `nominatim.openstreetmap.org` — geocodage inverse GPS → nom de ville

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # vue-tsc + vite build → dist/
npm run preview  # prévisualisation dist/
```

## Architecture

```
App.vue                            ← welcome modal, score traçabilité, routing onglets, loading
├── BackgroundCanvas.vue           ← animation canvas par onglet (globe, radar, hexrain, tron…)
├── LoadOverlay.vue                ← overlay de chargement animé et thématisé par section
└── sections/
    ├── NetworkSection.vue         → useNetwork()
    ├── BrowserSection.vue         → useBrowser()
    ├── TimezoneSection.vue        → useTimezone()
    ├── ScreenSection.vue          → useScreen()
    ├── GPUSection.vue             → useGPU()
    ├── FingerprintSection.vue     → useFingerprint()
    ├── StorageSection.vue         → useStorage()
    ├── ConnectivitySection.vue    → useConnectivity()
    ├── PermissionsSection.vue     → usePermissions()
    ├── BehaviorSection.vue        → useBehavior()
    ├── LocationSection.vue        → useNetwork() + useTimezone() + reverseGeocode()
    └── ConclusionSection.vue      → useNetwork() + useFingerprint() + useGPU()
```

### Pattern composable

Chaque `useXxx()` est indépendant — les données async ne sont fetchées qu'une fois même si plusieurs composants appellent le même composable. `_geoPromise` dans `useNetwork.ts` évite les doubles requêtes IP. Les refs réactives sont créées à chaque appel (pas de store global).

### Composant DataCardV2

Carte réutilisable pour afficher n'importe quelle donnée :

```vue
<DataCardV2
  icon="🌐"
  title="Nom de la carte"
  :value="maValeur"
  mean="Ce que ça veut dire (affiché en clair)."
  deduce="Ce qu'on peut en déduire (implications concrètes)."
  tech-key="api.ou.méthode()"
  :tech-val="valeurBrute"
  severity="eleve"
  sev-label="élevé"
  :loading="!maValeur"
  :span="6"
/>
```

- `severity` : `'faible' | 'moyen' | 'eleve' | 'critique'` → badge coloré
- `span` : colonnes sur grille 12 (3, 4, 6, 8, 12) — défaut 4
- Slot `#demo` : pour injecter une démo interactive inline (ex : caméra live, VU-mètre, presse-papiers)

### Grille de mise en page

```css
/* Conteneur — dans chaque section */
.cards { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }

/* Span appliqué sur .card via la prop :span de DataCardV2 */
.col-4  { grid-column: span 4; }   /* 1/3 */
.col-6  { grid-column: span 6; }   /* 1/2 */
.col-8  { grid-column: span 8; }   /* 2/3 */
.col-12 { grid-column: span 12; }  /* pleine largeur */
```

Les `.col-X` doivent être déclarés **après** `.card` dans le CSS (même spécificité, la cascade s'applique).

### Utilitaires partagés

- `src/utils/hash.ts` — `sha256(str)` (Web Crypto API) + `shortHash(hash)` (16 chars uppercase)
- `src/utils/geocode.ts` — `reverseGeocode(lat, lon)` via Nominatim, partagé par LocationSection et PermissionsSection

## Détection VPN

Sur HTTP (dev) : `ip-api.com` retourne les champs `proxy` et `hosting`.  
Sur HTTPS (production) : `ipwho.is` retourne `security.vpn`, `security.proxy`, `security.tor`.  
`ipapi.co` est utilisé en dernier recours mais ne détecte pas les VPN — `proxy` et `hosting` y sont hardcodés à `false`.
