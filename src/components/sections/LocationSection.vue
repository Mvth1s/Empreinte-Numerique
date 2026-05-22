<template>
  <div class="wrap section-wrap">
    <SectionHeader index="11" title="Localisation sans GPS" />
    <div class="en-grid">
      <DataCard icon="🗺️" label="Position synthétisée" sectionIdx="section 11"
        :rows="[
          { k: 'POSITION', v: locationStr },
          { k: 'PRÉCISION', v: precision, cls: 'muted' },
          { k: 'SOURCES', v: signals, cls: 'muted' },
        ]"
        inference="Combinaison IP + timezone + langue. Précision : ville ou arrondissement. Obtenu <strong>sans une seule permission</strong>. La géo IP seule atteint ±20-50 km en milieu urbain."
        sensitivity="critical" :span="6" :loading="loading" />

      <div class="en-card col-6" ref="termCardRef">
        <div class="en-card-head">
          <div class="en-card-cat">
            <span style="font-size:16px;line-height:1;flex-shrink:0">💻</span>
            <div>
              <div class="en-card-name">Terminal de localisation</div>
              <div class="en-card-idx">// section 11</div>
            </div>
          </div>
          <span class="sev sev-eleve"><span class="dot"></span>ÉLEVÉ</span>
        </div>
        <div class="en-term">
          <div class="en-term-line">$ geoip --from ip <span style="color:var(--cyan)">{{ publicIP ?? '…' }}</span></div>
          <template v-if="!loading">
            <div class="en-term-line en-term-out">
              <span class="en-term-key">country</span>{{ country ?? 'N/A' }}
            </div>
            <div class="en-term-line en-term-out">
              <span class="en-term-key">city</span>{{ city ?? 'N/A' }} <span class="en-term-approx">± 30km</span>
            </div>
            <div class="en-term-line en-term-out">
              <span class="en-term-key">isp</span>{{ isp ?? 'N/A' }}
            </div>
            <div class="en-term-line en-term-out">
              <span class="en-term-key">timezone</span>{{ timezone }}
            </div>
            <div class="en-term-line en-term-out">
              <span class="en-term-key">locale</span>{{ locale }}
            </div>
          </template>
          <div v-else class="en-term-line">
            <span class="fp-caret"></span>
          </div>
        </div>
        <details class="en-deduce">
          <summary><span class="en-chev">▸</span>🔍 CE QU'ON EN DÉDUIT</summary>
          <div class="en-deduce-body">Sans GPS ni permission, la corrélation de signaux passifs permet de localiser tout utilisateur à <strong>l'échelle d'une ville</strong>. En milieu urbain dense, la précision peut descendre sous 5 km.</div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DataCard from '../DataCard.vue'
import SectionHeader from '../SectionHeader.vue'
import { useNetwork } from '../../composables/useNetwork'
import { useTimezone } from '../../composables/useTimezone'

const { publicIP, city, country, isp, loading } = useNetwork()
const { timezone, locale } = useTimezone()

const locationStr = computed(() => {
  if (loading.value) return null
  const parts = [city.value, country.value].filter(Boolean)
  return parts.length ? parts.join(' — ') : 'Localisation en cours…'
})

const precision = computed(() => {
  if (loading.value) return null
  if (city.value) return 'Ville identifiée (±20–50 km)'
  if (country.value) return 'Pays identifié (précision régionale)'
  return 'Pays approximatif'
})

const signals = computed(() => {
  const s: string[] = []
  if (publicIP.value) s.push('IP publique')
  if (timezone.value) s.push('Fuseau IANA')
  if (locale.value) s.push('Locale système')
  if (city.value) s.push('Géo IP')
  return s.length ? s.join(' + ') : null
})

const termCardRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const el = termCardRef.value
  if (!el) return
  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      const idx = [...document.querySelectorAll('.en-card')].indexOf(el)
      el.style.transition = `opacity .5s ${idx * 55}ms, transform .5s ${idx * 55}ms, border-color .2s, box-shadow .2s`
      el.classList.add('revealed')
      obs.disconnect()
    }
  }, { threshold: 0.05 })
  obs.observe(el)
})
</script>
