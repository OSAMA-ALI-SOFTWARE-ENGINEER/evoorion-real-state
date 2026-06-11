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
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
  per_page?: number
  page?: number
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

// ── Auth ──────────────────────────────────────────────────────────────────────

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

// ── Blog ──────────────────────────────────────────────────────────────────────

export interface BlogFilters {
  tag?: string
  search?: string
  per_page?: number
  page?: number
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

// ── Master data (public) ──────────────────────────────────────────────────────

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

// ── Comparison ────────────────────────────────────────────────────────────────

export async function compareProperties(slugs: string[]): Promise<ApiResponse<ComparisonResult>> {
  const res = await api.post<ApiResponse<ComparisonResult>>('/properties/compare', { slugs })
  return res.data
}

// ── Favorites ─────────────────────────────────────────────────────────────────

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

// ── Currencies ────────────────────────────────────────────────────────────────

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

export default api
