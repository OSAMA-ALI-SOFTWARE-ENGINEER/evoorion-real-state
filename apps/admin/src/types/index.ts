export type UserRole = 'super_admin' | 'manager' | 'agent'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  avatar_url?: string | null
  is_active: boolean
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  leads: {
    total: number
    unassigned: number
    this_month: number
    last_month: number
    by_status: Record<string, number>
    by_source: Record<string, number>
  }
  agents: {
    total: number
    active: number
  }
  properties: {
    total: number
    available: number
    featured: number
  }
}

export interface AgentPerformance {
  id: number
  name: string
  email: string
  properties: number
  leads_total: number
  leads_closed: number
  close_rate: number
}

export interface RegionBreakdown {
  region: Pick<Region, 'id' | 'code' | 'name' | 'flag'>
  properties_count: number
  leads_count: number
}

// ── Properties ────────────────────────────────────────────────────────────────

export type PropertyType   = 'villa' | 'apartment' | 'penthouse' | 'townhouse' | 'commercial'
export type PropertyStatus = 'available' | 'sold' | 'rented'

export type AreaStatus = 'active' | 'inactive'

export interface AreaMediaItem {
  url: string
  type: 'image' | 'video' | 'file'
  caption?: string
  order?: number
  is_primary?: boolean
  file_name?: string
}

export interface Area {
  id: number
  name: string
  slug: string
  status?: AreaStatus
  description?: string | null
  hero_image_url?: string | null
  gallery?: AreaMediaItem[] | null
  latitude?: number | null
  longitude?: number | null
  long_term_roi?: number | null
  short_term_roi?: number | null
  appreciation?: number | null
  off_plan_discount?: number | null
  price_ranges?: PriceRange[] | null
  meta_title?: string | null
  meta_description?: string | null
  region_id?: number | null
  region?: Region | null
}

export interface PriceRange {
  type: string
  min: number
  max: number
}

// ── Currencies / Languages ─────────────────────────────────────────────────────

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  is_active: boolean
  is_default: boolean
  sort_order: number
}

export interface Language {
  id: number
  code: string
  name: string
  native_name: string
  direction: 'ltr' | 'rtl'
  is_active: boolean
  is_default: boolean
  sort_order: number
}

export interface Region {
  id: number
  code: string
  name: string
  flag: string | null
  is_active: boolean
  sort_order: number
}

export interface Developer {
  id: number
  name: string
  slug: string
  email?: string | null
  logo_url?: string
  region_id?: number | null
  region?: Region | null
}

export interface OperationType {
  id: number
  name: string
  slug: string
}

export interface PropertyImage {
  id: number
  url: string
  is_primary: boolean
  order: number
}

export interface PropertyAmenity {
  id: number
  amenity: string
}

export interface Property {
  id: number
  slug: string
  title: string
  description?: string
  type: PropertyType
  status: PropertyStatus
  price: string | number
  currency?: string
  location?: string
  area_sqft?: string | number | null
  bedrooms?: number | null
  bathrooms?: number | null
  is_featured: boolean
  is_active: boolean
  roi_min?: string | number | null
  roi_max?: string | number | null
  views_count: number
  area_id?: number
  developer_id?: number
  operation_type_id?: number
  region_id?: number
  region?: Region | null
  primary_agent_id?: number | null
  meta_title?: string | null
  meta_description?: string | null
  area?: Area
  developer?: Developer
  operation_type?: OperationType
  images?: PropertyImage[]
  amenities?: PropertyAmenity[]
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost'
export type LeadSource = 'website' | 'instagram' | 'facebook' | 'whatsapp' | 'referral' | 'other'

export interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  whatsapp?: string
  status: LeadStatus
  source: LeadSource
  budget_min?: number | null
  budget_max?: number | null
  message?: string
  assigned_to?: number | null
  property_id?: number | null
  property?: Pick<Property, 'id' | 'slug' | 'title' | 'type' | 'status' | 'price' | 'currency' | 'bedrooms' | 'bathrooms' | 'location' | 'area_sqft'> & { images?: PropertyImage[]; area?: Area; region?: Region | null }
  assigned_user?: Pick<AuthUser, 'id' | 'name' | 'email'>
  created_at: string
  updated_at: string
}

export interface LeadNote {
  id: number
  note: string
  user_id: number
  user?: Pick<AuthUser, 'id' | 'name'>
  created_at: string
}

export interface LeadTask {
  id: number
  lead_id: number
  title: string
  notes?: string | null
  due_date?: string | null
  completed: boolean
  completed_at?: string | null
  created_at: string
  user?: Pick<AuthUser, 'id' | 'name'>
}

// ── Agencies / Agents ─────────────────────────────────────────────────────────

export interface Agency {
  id: number
  name: string
  logo_url?: string | null
  contact_email?: string | null
  phone?: string | null
  address?: string | null
  agents_count?: number
  region_id?: number | null
  region?: Region | null
  created_at: string
}

export interface Agent {
  id: number
  user_id: number
  agency_id?: number | null
  phone?: string | null
  whatsapp?: string | null
  avatar_url?: string | null
  user?: AuthUser
  agency?: Agency
  deleted_at?: string | null
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  is_active: boolean
  deleted_at?: string | null
  created_at: string
  region_id?: number | null
  region?: Region | null
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export type BlogStatus = 'draft' | 'published' | 'pending' | 'archived'

export interface BlogTag {
  id: number
  name: string
  slug: string
  posts_count?: number
}

export interface BlogPost {
  id: number
  author_id: number
  title: string
  slug: string
  excerpt?: string
  content?: string
  featured_image_url?: string
  status: BlogStatus
  published_at?: string | null
  meta_title?: string | null
  meta_description?: string | null
  view_count: number
  reading_time?: number | null
  region_id?: number | null
  region?: Region | null
  author?: Pick<AuthUser, 'id' | 'name'>
  tags?: BlogTag[]
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

// ── API helpers ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message?: string
  meta?: {
    pagination: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
}

export interface Notification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
  created_at: string
}

// ── Media ─────────────────────────────────────────────────────────────────────

export interface MediaFile {
  id: number
  name: string
  url: string
  public_id: string
  mime_type?: string | null
  folder: string
  size?: number | null
  uploaded_by?: number | null
  uploader?: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

// ── CMS ───────────────────────────────────────────────────────────────────────

export interface CmsSection {
  id: number
  page_slug: string
  section_key: string
  content: unknown
  created_at: string
  updated_at: string
}
