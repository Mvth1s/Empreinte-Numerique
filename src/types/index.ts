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
  lat?: number
  lon?: number
  isp: string
  org: string
  as: string
  proxy: boolean
  hosting: boolean
  status: string
}
