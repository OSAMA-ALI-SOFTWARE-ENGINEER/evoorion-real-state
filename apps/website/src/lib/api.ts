import axios from 'axios'
import type { ApiResponse, LeadPayload, PaginatedResponse, Property, PropertySummary } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15_000,
})

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

export default api
