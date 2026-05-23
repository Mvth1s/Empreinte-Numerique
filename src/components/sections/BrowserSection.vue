<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🖥️</span>
        <div>
          <h2>Navigateur &amp; OS</h2>
          <p class="th-sub">Chaque visite envoie une carte d'identité technique très bavarde.</p>
        </div>
      </div>
      <div>
        <span class="th-count">12<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖥️"
        title="Système d'exploitation"
        :value="br.detectedOS.value"
        mean="L'OS est détecté depuis le User-Agent envoyé automatiquement par votre navigateur à chaque requête HTTP."
        deduce="Ciblage de malwares spécifiques, exploitation de failles OS, personnalisation de contenu, profilage matériel."
        tech-key="navigator.userAgent › OS"
        :tech-val="br.detectedOS.value"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="🌐"
        title="Navigateur"
        :value="br.detectedBrowser.value"
        mean="Le nom et la version du navigateur sont extraits du User-Agent transmis dans chaque en-tête HTTP."
        deduce="Profilage d'utilisateur, ciblage de vulnérabilités, personnalisation de l'expérience, contournement de protections."
        tech-key="navigator.userAgent › Browser"
        :tech-val="br.detectedBrowser.value"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="🗣️"
        title="Langue principale"
        :value="br.language.value"
        mean="La langue préférée est déclarée dans les en-têtes HTTP (Accept-Language) et via navigator.language."
        deduce="Déduction de la nationalité ou région, contournement des restrictions géographiques, profil culturel."
        tech-key="navigator.language"
        :tech-val="br.language.value"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🌍"
        title="Toutes les langues"
        :value="br.languages.value.join(', ')"
        mean="La liste complète des langues acceptées par votre navigateur, par ordre de préférence."
        deduce="Fingerprinting de la configuration linguistique, identification précise de la région d'origine."
        tech-key="navigator.languages"
        :tech-val="br.languages.value.join(', ')"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="💻"
        title="Plateforme déclarée"
        :value="br.platform.value"
        mean="navigator.platform retourne la plateforme matérielle déclarée par le navigateur."
        deduce="Contribue au fingerprinting du matériel, permet de distinguer mobile/desktop/tablette indépendamment de l'UA."
        tech-key="navigator.platform"
        :tech-val="br.platform.value"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🛡️"
        title="Do Not Track"
        :value="br.doNotTrack.value === '1' ? 'Activé' : 'Désactivé'"
        mean="Le signal DNT est une préférence que vous pouvez activer dans votre navigateur — mais il est ignoré par la plupart des sites."
        deduce="Les trackers ignorent majoritairement ce signal. Sa présence peut même contribuer à votre empreinte unique."
        tech-key="navigator.doNotTrack"
        :tech-val="br.doNotTrack.value ?? 'null'"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🍪"
        title="Cookies activés"
        :value="br.cookiesEnabled.value ? 'Oui' : 'Non'"
        mean="Les cookies permettent aux sites de stocker des informations persistantes sur votre navigateur."
        deduce="Permet le suivi cross-session, la persistance de session, le tracking publicitaire à long terme."
        tech-key="navigator.cookieEnabled"
        :tech-val="String(br.cookiesEnabled.value)"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🤖"
        title="Navigateur headless"
        :value="br.headless.value ? 'Probable — Bot détecté' : 'Navigation humaine'"
        mean="Le site vérifie si votre navigateur se comporte normalement — ou s'il est piloté par un programme automatique (robot, script de test ou outil de scraping)."
        deduce="Si vous êtes détecté comme bot, certains contenus vous sont cachés ou un CAPTCHA vous est présenté. Vous pourriez aussi être banni automatiquement."
        tech-key="navigator.webdriver + heuristiques"
        :tech-val="String(br.headless.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🔬"
        title="Client Hints (UA-CH)"
        :value="br.clientHintBrands.value ?? 'Non supporté (Firefox/Safari)'"
        mean="Les navigateurs basés sur Chrome fournissent une liste structurée de leurs composants internes. C'est une identification plus précise et plus fiable que l'User-Agent traditionnel."
        deduce="Si vous essayez de vous faire passer pour un autre navigateur en modifiant votre User-Agent, cette API peut trahir votre vraie identité de navigateur."
        tech-key="navigator.userAgentData.brands"
        :tech-val="br.clientHintBrands.value ?? 'null'"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="📐"
        title="Taille des barres d'outils"
        :value="`Δ ${br.chromeSizeW.value}×${br.chromeSizeH.value} px`"
        mean="En comparant la taille totale de la fenêtre avec la zone de page visible, on peut calculer exactement l'espace occupé par vos barres d'outils et la barre d'adresse."
        deduce="La hauteur de vos barres révèle vos extensions installées et votre configuration. C'est un détail qui vous distingue des autres utilisateurs."
        tech-key="outerWidth - innerWidth / outerHeight - innerHeight"
        :tech-val="`${br.chromeSizeW.value}px / ${br.chromeSizeH.value}px`"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="📄"
        title="Lecteur PDF natif"
        :value="br.pdfViewerEnabled.value === null ? 'Non disponible' : br.pdfViewerEnabled.value ? 'Intégré au navigateur' : 'Absent'"
        mean="navigator.pdfViewerEnabled indique si le navigateur peut afficher les PDF nativement, sans plugin externe."
        deduce="Contribue au profil navigateur. Un PDF viewer intégré signale Chrome/Edge récent, son absence peut indiquer Firefox ou une config minimale."
        tech-key="navigator.pdfViewerEnabled"
        :tech-val="String(br.pdfViewerEnabled.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🔏"
        title="Global Privacy Control"
        :value="br.globalPrivacyControl.value === null ? 'Non supporté' : br.globalPrivacyControl.value ? 'Activé (GPC=1)' : 'Désactivé'"
        mean="Le GPC est un signal de confidentialité standardisé envoyé aux sites pour demander la non-vente de vos données personnelles."
        deduce="Comme le DNT, il est ignoré par la majorité des sites. Sa présence peut paradoxalement vous rendre plus identifiable."
        tech-key="navigator.globalPrivacyControl"
        :tech-val="String(br.globalPrivacyControl.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📱"
        title="Mobile (Client Hints)"
        :value="br.clientHintMobile.value === null ? 'Non disponible' : br.clientHintMobile.value ? 'Oui — appareil mobile' : 'Non — desktop'"
        mean="L'API Client Hints expose un flag booléen indiquant si le navigateur est en mode mobile, plus fiable que la détection par UA."
        deduce="Distinction mobile/desktop sans ambiguïté, utile pour ciblage publicitaire et adaptation de contenu sans User-Agent classique."
        tech-key="navigator.userAgentData.mobile"
        :tech-val="String(br.clientHintMobile.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBrowser } from '../../composables/useBrowser'
import DataCardV2 from '../DataCardV2.vue'
const br = useBrowser()
</script>
