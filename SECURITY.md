# Politique de sécurité

## Périmètre

**Empreinte Numérique** est un site éducatif 100 % client-side. Il n'y a :
- aucun backend ni base de données
- aucun cookie ni stockage de données utilisateur
- aucune authentification ni compte utilisateur
- aucune donnée transmise à nos serveurs (toutes les données restent dans le navigateur)

Les seules dépendances réseau sont des APIs tierces en lecture seule :
- `api.ipify.org` — détection IP publique
- `ipwho.is` — géolocalisation + détection VPN/proxy
- `ipapi.co` — fallback géolocalisation
- `nominatim.openstreetmap.org` — geocodage inverse GPS

## Ce qu'on considère comme une vulnérabilité

| Catégorie | Exemples |
|---|---|
| XSS | Injection de code depuis une API tierce affiché sans sanitisation |
| Fuite de données | Une donnée sensible envoyée vers un serveur non documenté |
| Dépendance compromise | Une dépendance npm avec du code malveillant |
| Comportement trompeur | Le site prétend ne pas envoyer de données mais le fait |

## Ce qui n'est **pas** une vulnérabilité

- Les données affichées dans l'interface sont **intentionnellement collectées** à des fins pédagogiques — c'est le principe du projet.
- La détection GPU, canvas fingerprint, etc. sont **des démonstrations volontaires**, pas des failles.
- Les APIs tierces (ipwho.is, Nominatim) sont hors périmètre — signalez leurs problèmes directement à leurs mainteneurs.

## Signaler une vulnérabilité

**Ne pas ouvrir une issue publique GitHub pour une vulnérabilité de sécurité.**

Contactez par e-mail : **mvg.ai+security@pm.me**

Incluez dans votre rapport :
- Description du problème et impact potentiel
- Étapes pour reproduire
- Version / commit concerné
- Preuve de concept si disponible (de façon responsable)

Vous recevrez une réponse sous **7 jours**. Si la vulnérabilité est confirmée, un correctif sera publié et vous serez crédité dans le changelog (sauf si vous préférez rester anonyme).

## Versions supportées

Seule la dernière version sur la branche `main` est activement maintenue.

| Version | Support |
|---|---|
| `main` (latest) | ✅ Actif |
| Branches `dev/*` | ⚠️ En développement — instable |
| Versions archivées | ❌ Non maintenu |
