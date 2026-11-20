<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🖥️</span>
        <div>
          <h2>Navigateur &amp; système</h2>
          <p class="th-sub">Chaque visite envoie une carte d'identité technique très bavarde.</p>
        </div>
      </div>
      <div>
        <span class="th-count">13<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🖥️"
        title="Système d'exploitation"
        :value="br.architecture.value ? `${br.detectedOS.value} · ${br.architecture.value}` : br.detectedOS.value"
        :mean="br.osSource.value === 'ua-ch'
          ? 'Votre navigateur annonce une « carte d\'identité » simplifiée (Windows 11 s\'y présente comme Windows 10), mais il donne la vraie version au site qui la demande, avec le type de processeur et même le modèle de téléphone.'
          : 'Votre navigateur annonce votre système (Windows, macOS, Android…) à chaque page visitée. Cette annonce est volontairement simplifiée : la version exacte peut y manquer.'"
        deduce="Savoir quel système et quelle version vous utilisez permet de vous proposer du contenu adapté, mais aussi de viser des failles de sécurité connues sur un système pas à jour."
        :tech-key="br.osSource.value === 'ua-ch' ? 'userAgentData.getHighEntropyValues()' : 'navigator.userAgent › OS'"
        :tech-val="br.deviceModel.value ? `${br.detectedOS.value} (${br.deviceModel.value})` : br.detectedOS.value"
        severity="moyen"
        sev-label="moyen"
        :masked="osMasked"
        :span="6"
      />
      <DataCardV2
        icon="🌐"
        title="Navigateur"
        :value="br.detectedBrowser.value"
        :mean="br.isBrave.value
          ? 'Brave se présente comme Chrome pour passer inaperçu, mais il laisse une petite trace qui permet de le reconnaître immédiatement.'
          : 'Le nom et la version exacte de votre navigateur sont donnés à chaque site, sans rien demander.'"
        deduce="Un navigateur pas à jour signale des failles exploitables. Le choix du navigateur en dit aussi un peu sur vous (Brave ou Firefox : plutôt soucieux de sa vie privée)."
        :tech-key="br.osSource.value === 'ua-ch' ? 'userAgentData › fullVersionList' : 'navigator.userAgent › Browser'"
        :tech-val="br.detectedBrowser.value"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="🗣️"
        title="Langue principale"
        :value="br.language.value"
        mean="La langue dans laquelle vous préférez lire, réglée dans votre navigateur. Elle est envoyée automatiquement à chaque site."
        deduce="Votre pays ou votre région d'origine probable, même si vous êtes en voyage ou derrière un VPN."
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
        mean="Toutes les langues que vous avez ajoutées dans votre navigateur, de la préférée à la moins utilisée."
        deduce="Une combinaison peu courante (par exemple français + portugais + allemand) suffit presque à vous distinguer des autres visiteurs."
        tech-key="navigator.languages"
        :tech-val="br.languages.value.join(', ')"
        severity="moyen"
        sev-label="moyen"
        :masked="langMasked"
        :span="4"
      />
      <DataCardV2
        icon="💻"
        title="Plateforme déclarée"
        :value="br.platform.value"
        mean="Le type d'appareil que votre navigateur dit utiliser (Windows, Mac, Linux, Android…), en un seul mot."
        deduce="Un indice de plus pour reconnaître votre appareil. S'il ne correspond pas au reste, le site devine que vous maquillez votre navigateur."
        :tech-key="br.clientHintPlatform.value ? 'navigator.userAgentData.platform' : 'navigator.platform'"
        :tech-val="br.platform.value"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🛡️"
        title="Do Not Track"
        :value="br.doNotTrack.value === '1' ? 'Activé' : 'Désactivé'"
        mean="« Ne pas me pister » : une case à cocher dans le navigateur qui demande poliment aux sites de ne pas vous suivre."
        deduce="Presque tous les sites l'ignorent, et peu de gens l'activent : l'avoir coché peut même vous rendre un peu plus reconnaissable."
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
        mean="Les cookies sont de petits fichiers qu'un site dépose dans votre navigateur pour se souvenir de vous (connexion, panier, préférences…)."
        deduce="Activés, ils permettent de vous reconnaître d'une visite à l'autre, et aux publicitaires de vous suivre de site en site pendant des mois."
        tech-key="navigator.cookieEnabled"
        :tech-val="String(br.cookiesEnabled.value)"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🤖"
        title="Robot ou humain ?"
        :value="br.headless.value ? 'Probable — Bot détecté' : 'Navigation humaine'"
        mean="Le site vérifie si une vraie personne navigue, ou si le navigateur est piloté par un programme automatique (robot)."
        deduce="Pris pour un robot, vous risquez des pages bloquées, des « Je ne suis pas un robot » à répétition, voire un bannissement automatique."
        tech-key="navigator.webdriver + heuristiques"
        :tech-val="String(br.headless.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🔬"
        title="Composants du navigateur"
        :value="br.clientHintBrands.value ?? 'Non supporté (Firefox/Safari)'"
        mean="Chrome, Edge, Brave ou Opera donnent la liste des briques qui les composent, avec leurs versions (« Client Hints »). C'est plus précis que leur carte d'identité classique."
        deduce="Si vous essayez de vous faire passer pour un autre navigateur, cette liste peut trahir votre vrai navigateur."
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
        mean="En comparant la taille de la fenêtre et celle de la page visible, le site calcule la place prise par vos barres d'outils et votre barre d'adresse."
        deduce="Ces quelques pixels dépendent de vos réglages (barre de favoris, extensions, zoom) : un petit détail de plus qui vous distingue."
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
        mean="Indique si votre navigateur sait ouvrir les fichiers PDF tout seul, sans logiciel en plus."
        deduce="Presque tous les navigateurs récents le savent : une réponse « non » est rare et vous rend plus facile à repérer."
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
        mean="Global Privacy Control : un signal envoyé aux sites pour dire « ne vendez pas et ne partagez pas mes données »."
        deduce="Il a une valeur légale dans certains pays (Californie, par exemple), mais la plupart des sites l'ignorent encore. Comme peu de gens l'activent, il vous distingue un peu."
        tech-key="navigator.globalPrivacyControl"
        :tech-val="String(br.globalPrivacyControl.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📱"
        title="Téléphone ou ordinateur ?"
        :value="br.clientHintMobile.value === null ? 'Non disponible' : br.clientHintMobile.value ? 'Oui — appareil mobile' : 'Non — desktop'"
        mean="Votre navigateur dit directement au site si vous êtes sur un téléphone ou sur un ordinateur."
        deduce="Utile pour adapter la page, mais aussi pour cibler les publicités : on ne vous montre pas la même chose sur téléphone et sur ordinateur."
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
import { computed } from 'vue'
import { useBrowser } from '../../composables/useBrowser'
import { useProtection } from '../../composables/useProtection'
import DataCardV2 from '../DataCardV2.vue'
const br = useBrowser()
const prot = useProtection()

const osMasked = computed(() => {
  if (prot.firefoxResist.value) return 'Firefox (mode anti-empreinte) ou Tor Browser annoncent un système passe-partout, souvent Windows, quel que soit le vôtre.'
  if (br.osSource.value === 'ua' && br.uaFrozen.value) return 'La version annoncée est figée et ne dit pas la vraie : le site ne connaît que la famille de système.'
  return null
})
// Firefox anti-empreinte et Tor annoncent toujours l'anglais américain.
const langMasked = computed(() => prot.firefoxResist.value && br.languages.value.join() === 'en-US'
  ? 'Votre navigateur annonce l\'anglais américain à tous les sites, quelle que soit votre vraie langue.'
  : null)
</script>
