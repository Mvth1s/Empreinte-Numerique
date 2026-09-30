// Source unique de la FAQ : affichée par FaqSection.vue et sérialisée en JSON-LD FAQPage au build (vite.config.ts).
// Réponses factuelles, < 300 caractères chacune.

export interface FaqItem {
  q: string
  a: string
}

export const FAQ: FaqItem[] = [
  {
    q: "Qu'est-ce que l'empreinte numérique ?",
    a: "C'est l'ensemble des informations que votre navigateur transmet ou laisse lire à un site : adresse IP, langue, fuseau horaire, écran, matériel, polices… Combinées, elles suffisent souvent à vous reconnaître d'une visite à l'autre.",
  },
  {
    q: "Qu'est-ce que le fingerprinting ?",
    a: "Une technique de pistage sans cookie : le site fait dessiner une image (canvas), traiter un son (audio) ou interroge le GPU et les polices, puis calcule un hash. Ce hash varie peu d'une visite à l'autre et sert d'identifiant.",
  },
  {
    q: "Ce site stocke-t-il mes données ?",
    a: "Non. Tout est calculé dans votre navigateur, sans cookie ni base de données. Certaines mesures interrogent des services tiers (géolocalisation d'IP, OpenStreetMap, serveur STUN de Google, DNS Cloudflare), qui voient donc votre IP.",
  },
  {
    q: "Qu'est-ce qu'une fuite WebRTC ?",
    a: "WebRTC sert aux appels vidéo dans le navigateur. Pour établir la connexion, il peut exposer vos adresses IP locales, voire votre IP réelle derrière certains VPN, à n'importe quel site qui l'interroge en JavaScript.",
  },
  {
    q: "Un VPN suffit-il à me rendre anonyme ?",
    a: "Non. Un VPN masque votre IP, mais pas l'empreinte de votre navigateur : canvas, GPU, polices, écran ou fuseau horaire restent lisibles. Votre fuseau peut même contredire la localisation affichée par le VPN.",
  },
  {
    q: "La navigation privée me protège-t-elle ?",
    a: "Elle efface cookies et historique à la fermeture, mais ne change ni votre IP ni l'empreinte de votre appareil. Un site peut donc toujours vous reconnaître pendant et après une session privée.",
  },
  {
    q: "Comment réduire sa traçabilité ?",
    a: "Utilisez un navigateur qui résiste au fingerprinting (Tor Browser, Brave, Firefox durci), un bloqueur comme uBlock Origin, un DNS chiffré et, si besoin, un VPN de confiance. L'onglet « Se protéger » détaille chaque option.",
  },
]
