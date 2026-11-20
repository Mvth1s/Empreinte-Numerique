# Changelog

Toutes les modifications notables du projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

---

## [Non publié]

### Ajouté
- **Google Analytics 4** chargé uniquement après consentement (bandeau cookies RGPD, refus aussi simple que l'acceptation, choix modifiable via « Cookies » en pied de page)
- Balise de vérification **Google Search Console**
- **En-têtes de sécurité** (Content-Security-Policy, HSTS, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, COOP)
- **Page FAQ dédiée** `/faq/` (avec ses données structurées FAQPage), retirée du bas de l'accueil
- **Pré-rendu au build** de la FAQ et des pages légales (HTML lisible sans JavaScript, hydraté ensuite) ; liens vers ces pages dans le `<noscript>` de l'accueil
- **Accessibilité** : onglets ARIA navigables au clavier, menu mobile en boutons, fenêtres modales avec focus piégé, fermeture par Échap et focus restitué
- **Pages légales séparées** : `/mentions-legales/`, `/confidentialite/` et `/cookies/` (nouvelle politique cookies avec choix modifiable sur la page), liées depuis le pied de page de toutes les pages et ajoutées au sitemap
- **Thème clair** (suit le réglage du système, bouton pour forcer clair/sombre, sans flash au chargement) ; fonds animés et écrans de chargement adaptés au thème
- **Lisibilité** : tailles en `rem` (respectent la taille de police du navigateur), aucun texte sous 12 px, contrastes WCAG AA vérifiés dans les deux thèmes, lien « Aller au contenu », cibles tactiles de 44 px
- **Design** plus sobre : coins arrondis, moins de majuscules espacées et d'effets néon, police mono réservée aux données techniques
- Animation de chargement limitée à la première visite de chaque onglet (1,6 s au lieu de 2,8 s à chaque changement)
- **Valeurs masquées par le navigateur signalées** : bandeau « Masqué ou faussé par votre navigateur » sur chaque carte concernée (GPU, empreintes dessin/son/3D, écran, fuseau, cœurs, polices, plugins, langues, système, données non fournies), détection par tests à réponse connue ; le score ne compte plus les signaux brouillés
- **Explications réécrites en langage courant** sur les 91 cartes ; encadrés « Ce que ça veut dire » (bleu) et « Ce qu'on peut en déduire » (couleur du risque) visuellement distincts
- **Onglet « Se protéger » mis à jour** (uBlock Origin complet retiré de Chrome, mode Strict de Firefox 145, Brave) et **date de vérification** affichée dans le pied de page

### Corrigé
- Le bruit d'empreinte de Brave et Safari (identique pendant toute une session) n'était pas détecté : l'empreinte était présentée comme « stable »
- Chiffre inventé retiré (« 1 sur 287 000 ») au profit des études publiées ; affirmation « votre quartier suffit » corrigée (l'IP situe la ville)
- Erreurs JavaScript des animations de chargement (rayon négatif, anneau introuvable)
- `llms.txt` aligné sur la réalité : cookie Google Analytics avec consentement, liste à jour des services tiers, onglet Bloqueurs, liens vers les pages légales

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
