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

// ── Properties ────────────────────────────────────────────────────────────────

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'off_market'

export interface Area {
  id: number
  name: string
  slug: string
  description?: string
}

export interface Developer {
  id: number
  name: string
  slug: string
  logo_url?: string
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
  status: PropertyStatus
  price: number
  bedrooms?: number
  bathrooms?: number
  area_sqft?: number
  floor?: number
  total_floors?: number
  is_featured: boolean
  views_count: number
  area?: Area
  developer?: Developer
  operation_type?: OperationType
  images?: PropertyImage[]
  amenities?: PropertyAmenity[]
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
  budget_min?: number
  budget_max?: number
  message?: string
  assigned_to?: number
  property_id?: number
  property?: Pick<Property, 'id' | 'slug' | 'title'>
  assignee?: Pick<AuthUser, 'id' | 'name' | 'email'>
  created_at: string
  updated_at: string
}

export interface LeadNote {
  id: number
  note: string
  created_by: number
  author?: Pick<AuthUser, 'id' | 'name'>
  created_at: string
}

export interface LeadTask {
  id: number
  lead_id: number
  title: string
  due_date?: string
  completed: boolean
  completed_at?: string
  created_at: string
}

// ── Agencies / Agents ─────────────────────────────────────────────────────────

export interface Agency {
  id: number
  name: string
  contact_email?: string
  contact_phone?: string
  address?: string
  created_at: string
}

export interface Agent {
  id: number
  user_id: number
  agency_id?: number
  specialisation?: string
  bio?: string
  user?: AuthUser
  agency?: Agency
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export type BlogStatus = 'draft' | 'published'

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
  published_at?: string
  meta_title?: string
  meta_description?: string
  view_count: number
  reading_time?: number
  author?: Pick<AuthUser, 'id' | 'name'>
  tags?: BlogTag[]
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
