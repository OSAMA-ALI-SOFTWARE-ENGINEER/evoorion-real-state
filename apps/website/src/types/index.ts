export interface PropertyImage {
  id: number
  url: string
  is_primary: boolean
  sort_order?: number
}

export interface PropertyAmenity {
  id: number
  name: string
}

export interface PropertyArea {
  id: number
  name: string
}

export interface PropertyDeveloper {
  id: number
  name: string
}

export interface PropertyOperationType {
  id: number
  name: string
}

export type PropertyType = 'villa' | 'apartment' | 'penthouse' | 'townhouse' | 'commercial'
export type PropertyStatus = 'available' | 'sold' | 'off_plan'

export interface PropertySummary {
  id: number
  title: string
  slug: string
  type: PropertyType
  price: string
  currency: string
  bedrooms: number
  bathrooms: number
  area_sqft: string
  status: PropertyStatus
  is_featured: boolean
  roi_min?: string
  roi_max?: string
  views_count: number
  location?: string
  area?: PropertyArea
  images?: PropertyImage[]
  created_at: string
}

export interface Property extends PropertySummary {
  description: string
  developer?: PropertyDeveloper
  operation_type?: PropertyOperationType
  amenities: PropertyAmenity[]
  meta_title?: string
  meta_description?: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  meta: Record<string, unknown>
}

export interface PaginationMeta {
  current_page: number
  total: number
  per_page: number
  last_page: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message: string
  meta: {
    pagination: PaginationMeta
  }
}

export interface LeadPayload {
  name: string
  email: string
  phone?: string
  whatsapp?: string
  property_id?: number
  budget_min?: number
  budget_max?: number
  message?: string
  source: 'website' | 'instagram' | 'facebook' | 'whatsapp' | 'referral' | 'other'
}

export type BudgetRange = 'under_1m' | '1m_3m' | '3m_5m' | '5m_10m' | 'above_10m'

export const BUDGET_RANGES: Record<BudgetRange, { label: string; min: number; max: number }> = {
  under_1m: { label: 'Under AED 1M', min: 0, max: 1_000_000 },
  '1m_3m': { label: 'AED 1M – 3M', min: 1_000_000, max: 3_000_000 },
  '3m_5m': { label: 'AED 3M – 5M', min: 3_000_000, max: 5_000_000 },
  '5m_10m': { label: 'AED 5M – 10M', min: 5_000_000, max: 10_000_000 },
  above_10m: { label: 'AED 10M+', min: 10_000_000, max: 999_999_999 },
}
