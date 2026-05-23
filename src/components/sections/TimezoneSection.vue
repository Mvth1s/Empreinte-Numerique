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
        mean="Le décalage UTC est calculé depuis Date.getTimezoneOffset(). Il peut se recouper avec le fuseau IANA."
        deduce="Confirme la zone géographique, détecte les incohérences entre fuseau déclaré et offset réel (VPN)."
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
        mean="Le statut DST est déduit en comparant l'offset actuel aux offsets de janvier et juillet."
        deduce="Réduit l'ambiguïté entre fuseaux partageant le même décalage UTC, affine la localisation géographique."
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
