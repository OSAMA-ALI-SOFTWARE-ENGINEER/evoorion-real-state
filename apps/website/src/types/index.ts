export type PropertyMediaType = 'image' | 'video' | 'file'

export interface PropertyImage {
  id: number
  url: string
  is_primary: boolean
  sort_order?: number
  order?: number
  type?: PropertyMediaType
  caption?: string | null
  file_name?: string | null
}

export interface PropertyAmenity {
  id: number
  amenity: string
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
export type PropertyStatus = 'available' | 'sold' | 'rented'

export interface PropertySummary {
  id: number
  title: string
  slug: string
  type: PropertyType
  price: string
  previous_price?: string | null
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

export interface PropertyAgent {
  id: number
  name: string
  email: string
  phone?: string | null
  whatsapp?: string | null
  avatar_url?: string | null
  agency?: { id: number; name: string } | null
}

export interface PropertyRegion {
  id: number
  code: string
  name: string
  flag?: string | null
}

export interface Property extends PropertySummary {
  description: string
  developer?: PropertyDeveloper
  operation_type?: PropertyOperationType
  amenities: PropertyAmenity[]
  agent?: PropertyAgent | null
  region?: PropertyRegion | null
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
  company_website?: string
}

export type BudgetRange = 'under_1m' | '1m_3m' | '3m_5m' | '5m_10m' | 'above_10m'

// â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AuthUser {
  id: number
  name: string
  email: string
  role: string
  avatar_url?: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

// â”€â”€ Blog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BlogTag {
  id: number
  name: string
  slug: string
  posts_count?: number
}

export interface BlogPostSummary {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string
  reading_time: string | null
  view_count: number
  author: { id: number; name: string }
  tags: BlogTag[]
}

export interface BlogPost extends BlogPostSummary {
  content: string
  meta_title: string | null
  meta_description: string | null
  author: { id: number; name: string; avatar_url?: string | null }
}

export const BUDGET_RANGES: Record<BudgetRange, { label: string; min: number; max: number }> = {
  under_1m: { label: 'Under AED 1M', min: 0, max: 1_000_000 },
  '1m_3m': { label: 'AED 1M â€“ 3M', min: 1_000_000, max: 3_000_000 },
  '3m_5m': { label: 'AED 3M â€“ 5M', min: 3_000_000, max: 5_000_000 },
  '5m_10m': { label: 'AED 5M â€“ 10M', min: 5_000_000, max: 10_000_000 },
  above_10m: { label: 'AED 10M+', min: 10_000_000, max: 999_999_999 },
}

// â”€â”€ Master data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PriceRange {
  type: string
  min: number
  max: number
}

export interface Area {
  id: number
  name: string
  slug: string
  description?: string | null
  hero_image_url?: string | null
  latitude?: number | null
  longitude?: number | null
  long_term_roi?: string | null
  short_term_roi?: string | null
  appreciation?: string | null
  off_plan_discount?: string | null
  price_ranges?: PriceRange[] | null
  meta_title?: string | null
  meta_description?: string | null
}

export interface OperationType {
  id: number
  name: string
  slug: string
}

// â”€â”€ Comparison â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ComparisonResult {
  properties: Property[]
  summary: {
    cheapest: string
    most_bedrooms: string
    largest: string
  }
}

// ── Testimonials ─────────────────────────────────────────────────────────

export interface Testimonial {
  id: number
  author_name: string
  author_title?: string | null
  quote: string
  rating?: number | null
  avatar_url?: string | null
}

