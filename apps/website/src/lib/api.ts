import axios from 'axios'
import type {
  ApiResponse,
  Area,
  AuthUser,
  BlogPost,
  BlogPostSummary,
  BlogTag,
  ComparisonResult,
  LeadPayload,
  LoginPayload,
  OperationType,
  PaginatedResponse,
  Property,
  PropertySummary,
  RegisterPayload,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15_000,
})

// Attach bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('evoorion_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const SOCIAL_AUTH_URL = (provider: 'google' | 'facebook') =>
  `${BASE_URL}/auth/social/${provider}/redirect`

export interface PropertyFilters {
  type?: string
  featured?: boolean
  search?: string
  area_id?: number
  operation_type_id?: number
  min_price?: number
  max_price?: number
  min_area_sqft?: number
  max_area_sqft?: number
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
  per_page?: number
  page?: number
  region?: string
}

export interface FavoritesResponse {
  success: boolean
  data: PropertySummary[]
  meta: { total: number; per_page: number; current_page: number; last_page: number }
}

export async function getProperties(
  filters: PropertyFilters = {},
): Promise<PaginatedResponse<PropertySummary>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  )
  const res = await api.get<PaginatedResponse<PropertySummary>>('/properties', { params })
  return res.data
}

export async function getProperty(slug: string): Promise<ApiResponse<Property>> {
  const res = await api.get<ApiResponse<Property>>(`/properties/${slug}`)
  return res.data
}

export async function submitLead(payload: LeadPayload): Promise<ApiResponse<unknown>> {
  const res = await api.post<ApiResponse<unknown>>('/leads', payload)
  return res.data
}

// â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function loginUser(
  payload: LoginPayload,
): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
  const res = await api.post<ApiResponse<{ user: AuthUser; token: string }>>('/auth/login', payload)
  return res.data
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<ApiResponse<{ user: AuthUser; token: string }>> {
  const res = await api.post<ApiResponse<{ user: AuthUser; token: string }>>('/auth/register', payload)
  return res.data
}

export async function logoutUser(): Promise<void> {
  await api.post('/auth/logout')
}

export async function getMe(): Promise<ApiResponse<AuthUser>> {
  const res = await api.get<ApiResponse<AuthUser>>('/auth/me')
  return res.data
}

// â”€â”€ Blog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface BlogFilters {
  tag?: string
  search?: string
  per_page?: number
  page?: number
  region?: string
}

export interface RegionRecord {
  id: number
  code: string
  name: string
  flag: string
}

export async function getRegions(): Promise<ApiResponse<RegionRecord[]>> {
  const res = await api.get<ApiResponse<RegionRecord[]>>('/regions')
  return res.data
}

export async function getBlogPosts(
  filters: BlogFilters = {},
): Promise<PaginatedResponse<BlogPostSummary>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  )
  const res = await api.get<PaginatedResponse<BlogPostSummary>>('/blog', { params })
  return res.data
}

export async function getBlogPost(
  slug: string,
): Promise<ApiResponse<{ post: BlogPost; related: BlogPostSummary[] }>> {
  const res = await api.get<ApiResponse<{ post: BlogPost; related: BlogPostSummary[] }>>(`/blog/${slug}`)
  return res.data
}

export async function getBlogTags(): Promise<ApiResponse<BlogTag[]>> {
  const res = await api.get<ApiResponse<BlogTag[]>>('/blog/tags')
  return res.data
}

// â”€â”€ Master data (public) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getAreas(): Promise<ApiResponse<Area[]>> {
  const res = await api.get<ApiResponse<Area[]>>('/areas')
  return res.data
}

export async function getArea(slug: string): Promise<ApiResponse<Area>> {
  const res = await api.get<ApiResponse<Area>>(`/areas/${slug}`)
  return res.data
}

export async function getOperationTypes(): Promise<ApiResponse<OperationType[]>> {
  const res = await api.get<ApiResponse<OperationType[]>>('/operation-types')
  return res.data
}

// â”€â”€ Comparison â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function compareProperties(slugs: string[]): Promise<ApiResponse<ComparisonResult>> {
  const res = await api.post<ApiResponse<ComparisonResult>>('/properties/compare', { slugs })
  return res.data
}

