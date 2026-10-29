<template>
  <section id="mentions-legales" class="faq" aria-labelledby="legal-title">
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">⚖️</span>
        <div>
          <h2 id="legal-title">Mentions légales</h2>
          <p class="th-sub">Projet personnel, éducatif et non commercial, édité par un particulier.</p>
        </div>
      </div>
    </div>

    <div class="cards">
      <article class="card faq-card col-6">
        <h3>Éditeur</h3>
        <div class="c-box">
          <p>
            Mathis Aguado, particulier. Site gratuit, sans publicité ni activité commerciale.
            Contact : <a href="mailto:mag.d3v+empreinte-numerique@pm.me">mag.d3v+empreinte-numerique@pm.me</a>.
          </p>
        </div>
      </article>
      <article class="card faq-card col-6">
        <h3>Hébergeur</h3>
        <div class="c-box">
          <p>
            Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis. Contact :
            <a href="mailto:privacy@vercel.com">privacy@vercel.com</a> (téléphone non communiqué par
            l'hébergeur). Vercel est certifié EU-U.S. Data Privacy Framework.
          </p>
        </div>
      </article>
      <article class="card faq-card col-6">
        <h3>Code source et licence</h3>
        <div class="c-box">
          <p>
            Code ouvert sur
            <a href="https://github.com/Mvth1s/Empreinte-Numerique" target="_blank" rel="noopener">GitHub</a>,
            sous licence MIT. Polices DM Sans et IBM Plex Mono sous licence SIL Open Font License.
          </p>
        </div>
      </article>
      <article class="card faq-card col-6">
        <h3>Signaler une faille de sécurité</h3>
        <div class="c-box">
          <p>
            Merci de ne pas ouvrir d'issue publique : suivez la
            <a href="https://github.com/Mvth1s/Empreinte-Numerique/blob/main/SECURITY.md" target="_blank" rel="noopener">politique de sécurité</a>
            du projet.
          </p>
        </div>
      </article>
    </div>
  </section>

  <section id="confidentialite" class="faq" aria-labelledby="privacy-title">
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🔒</span>
        <div>
          <h2 id="privacy-title">Politique de confidentialité</h2>
          <p class="th-sub">Quelles données quittent éventuellement votre navigateur, et vers qui.</p>
        </div>
      </div>
    </div>

    <div class="cards">
      <article v-for="item in PRIVACY" :key="item.q" class="card faq-card col-6">
        <h3>{{ item.q }}</h3>
        <div class="c-box">
          <p>{{ item.a }}</p>
        </div>
      </article>
      <article class="card faq-card col-6">
        <h3>Vos droits</h3>
        <div class="c-box">
          <p>
            Vous disposez des droits d'accès, de rectification, d'effacement, d'opposition et de limitation.
            Comme le site ne conserve aucune donnée vous concernant, il n'y a en pratique rien à effacer de
            notre côté ; pour les données traitées par les services tiers, adressez-vous à eux. Contact pour
            toute question liée à vos données :
            <a href="mailto:mag.d3v+empreinte-numerique@pm.me">mag.d3v+empreinte-numerique@pm.me</a>.
            Vous pouvez aussi saisir la
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener">CNIL</a>.
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const PRIVACY = [
  {
    q: 'Données calculées dans votre navigateur',
    a: "Navigateur, système, écran, matériel, GPU, polices, empreintes canvas/audio, fuseau horaire, stockage, comportement (souris, défilement) : tout est calculé localement par JavaScript et affiché à l'écran. Rien de tout cela n'est envoyé à un serveur de ce site : il n'y a ni backend, ni base de données, ni compte.",
  },
  {
    q: 'Services tiers contactés par votre navigateur',
    a: "Pour la démonstration, votre navigateur contacte directement des services tiers, qui voient donc votre adresse IP et votre navigateur : ipify (IP publique), ipwho.is, freeipapi.com et ipapi.co (géolocalisation de l'IP), ip-api.com (résolveur DNS), serveurs STUN de Google et Cloudflare (WebRTC), Cloudflare (test de débit), Nominatim / OpenStreetMap (nom de ville, uniquement si vous partagez votre position GPS), ainsi que des domaines publicitaires et CDN (Google, Amazon, Criteo, Taboola, Meta, Hotjar, jsDelivr, cdnjs) interrogés sans cookie pour tester votre bloqueur et votre cache.",
  },
  {
    q: 'Permissions demandées',
    a: "Position GPS, caméra, micro, notifications et presse-papiers ne sont demandés que si vous cliquez sur la démo correspondante, et vous pouvez refuser. Le flux caméra/micro et le contenu du presse-papiers restent dans votre navigateur ; seules les coordonnées GPS sont transmises à Nominatim pour afficher le nom de la ville.",
  },
  {
    q: 'Google Analytics et consentement',
    a: "Avec votre accord uniquement, Google Analytics 4 mesure l'audience (pages vues, provenance) et dépose les cookies _ga (13 mois maximum), avec anonymisation de l'IP et sans finalité publicitaire. Tant que vous n'avez pas accepté, aucun script Google Analytics n'est chargé. Refuser est aussi simple qu'accepter, et vous pouvez retirer votre consentement à tout moment via « Gérer les cookies » en bas de page : les cookies _ga sont alors supprimés. Les données sont traitées par Google et peuvent être transférées hors de l'Union européenne.",
  },
  {
    q: 'Stockage local',
    a: "Le site enregistre uniquement votre choix de consentement dans le localStorage (clé en-consent), jusqu'à ce que vous le modifiiez ou effaciez les données du site. Les tests de stockage écrivent puis suppriment immédiatement une valeur témoin.",
  },
  {
    q: 'Durée de conservation',
    a: "Ce site ne conserve aucune donnée : il n'a pas de base de données. Les journaux techniques éventuellement tenus par l'hébergeur et les données des services tiers relèvent de leurs propres politiques. Données Google Analytics : conservées 2 mois.",
  },
]
</script>
