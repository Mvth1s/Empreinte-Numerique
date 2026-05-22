# Empreinte Numérique

Site éducatif 100% client-side qui démontre en temps réel toutes les données collectables passivement lors d'une visite web — et ce qu'il est possible d'en déduire — **sans cookie, sans permission, sans login**.

## Aperçu

Le site collecte et affiche 11 catégories de données :

| # | Section | Données clés |
|---|---|---|
| 01 | Réseau & IP | IP publique, géolocalisation, VPN/proxy, fuite WebRTC, DNS |
| 02 | Navigateur & OS | User-Agent, OS, langues, cookies tiers, détection bot |
| 03 | Fuseau & Locale | Timezone IANA, offset UTC, DST, formats date/nombre |
| 04 | Écran & Matériel | Résolution, DPR, CPU cores, RAM, batterie, refresh rate |
| 05 | GPU & Rendu | GPU via WebGL_debug_renderer_info, hash de rendu 3D |
| 06 | Fingerprinting | Canvas hash, Audio hash, polices système, CSS media bits |
| 07 | Stockage & État | localStorage, IndexedDB, Service Workers, cache timing attack |
| 08 | Connectivité | Type réseau, qualité effective, débit, latence RTT |
| 09 | Permissions | État de 7 permissions sans les demander, gyroscope, tactile |
| 10 | Comportement | Heatmap souris temps réel, scroll depth, temps de lecture |
| 11 | Localisation | Triangulation IP + timezone + locale sans GPS |

## Stack technique

- **Vite 5 + Vue 3 + TypeScript** — Composition API `<script setup>`
- **CSS custom** avec variables (`--cyan`, `--card`, `--line`…) — pas de framework CSS
- **100% client-side** — aucun backend, aucune donnée transmise à nos serveurs
- APIs externes uniquement : `api.ipify.org` + `ip-api.com` (géolocalisation IP)

## Développement

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # vue-tsc + vite build → dist/
npm run preview  # prévisualisation dist/
```

## Architecture

```
App.vue                          ← score + cursor + loading orchestration
├── LoadingScreen.vue            ← terminal animé (4.5s minimum)
├── HeaderSection.vue            ← jauge SVG animée + session ID
├── sections/
│   ├── NetworkSection.vue       → useNetwork()
│   ├── BrowserSection.vue       → useBrowser()
│   ├── TimezoneSection.vue      → useTimezone()
│   ├── ScreenSection.vue        → useScreen()
│   ├── GPUSection.vue           → useGPU()
│   ├── FingerprintSection.vue   → useFingerprint()
│   ├── StorageSection.vue       → useStorage()
│   ├── ConnectivitySection.vue  → useConnectivity()
│   ├── PermissionsSection.vue   → usePermissions()
│   ├── BehaviorSection.vue      → useBehavior()
│   └── LocationSection.vue      → useNetwork() + useTimezone()
├── CloserSection.vue            ← message de conclusion
└── FooterSection.vue            ← conseils de protection
```

### Pattern composable

Chaque `useXxx()` est un singleton côté module — les données async ne sont fetchées qu'une fois même si plusieurs composants appellent le même composable. Exemple : `_geoPromise` dans `useNetwork.ts` évite les doubles requêtes IP.

### Composant DataCard

Carte réutilisable pour afficher n'importe quelle donnée :

```vue
<DataCard
  icon="🌐"
  label="Nom de la carte"
  sectionIdx="section 01"
  :rows="[
    { k: 'CLE', v: valeur },
    { k: 'AUTRE', v: autreValeur, cls: 'muted' },
  ]"
  inference="Texte explicatif avec <strong>HTML autorisé</strong>."
  sensitivity="critical"
  :span="4"
  :loading="!valeur"
/>
```

`sensitivity` : `'low' | 'medium' | 'high' | 'critical'` → badge coloré (vert / jaune / rouge / blanc/noir)  
`span` : colonnes sur grille 12 (4, 6, 8, 12)  
`cls` sur les rows : `'muted'` | `'warn'` | `'bad'`

### Grille de mise en page

```css
.en-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
.col-4 { grid-column: span 4; }   /* 1/3 */
.col-6 { grid-column: span 6; }   /* 1/2 */
.col-8 { grid-column: span 8; }   /* 2/3 */
.col-12 { grid-column: span 12; } /* pleine largeur */
```

Les cartes ont une animation de révélation au scroll via `IntersectionObserver` + classe `.revealed`. DataCard le gère automatiquement ; les cartes custom doivent implémenter leur propre observer (voir `FingerprintSection.vue`).

## Note ip-api.com

`ip-api.com` ne supporte HTTPS que sur abonnement payant. Le composable `useNetwork` fait d'abord une requête HTTP et bascule automatiquement sur `ipapi.co` (HTTPS gratuit) si elle échoue.
