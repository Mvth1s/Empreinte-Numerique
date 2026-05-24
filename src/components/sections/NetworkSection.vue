<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🌐</span>
        <div>
          <h2>Réseau &amp; IP</h2>
          <p class="th-sub">Votre connexion vous trahit avant même que vous ne cliquiez.</p>
        </div>
      </div>
      <div>
        <span class="th-count">5<small>signaux</small></span>
      </div>
    </div>

    <div v-if="net.networkError.value" class="net-error">
      <span>⚠️</span>
      <span>Impossible de contacter les APIs de géolocalisation (ip-api.com / ipapi.co). Les données réseau ne sont pas disponibles — vérifiez votre connexion ou désactivez un bloqueur de requêtes.</span>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌍"
        title="Adresse IP publique"
        :value="net.publicIP.value ?? '…'"
        mean="C'est l'adresse qu'un serveur voit quand vous vous connectez. Elle identifie votre connexion internet et votre localisation à la ville près."
        deduce="Localisation géographique approximative, identification du FAI, corrélation entre visites, blocage géographique de contenu."
        tech-key="api.ipify.org"
        :tech-val="net.publicIP.value ?? '…'"
        severity="critique"
        sev-label="critique"
        :loading="net.loading.value"
        :span="12"
      />
      <DataCardV2
        icon="🏢"
        title="Fournisseur d'accès (FAI)"
        :value="net.isp.value ?? '…'"
        mean="Le FAI est l'entreprise qui fournit votre connexion internet. Il est directement lié à votre IP."
        deduce="Type de connexion (résidentiel, entreprise, VPN), pays d'origine, profil socio-économique approximatif."
        tech-key="ipwho.is › connection.isp"
        :tech-val="net.isp.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🔢"
        title="ASN (Système autonome)"
        :value="net.asn.value ?? '…'"
        mean="L'ASN identifie le réseau autonome propriétaire de votre bloc d'adresses IP."
        deduce="Permet de savoir si vous utilisez un VPN commercial, un proxy, un réseau d'entreprise ou résidentiel."
        tech-key="ipwho.is › connection.asn"
        :tech-val="net.asn.value ?? '—'"
        severity="moyen"
        sev-label="moyen"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="⚠️"
        title="Proxy / VPN détecté"
        :value="net.isVPN.value ? 'Oui — VPN/Proxy probable' : 'Non détecté'"
        mean="Les services de géo-IP signalent si votre IP appartient à un hébergeur, un VPN connu ou un proxy."
        deduce="Certains services bloquent les connexions VPN. Votre anonymat peut être partiellement compromis."
        tech-key="ipwho.is › security.vpn + proxy + tor"
        :tech-val="net.isVPN.value ? 'true' : 'false'"
        severity="faible"
        sev-label="faible"
        :loading="net.loading.value"
        :span="4"
      />
      <DataCardV2
        icon="🔓"
        title="IPs locales (fuite WebRTC)"
        :value="net.localIPs.value.length ? net.localIPs.value.join(', ') : 'Aucune détectée'"
        mean="WebRTC peut exposer vos IPs locales (LAN, Wi-Fi) même derrière un VPN via le protocole ICE/STUN."
        deduce="Révèle votre réseau local, contourne l'anonymat VPN, permet de vous identifier sur le réseau de l'entreprise."
        tech-key="RTCPeerConnection › ICE candidates"
        :tech-val="net.webrtcLeak.value ?? 'aucune'"
        severity="critique"
        sev-label="critique"
        :loading="net.loading.value"
        :span="12"
      />
    </div>

    <div class="tab-foot">
      <span class="tf-key">⚠️</span>
      <span>Toutes ces données ont été obtenues <strong>sans aucune permission</strong> de votre part.</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useNetwork } from '../../composables/useNetwork'
import DataCardV2 from '../DataCardV2.vue'
const net = useNetwork()
</script>
