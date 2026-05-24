export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
      { headers: { 'Accept-Language': 'fr' } }
    )
    const d = await res.json()
    const a = d.address ?? {}
    const city = a.city || a.town || a.village || a.suburb || a.municipality || null
    const postcode = a.postcode ? ` (${a.postcode})` : ''
    return city ? city + postcode : null
  } catch { return null }
}
