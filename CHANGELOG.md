# Changelog

Toutes les modifications notables du projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

## [1.0.0] — 2026-05-24

Première version stable publique. Le projet passe de prototype (0.1.0) à version stable après une refonte complète du design, l'ajout de données réelles et la correction de tous les bugs connus.

### Ajouté
- **12 catégories** de données (~85 signaux) : Réseau, Navigateur, Fuseau, Écran, GPU, Fingerprinting, Stockage, Connectivité, Permissions, Comportement, Localisation, Se protéger
- **Détection VPN/proxy/tor** via `ipwho.is` (HTTPS, sans clé API) — fonctionnelle en production
- **Animation globe terrestre** rotatif (projection orthographique) pour l'onglet Localisation
- **Démos interactives** inline dans PermissionsSection : caméra live, VU-mètre microphone, presse-papiers, notification push, géolocalisation GPS
- **Carte GPS réelle** (±<10 m avec permission) avec géocodage inverse Nominatim
- **Rythme de frappe** biométrique et **latéralité** (droitier/gaucher) détectés dans BehaviorSection
- **Voix TTS** installées et **périphériques médias** dans FingerprintSection
- **Batterie** dans ScreenSection (via Battery Status API)
- **Score de traçabilité** (0–100) calculé en temps réel dans le header
- **Modal de partage** — résumé textuel non sensible copiable
- **12 animations canvas** de fond thématisées par onglet (globe, radar, hexrain, tron, flow, cursor, clock, scan, blocks, wave, rings, particles)
- **97 polices** testées dans la détection de polices (était annoncé à tort comme 80)
- Conclusion personnalisée avec les vraies données de la session

### Corrigé
- Détection VPN inopérante en production HTTPS (`ipapi.co` hardcodait `proxy: false`)
- `sessionDate` affichait l'heure locale labelée "UTC" — corrigé vers `getUTCHours()`
- CSS cascade : `.col-12` écrasé par `.card { span: 4 }` (ordre de déclaration) — cartes GPS pleine largeur désormais fonctionnelles
- Compteur signaux popup : "~140" → "~85" (valeur réelle)
- Compteur BrowserSection : "12" → "13" signaux
- `reverseGeocode` dupliqué dans LocationSection et PermissionsSection → extrait dans `src/utils/geocode.ts`
- `localSubnet`/`guessSubnet` dans useConnectivity : code mort supprimé
- `regionName` dans useNetwork : exposé directement (plus de split fragile sur la ville)
- IP latitude/longitude manquants dans le fallback ipapi.co

### Modifié
- API principale HTTPS : `ipapi.co` → `ipwho.is` (avec détection VPN/proxy/tor)
- `DataCard` → `DataCardV2` : nouvelles props (`mean`, `deduce`, `techKey`, `techVal`, slot `#demo`)
- Navigation par onglets avec loading overlay thématisé et animation de fond dédiée
- Design system complet refait (variables CSS, grille 12 colonnes, responsive mobile/tablette/desktop)

---

## [0.1.0] — 2026-04-xx

Version prototype initiale.

### Ajouté
- Structure de base Vite 5 + Vue 3 + TypeScript
- 11 sections de données (sans ConclusionSection)
- Composables : useNetwork, useBrowser, useTimezone, useScreen, useGPU, useFingerprint, useStorage, useConnectivity, usePermissions, useBehavior
- Navigation par onglets desktop + mobile
- Score de traçabilité basique
- Responsive design (mobile, tablette, desktop)

---

[1.0.0]: https://github.com/Mvth1s/Empreinte-Numerique/releases/tag/v1.0.0
[0.1.0]: https://github.com/Mvth1s/Empreinte-Numerique/commits/main