// â”€â”€ Favorites â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getFavorites(): Promise<FavoritesResponse> {
  const res = await api.get<FavoritesResponse>('/favorites')
  return res.data
}

export async function addFavorite(propertySlug: string): Promise<ApiResponse<null>> {
  const res = await api.post<ApiResponse<null>>(`/favorites/${propertySlug}`)
  return res.data
}

export async function removeFavorite(propertySlug: string): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/favorites/${propertySlug}`)
  return res.data
}

// â”€â”€ Saved Searches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SavedSearch {
  id: number
  name: string
  filters: Record<string, unknown>
  created_at: string
}

export async function getSavedSearches(): Promise<ApiResponse<SavedSearch[]>> {
  const res = await api.get<ApiResponse<SavedSearch[]>>('/saved-searches')
  return res.data
}

export async function createSavedSearch(name: string, filters: Record<string, unknown>): Promise<ApiResponse<SavedSearch>> {
  const res = await api.post<ApiResponse<SavedSearch>>('/saved-searches', { name, filters })
  return res.data
}

export async function deleteSavedSearch(id: number): Promise<ApiResponse<null>> {
  const res = await api.delete<ApiResponse<null>>(`/saved-searches/${id}`)
  return res.data
}

// â”€â”€ Public settings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PublicSettings {
  color_brand?:         string | null
  color_brand_section?: string | null
  color_gold?:          string | null
  color_gold_light?:    string | null
  color_muted?:         string | null
  image_hero?:          string | null
  image_cta?:           string | null
  image_why_dubai?:     string | null
  trust_strip_label?:   string | null
  trust_strip_speed?:   string | null
  partners_list?:       string | null
  // Section backgrounds (JSON blobs parsed by parseSectionBg)
  section_bg_what_we_do?:             string | null
  section_bg_our_process?:            string | null
  section_bg_trust_strip?:            string | null
  section_bg_hero_about?:             string | null
  section_bg_hero_contact?:           string | null
  section_bg_hero_investments?:       string | null
  section_bg_hero_properties?:        string | null
  section_bg_hero_blog?:              string | null
  section_bg_hero_locations?:         string | null
  section_bg_about_difference?:       string | null
  section_bg_about_cta?:              string | null
  section_bg_investments_strategies?: string | null
  [key: string]:                      string | null | undefined
}

export async function getPublicSettings(): Promise<PublicSettings> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  try {
    const res = await fetch(`${apiUrl}/settings`, { next: { revalidate: 60 } })
    if (!res.ok) return {}
    const json = await res.json()
    return (json?.data as PublicSettings) ?? {}
  } catch {
    return {}
  }
}

// â”€â”€ CMS (public) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getCmsContent(slug: string): Promise<Record<string, unknown>> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  try {
    const res = await fetch(`${apiUrl}/pages/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return {}
    const json = await res.json()
    return (json?.data?.content as Record<string, unknown>) ?? {}
  } catch {
    return {}
  }
}

// â”€â”€ Currencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ApiCurrency {
  id:            number
  code:          string
  name:          string
  symbol:        string
  exchange_rate: number
  is_active:     boolean
  is_default:    boolean
  sort_order:    number
}

export async function getCurrencies(): Promise<ApiResponse<ApiCurrency[]>> {
  const res = await api.get<ApiResponse<ApiCurrency[]>>('/currencies')
  return res.data
}

// â”€â”€ Agents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PublicAgent {
  id: number
  name: string
  email: string
  phone?: string
  whatsapp?: string
  avatar_url?: string | null
  agency?: { id: number; name: string } | null
  listings: number
}

export async function getAgents(): Promise<PublicAgent[]> {
  const res = await api.get<ApiResponse<PublicAgent[]>>('/agents')
  return res.data.data
}

// â”€â”€ Jobs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface JobListing {
  id: number
  title: string
  department: string
  location: string
  type: 'full_time' | 'part_time' | 'contract' | 'internship'
  description: string
  requirements?: string
  created_at: string
}

export async function getJobs(): Promise<JobListing[]> {
  const res = await api.get<ApiResponse<JobListing[]>>('/jobs')
  return res.data.data
}

// â”€â”€ Newsletter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function subscribeNewsletter(email: string, name?: string): Promise<void> {
  await api.post('/newsletter/subscribe', { email, name })
}

export default api

