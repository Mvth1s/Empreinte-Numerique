<template>
  <section>
    <div class="tab-header">
      <div class="th-left">
        <span class="th-ico">🕐</span>
        <div>
          <h2>Fuseau horaire</h2>
          <p class="th-sub">L'heure de votre machine raconte où vous vivez.</p>
        </div>
      </div>
      <div>
        <span class="th-count">7<small>signaux</small></span>
      </div>
    </div>

    <div class="cards">
      <DataCardV2
        icon="🌍"
        title="Fuseau horaire"
        :value="tz.timezone.value"
        mean="Le fuseau horaire réglé sur votre appareil, nommé d'après une grande ville (Europe/Paris, America/Montreal…). Il se lit sans rien demander."
        deduce="Votre région du monde, même derrière un VPN : si le VPN dit « Japon » mais que votre fuseau dit « Paris », le site sait où vous êtes vraiment."
        tech-key="Intl.DateTimeFormat().resolvedOptions().timeZone"
        :tech-val="tz.timezone.value"
        severity="eleve"
        sev-label="élevé"
        :masked="tzMasked"
        :span="6"
      />
      <DataCardV2
        icon="📅"
        title="Décalage horaire"
        :value="tz.utcOffset.value"
        mean="Le nombre d'heures d'avance ou de retard de votre horloge sur l'heure mondiale de référence (UTC, l'heure de Londres en hiver)."
        deduce="Si votre adresse IP dit « France » mais que votre horloge est réglée sur New York, vous utilisez probablement un VPN."
        tech-key="new Date().getTimezoneOffset()"
        :tech-val="tz.utcOffset.value"
        severity="moyen"
        sev-label="moyen"
        :masked="tzMasked"
        :span="6"
      />
      <DataCardV2
        icon="🗓️"
        title="Heure locale"
        :value="tz.localTime.value"
        mean="L'heure affichée par votre appareil, lue à la seconde près, sans rien demander."
        deduce="Comparée à l'heure du pays de votre adresse IP, elle confirme où vous êtes. Une horloge en retard ou en avance de quelques minutes est même un détail qui vous distingue."
        tech-key="Intl.DateTimeFormat › HH:mm:ss"
        :tech-val="tz.localTime.value"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🌐"
        title="Réglages régionaux"
        :value="tz.locale.value"
        mean="Le couple langue + pays de votre appareil, par exemple fr-FR (français de France) ou fr-CA (français du Canada)."
        deduce="Votre pays d'origine probable, plus précisément que la langue seule : un Belge, un Suisse et un Québécois n'ont pas les mêmes réglages."
        tech-key="Intl.DateTimeFormat().resolvedOptions().locale"
        :tech-val="tz.locale.value"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🔆"
        title="Heure d'été"
        :value="tz.isDST.value ? 'Oui — heure d\'été active' : 'Non — heure standard'"
        mean="En comparant l'heure de votre appareil en hiver et en été, le site sait si votre pays change d'heure deux fois par an."
        deduce="Des pays à la même heure ne changent pas d'heure aux mêmes dates (ou pas du tout) : cela aide à affiner votre pays."
        tech-key="DST via getTimezoneOffset() comparaison"
        :tech-val="String(tz.isDST.value)"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="📊"
        title="Format de date"
        :value="tz.dateFormat.value"
        mean="La façon dont votre appareil écrit les dates, selon vos réglages régionaux."
        deduce="Jour/mois/année en France, mois/jour/année aux États-Unis : un indice de plus sur votre région."
        tech-key="Intl.DateTimeFormat(locale).format()"
        :tech-val="tz.dateFormat.value"
        severity="faible"
        sev-label="faible"
        :span="6"
      />
      <DataCardV2
        icon="💱"
        title="Format numérique"
        :value="tz.numberFormat.value"
        mean="La façon dont votre appareil écrit les grands nombres : espace ou point pour les milliers, virgule ou point pour les décimales."
        deduce="Distingue des régions qui parlent la même langue (France, Belgique, Suisse) et complète votre « portrait » régional."
        tech-key="Intl.NumberFormat(locale).format(1234567.89)"
        :tech-val="tz.numberFormat.value"
        severity="faible"
        sev-label="faible"
        :span="6"
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
import { useTimezone } from '../../composables/useTimezone'
import { useNetwork } from '../../composables/useNetwork'
import { isTimezoneSpoofed } from '../../composables/useProtection'
import DataCardV2 from '../DataCardV2.vue'
const tz = useTimezone()
const net = useNetwork()

// Firefox (anti-empreinte) et Tor forcent UTC : suspect si le pays de l'IP n'est pas à l'heure UTC.
const tzMasked = computed(() => isTimezoneSpoofed(tz.timezone.value, net.ipTimezone.value)
  ? `Votre navigateur annonce l'heure UTC alors que votre adresse IP est dans le fuseau ${net.ipTimezone.value} : il cache votre vrai fuseau.`
  : null)
</script>
