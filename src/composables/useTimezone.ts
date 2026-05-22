import { ref } from 'vue'

export function useTimezone() {
  const tz = Intl.DateTimeFormat().resolvedOptions()
  const timezone = ref(tz.timeZone)
  const locale = ref(tz.locale || navigator.language)

  const now = new Date()
  const offsetMin = -now.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const h = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0')
  const m = String(Math.abs(offsetMin) % 60).padStart(2, '0')
  const utcOffset = ref(`UTC${sign}${h}:${m}`)

  const jan = new Date(now.getFullYear(), 0, 1)
  const jul = new Date(now.getFullYear(), 6, 1)
  const isDST = ref(now.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()))

  const localTime = ref(
    new Intl.DateTimeFormat(locale.value, {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(now)
  )

  const dateFormat = ref(
    new Intl.DateTimeFormat(locale.value).format(now)
  )

  const numberFormat = ref(
    new Intl.NumberFormat(locale.value).format(1234567.89)
  )

  return { timezone, locale, utcOffset, isDST, localTime, dateFormat, numberFormat }
}
