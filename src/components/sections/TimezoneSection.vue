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
        title="Fuseau horaire IANA"
        :value="tz.timezone.value"
        mean="Le fuseau IANA est lu depuis l'API Intl du navigateur. Il identifie votre localisation avec une précision de ville."
        deduce="Localisation géographique précise (Paris = Europe occidentale), vérification avec l'IP pour détecter les VPN."
        tech-key="Intl.DateTimeFormat().resolvedOptions().timeZone"
        :tech-val="tz.timezone.value"
        severity="eleve"
        sev-label="élevé"
        :span="6"
      />
      <DataCardV2
        icon="📅"
        title="Décalage UTC"
        :value="tz.utcOffset.value"
        mean="UTC est l'heure mondiale de référence. Votre décalage indique de combien d'heures vous êtes en avance ou en retard sur cette heure universelle — comme le méridien de Greenwich."
        deduce="Si votre IP dit que vous êtes en France mais que votre décalage correspond à New York, on sait que vous utilisez probablement un VPN."
        tech-key="new Date().getTimezoneOffset()"
        :tech-val="tz.utcOffset.value"
        severity="moyen"
        sev-label="moyen"
        :span="6"
      />
      <DataCardV2
        icon="🗓️"
        title="Heure locale"
        :value="tz.localTime.value"
        mean="L'heure locale est calculée côté client via l'API Date, sans aucune permission."
        deduce="Croisée avec l'IP, elle permet de vérifier si votre localisation est cohérente ou si vous utilisez un VPN distant."
        tech-key="Intl.DateTimeFormat › HH:mm:ss"
        :tech-val="tz.localTime.value"
        severity="faible"
        sev-label="faible"
        :span="4"
      />
      <DataCardV2
        icon="🌐"
        title="Locale système"
        :value="tz.locale.value"
        mean="La locale (ex: fr-FR) est la combinaison langue-région configurée dans votre OS ou navigateur."
        deduce="Identification de la nationalité et région culturelle, croisement avec la langue du navigateur pour profilage précis."
        tech-key="Intl.DateTimeFormat().resolvedOptions().locale"
        :tech-val="tz.locale.value"
        severity="moyen"
        sev-label="moyen"
        :span="4"
      />
      <DataCardV2
        icon="🔆"
        title="Heure d'été (DST)"
        :value="tz.isDST.value ? 'Oui — heure d\'été active' : 'Non — heure standard'"
        mean="En comparant l'heure de votre ordinateur en été et en hiver, le navigateur détecte automatiquement si votre pays applique le changement d'heure — et lequel."
        deduce="Plusieurs pays ont le même décalage UTC mais pas les mêmes règles d'heure d'été. Cela permet d'affiner votre localisation géographique."
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
        mean="Le format de date affiché est généré par Intl.DateTimeFormat selon votre locale."
        deduce="Révèle la convention régionale (JJ/MM/AAAA vs MM/DD/YYYY), utilisé dans le fingerprinting culturel."
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
        mean="Le format des nombres (séparateur décimal, milliers) est dicté par la locale du système."
        deduce="Distingue les configurations linguistiques similaires (ex: fr-FR vs fr-BE), fingerprinting de la locale précise."
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
import { useTimezone } from '../../composables/useTimezone'
import DataCardV2 from '../DataCardV2.vue'
const tz = useTimezone()
</script>
