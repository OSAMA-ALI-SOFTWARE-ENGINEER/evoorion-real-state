import axios from 'axios'
import type {
  ApiResponse,
  AuthUser,
  BlogPost,
  BlogPostSummary,
  BlogTag,
  LeadPayload,
  LoginPayload,
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
  min_price?: number
  max_price?: number
  per_page?: number
  page?: number
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

export default api
