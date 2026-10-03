export type Sensitivity = 'low' | 'medium' | 'high' | 'critical'

export interface DataItem {
  id: string
  icon: string
  label: string
  value: string | number | boolean | null | undefined
  inference: string
  sensitivity: Sensitivity
  loading?: boolean
}

export interface GeoData {
  ip: string
  country: string
  countryCode: string
  regionName: string
  city: string
  postal: string
  lat?: number
  lon?: number
  timezone: string
  isp: string
  org: string
  as: string
  proxy: boolean
  hosting: boolean
  /** true si le fournisseur renvoie réellement des indicateurs proxy/VPN */
  flagged: boolean
  status: string
}
