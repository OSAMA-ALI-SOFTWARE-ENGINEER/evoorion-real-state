import type {
  AdminUser,
  Agency,
  Agent,
  AgentPerformance,
  ApiResponse,
  Area,
  AuthUser,
  BlogPost,
  BlogTag,
  CmsSection,
  Currency,
  DashboardStats,
  Developer,
  Language,
  Lead,
  LeadNote,
  LeadTask,
  MediaFile,
  Notification,
  OperationType,
  PaginatedResponse,
  Property,
  PropertyImage,
  RegionBreakdown,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const TOKEN_KEY = 'evoorion_admin_token'

function qs(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return ''
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') p.append(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const tok = token !== undefined ? token : getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = (body as { message?: string }).message ?? `HTTP ${res.status}`
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string) {
  return request<ApiResponse<{ token: string; user: AuthUser }>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function logoutUser() {
  return request<ApiResponse<null>>('/auth/logout', { method: 'POST' })
}

export async function getMe(token?: string) {
  return request<ApiResponse<AuthUser>>('/auth/me', {}, token)
}

export async function updateProfile(data: { name: string; email: string }) {
  return request<ApiResponse<AuthUser>>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function changePassword(data: {
  current_password: string
  new_password: string
  new_password_confirmation: string
}) {
  return request<ApiResponse<null>>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  return request<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
}

export async function getAgentPerformance() {
  return request<ApiResponse<AgentPerformance[]>>('/admin/dashboard/agent-performance')
}

export async function getRegionBreakdown() {
  return request<ApiResponse<RegionBreakdown[]>>('/admin/dashboard/region-breakdown')
}

// ── Properties ────────────────────────────────────────────────────────────────

export async function getAdminProperties(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
  type?: string
  area_id?: number
  developer_id?: number
  featured?: string
}) {
  return request<PaginatedResponse<Property>>(`/admin/properties${qs(params)}`)
}

export async function getAdminProperty(slug: string) {
  return request<ApiResponse<Property>>(`/admin/properties/${slug}`)
}

export async function createProperty(data: Partial<Property>) {
  return request<ApiResponse<Property>>('/admin/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProperty(slug: string, data: Partial<Property>) {
  return request<ApiResponse<Property>>(`/admin/properties/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteProperty(slug: string) {
  return request<ApiResponse<null>>(`/admin/properties/${slug}`, { method: 'DELETE' })
}

export async function restoreProperty(slug: string) {
  return request<ApiResponse<Property>>(`/admin/properties/${slug}/restore`, { method: 'POST' })
}

export async function uploadPropertyImage(
  slug: string,
  file: File,
  isPrimary = false,
): Promise<ApiResponse<PropertyImage>> {
  const tok = getToken()
  const fd = new FormData()
  fd.append('image', file)
  fd.append('is_primary', isPrimary ? '1' : '0')
  const res = await fetch(`${BASE_URL}/admin/properties/${slug}/images`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    },
    body: fd,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<ApiResponse<PropertyImage>>
}

export async function updatePropertyImage(slug: string, imageId: number, data: { is_primary?: boolean; order?: number }) {
  return request<ApiResponse<PropertyImage>>(`/admin/properties/${slug}/images/${imageId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deletePropertyImage(slug: string, imageId: number) {
  return request<ApiResponse<null>>(`/admin/properties/${slug}/images/${imageId}`, { method: 'DELETE' })
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function getLeads(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
  source?: string
  region?: string
}) {
  return request<PaginatedResponse<Lead>>(`/admin/leads${qs(params)}`)
}

export async function getLead(id: number) {
  return request<ApiResponse<Lead>>(`/admin/leads/${id}`)
}

export async function updateLead(id: number, data: Partial<Lead>) {
  return request<ApiResponse<Lead>>(`/admin/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteLead(id: number) {
  return request<ApiResponse<null>>(`/admin/leads/${id}`, { method: 'DELETE' })
}

export async function getLeadNotes(leadId: number) {
  return request<ApiResponse<LeadNote[]>>(`/admin/leads/${leadId}/notes`)
}

export async function addLeadNote(leadId: number, note: string) {
  return request<ApiResponse<LeadNote>>(`/admin/leads/${leadId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
}

export async function deleteLeadNote(leadId: number, noteId: number) {
  return request<ApiResponse<null>>(`/admin/leads/${leadId}/notes/${noteId}`, { method: 'DELETE' })
}

export async function getLeadTasks(leadId: number) {
  return request<ApiResponse<LeadTask[]>>(`/admin/leads/${leadId}/tasks`)
}

export async function addLeadTask(leadId: number, data: { title: string; due_date?: string | null }) {
  return request<ApiResponse<LeadTask>>(`/admin/leads/${leadId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function completeLeadTask(leadId: number, taskId: number) {
  return request<ApiResponse<LeadTask>>(`/admin/leads/${leadId}/tasks/${taskId}/complete`, { method: 'POST' })
}

export async function deleteLeadTask(leadId: number, taskId: number) {
  return request<ApiResponse<null>>(`/admin/leads/${leadId}/tasks/${taskId}`, { method: 'DELETE' })
}

export async function exportLeadsCSV(): Promise<Blob> {
  const tok = getToken()
  const res = await fetch(`${BASE_URL}/admin/leads/export/csv`, {
    headers: { Authorization: `Bearer ${tok ?? ''}`, Accept: 'text/csv' },
  })
  if (!res.ok) throw new Error('CSV export failed')
  return res.blob()
}

// ── Master data ───────────────────────────────────────────────────────────────

export async function getAreas() {
  return request<PaginatedResponse<Area>>('/admin/areas')
}

export async function createArea(data: Partial<Area>) {
  return request<ApiResponse<Area>>('/admin/areas', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateArea(id: number, data: Partial<Area>) {
  return request<ApiResponse<Area>>(`/admin/areas/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteArea(id: number) {
  return request<ApiResponse<null>>(`/admin/areas/${id}`, { method: 'DELETE' })
}

export async function updateAreaStatus(id: number, status: 'active' | 'inactive') {
  return request<ApiResponse<Area>>(`/admin/areas/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
}

// ── Currencies ────────────────────────────────────────────────────────────────

export async function getCurrencies() {
  return request<ApiResponse<Currency[]>>('/admin/currencies')
}

export async function createCurrency(data: Partial<Currency>) {
  return request<ApiResponse<Currency>>('/admin/currencies', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateCurrency(id: number, data: Partial<Currency>) {
  return request<ApiResponse<Currency>>(`/admin/currencies/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteCurrency(id: number) {
  return request<ApiResponse<null>>(`/admin/currencies/${id}`, { method: 'DELETE' })
}

// ── Languages ─────────────────────────────────────────────────────────────────

export async function getLanguages() {
  return request<ApiResponse<Language[]>>('/admin/languages')
}

export async function createLanguage(data: Partial<Language>) {
  return request<ApiResponse<Language>>('/admin/languages', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateLanguage(id: number, data: Partial<Language>) {
  return request<ApiResponse<Language>>(`/admin/languages/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteLanguage(id: number) {
  return request<ApiResponse<null>>(`/admin/languages/${id}`, { method: 'DELETE' })
}

// ── Regions ──────────────────────────────────────────────────────────────────

export interface Region {
  id: number
  code: string
  name: string
  flag: string | null
  is_active: boolean
  sort_order: number
}

export async function getRegions() {
  return request<ApiResponse<Region[]>>('/admin/regions')
}

export async function createRegion(data: Partial<Region>) {
  return request<ApiResponse<Region>>('/admin/regions', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateRegion(id: number, data: Partial<Region>) {
  return request<ApiResponse<Region>>(`/admin/regions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteRegion(id: number) {
  return request<ApiResponse<null>>(`/admin/regions/${id}`, { method: 'DELETE' })
}

export async function getDevelopers() {
  return request<PaginatedResponse<Developer>>('/admin/developers')
}

export async function createDeveloper(data: Partial<Developer>) {
  return request<ApiResponse<Developer>>('/admin/developers', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateDeveloper(id: number, data: Partial<Developer>) {
  return request<ApiResponse<Developer>>(`/admin/developers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteDeveloper(id: number) {
  return request<ApiResponse<null>>(`/admin/developers/${id}`, { method: 'DELETE' })
}

export async function getOperationTypes() {
  return request<PaginatedResponse<OperationType>>('/admin/operation-types')
}

export async function createOperationType(data: { name: string; slug: string }) {
  return request<ApiResponse<OperationType>>('/admin/operation-types', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateOperationType(id: number, data: Partial<OperationType>) {
  return request<ApiResponse<OperationType>>(`/admin/operation-types/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteOperationType(id: number) {
  return request<ApiResponse<null>>(`/admin/operation-types/${id}`, { method: 'DELETE' })
}

// ── Agencies & Agents ─────────────────────────────────────────────────────────

export async function getAgencies(params?: { search?: string }) {
  return request<PaginatedResponse<Agency>>(`/admin/agencies${qs(params)}`)
}

export async function createAgency(data: Partial<Agency>) {
  return request<ApiResponse<Agency>>('/admin/agencies', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateAgency(id: number, data: Partial<Agency>) {
  return request<ApiResponse<Agency>>(`/admin/agencies/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteAgency(id: number) {
  return request<ApiResponse<null>>(`/admin/agencies/${id}`, { method: 'DELETE' })
}

export async function getAgents(params?: { search?: string; agency_id?: number }) {
  return request<PaginatedResponse<Agent>>(`/admin/agents${qs(params)}`)
}

export type CreateAgentPayload = Partial<Agent> & {
  name?: string; email?: string; password?: string; password_confirmation?: string; avatar_url?: string
}

export async function createAgent(data: CreateAgentPayload) {
  return request<ApiResponse<Agent>>('/admin/agents', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateAgent(id: number, data: Partial<Agent>) {
  return request<ApiResponse<Agent>>(`/admin/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteAgent(id: number) {
  return request<ApiResponse<null>>(`/admin/agents/${id}`, { method: 'DELETE' })
}

export async function restoreAgent(id: number) {
  return request<ApiResponse<Agent>>(`/admin/agents/${id}/restore`, { method: 'POST' })
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(params?: { search?: string; role?: string }) {
  return request<PaginatedResponse<AdminUser>>(`/admin/users${qs(params)}`)
}

export async function updateUser(id: number, data: Partial<AdminUser>) {
  return request<ApiResponse<AdminUser>>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteUser(id: number) {
  return request<ApiResponse<null>>(`/admin/users/${id}`, { method: 'DELETE' })
}

export async function restoreUser(id: number) {
  return request<ApiResponse<null>>(`/admin/users/${id}/restore`, { method: 'POST' })
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications() {
  return request<ApiResponse<Notification[]>>('/admin/notifications')
}

export async function getUnreadCount() {
  return request<ApiResponse<{ count: number }>>('/admin/notifications/unread-count')
}

export async function markNotificationRead(id: string) {
  return request<ApiResponse<null>>(`/admin/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead() {
  return request<ApiResponse<null>>('/admin/notifications/read-all', { method: 'POST' })
}

// ── Activity logs ─────────────────────────────────────────────────────────────

export async function getActivityLogs(params?: {
  page?: number
  per_page?: number
  action?: string
  model_type?: string
  date_from?: string
  date_to?: string
  user_id?: number
}) {
  return request<PaginatedResponse<Record<string, unknown>>>(`/admin/activity-logs${qs(params)}`)
}

// ── Blog (admin) ──────────────────────────────────────────────────────────────

export async function getAdminBlogPosts(params?: { page?: number; per_page?: number; search?: string; status?: string }) {
  return request<PaginatedResponse<BlogPost>>(`/admin/blog${qs(params)}`)
}

export async function getAdminBlogPost(id: number) {
  return request<ApiResponse<BlogPost>>(`/admin/blog/${id}`)
}

export async function createBlogPost(data: Partial<BlogPost> & { tag_ids?: number[] }) {
  return request<ApiResponse<BlogPost>>('/admin/blog', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateBlogPost(id: number, data: Partial<BlogPost> & { tag_ids?: number[] }) {
  return request<ApiResponse<BlogPost>>(`/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteBlogPost(id: number) {
  return request<ApiResponse<null>>(`/admin/blog/${id}`, { method: 'DELETE' })
}

export async function restoreBlogPost(id: number) {
  return request<ApiResponse<BlogPost>>(`/admin/blog/${id}/restore`, { method: 'POST' })
}

export async function approveBlogPost(id: number) {
  return request<ApiResponse<BlogPost>>(`/admin/blog/${id}/approve`, { method: 'POST' })
}

export async function checkBlogTitleUnique(title: string, excludeId?: number): Promise<boolean> {
  const params = new URLSearchParams({ title })
  if (excludeId) params.set('exclude_id', String(excludeId))
  try {
    const res = await request<ApiResponse<{ unique: boolean }>>(`/admin/blog/check-title?${params}`)
    return res.data.unique
  } catch {
    return true
  }
}

export async function getAdminBlogTags() {
  return request<ApiResponse<BlogTag[]>>('/admin/blog-tags')
}

export async function createBlogTag(data: { name: string }) {
  return request<ApiResponse<BlogTag>>('/admin/blog-tags', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateBlogTag(id: number, data: { name: string }) {
  return request<ApiResponse<BlogTag>>(`/admin/blog-tags/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteBlogTag(id: number) {
  return request<ApiResponse<null>>(`/admin/blog-tags/${id}`, { method: 'DELETE' })
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings() {
  return request<ApiResponse<Record<string, string | null>>>('/admin/settings')
}

export async function updateSettings(settings: Record<string, string | null>) {
  return request<ApiResponse<Record<string, string | null>>>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  })
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getLeadFunnel(region?: string) {
  return request<ApiResponse<{ funnel: { status: string; count: number }[]; total: number; conversion_rate: number }>>(`/admin/reports/lead-funnel${qs({ region })}`)
}

export async function getLeadsOverTime(days: number = 30, region?: string) {
  return request<ApiResponse<{ date: string; total: number }[]>>(`/admin/reports/leads-over-time${qs({ days, region })}`)
}

export async function getPropertyPerformance(region?: string) {
  return request<ApiResponse<{ id: number; title: string; slug: string; area: string | null; price: string; views: number; leads: number; status: string; is_featured: boolean }[]>>(`/admin/reports/property-performance${qs({ region })}`)
}

export async function getAgentLeaderboard(region?: string) {
  return request<ApiResponse<{ id: number; name: string; leads_total: number; leads_closed: number; leads_new: number; close_rate: number }[]>>(`/admin/reports/agent-leaderboard${qs({ region })}`)
}

export async function getLeadsBySource(region?: string) {
  return request<ApiResponse<{ source: string; total: number }[]>>(`/admin/reports/leads-by-source${qs({ region })}`)
}

// ── Create user ───────────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string; email: string; password: string; password_confirmation: string
  role: string; is_active?: boolean; region_id?: number | null
}) {
  return request<ApiResponse<AdminUser>>('/admin/users', { method: 'POST', body: JSON.stringify(data) })
}

// ── Media library ─────────────────────────────────────────────────────────────

export async function getMedia(params?: { folder?: string; search?: string; per_page?: number }) {
  return request<PaginatedResponse<MediaFile>>(`/admin/media${qs(params)}`)
}

export async function uploadMedia(file: File, folder = 'misc'): Promise<MediaFile> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('evoorion_admin_token') : null
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/admin/media/upload`, {
    method: 'POST',
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.message ?? 'Upload failed')
  }
  const json = await res.json() as ApiResponse<MediaFile>
  return json.data!
}

export async function deleteMedia(id: number) {
  return request<ApiResponse<null>>(`/admin/media/${id}`, { method: 'DELETE' })
}

// ── CMS ───────────────────────────────────────────────────────────────────────

export async function getCmsPages() {
  return request<ApiResponse<string[]>>('/admin/cms')
}

export async function getCmsPage(slug: string) {
  return request<ApiResponse<{ page_slug: string; sections: CmsSection[] }>>(`/admin/cms/${slug}`)
}

export async function updateCmsPage(slug: string, sections: Array<{ section_key: string; content: unknown }>) {
  return request<ApiResponse<null>>(`/admin/cms/${slug}`, { method: 'PUT', body: JSON.stringify({ sections }) })
}

export async function deleteCmsSection(slug: string, key: string) {
  return request<ApiResponse<null>>(`/admin/cms/${slug}/sections/${key}`, { method: 'DELETE' })
}
