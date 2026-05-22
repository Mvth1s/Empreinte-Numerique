<template>
  <div class="wrap section-wrap">
    <SectionHeader index="03" title="Fuseau horaire & Locale" />
    <div class="en-grid">
      <DataCard icon="🕐" label="Fuseau & Locale" sectionIdx="section 03"
        :rows="[
          { k: 'FUSEAU_IANA', v: timezone },
          { k: 'LOCALE', v: locale },
          { k: 'OFFSET_UTC', v: utcOffset },
          { k: 'HEURE_LOCALE', v: localTime },
          { k: 'DST_ACTIF', v: isDST ? 'OUI (heure d\'été)' : 'Non (heure standard)' },
        ]"
        inference="Votre fuseau confirme la cohérence de l'IP. Une <strong>incohérence trahirait l'usage d'un VPN</strong>. La locale fr-FR ≠ fr-CA ≠ fr-BE révèle langue ET pays probable."
        sensitivity="high" :span="4" />

      <DataCard icon="🔢" label="Formats système" sectionIdx="section 03"
        :rows="[
          { k: 'FORMAT_DATE', v: dateFormat },
          { k: 'FORMAT_NOMBRE', v: numberFormat },
        ]"
        inference="DD/MM/YYYY vs MM/DD/YYYY vs YYYY-MM-DD. 1.234,56 (Europe) vs 1,234.56 (USA). Ces formats varient selon l'OS et les préférences système — <strong>indépendamment de l'User-Agent</strong>."
        sensitivity="medium" :span="4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useTimezone } from '../../composables/useTimezone'

const { timezone, locale, utcOffset, isDST, localTime, dateFormat, numberFormat } = useTimezone()
</script>
