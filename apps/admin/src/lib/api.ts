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
  DashboardStats,
  Developer,
  Lead,
  LeadNote,
  LeadTask,
  Notification,
  OperationType,
  PaginatedResponse,
  Property,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
const TOKEN_KEY = 'evoorion_admin_token'

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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  return request<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
}

export async function getAgentPerformance() {
  return request<ApiResponse<AgentPerformance[]>>('/admin/dashboard/agent-performance')
}

// ── Properties ────────────────────────────────────────────────────────────────

export async function getAdminProperties(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
}) {
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<Property>>(`/admin/properties${q ? `?${q}` : ''}`)
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

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function getLeads(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
  source?: string
}) {
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<Lead>>(`/admin/leads${q ? `?${q}` : ''}`)
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
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<Agency>>(`/admin/agencies${q ? `?${q}` : ''}`)
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
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<Agent>>(`/admin/agents${q ? `?${q}` : ''}`)
}

export async function createAgent(data: Partial<Agent>) {
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
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<AdminUser>>(`/admin/users${q ? `?${q}` : ''}`)
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
}) {
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<Record<string, unknown>>>(`/admin/activity-logs${q ? `?${q}` : ''}`)
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function getAdminBlogPosts(params?: { page?: number; status?: string }) {
  const q = new URLSearchParams(params as Record<string, string>).toString()
  return request<PaginatedResponse<BlogPost>>(`/blog${q ? `?${q}` : ''}`)
}

export async function getAdminBlogPost(slug: string) {
  return request<ApiResponse<BlogPost>>(`/blog/${slug}`)
}

export async function getBlogTags() {
  return request<ApiResponse<BlogTag[]>>('/blog/tags')
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getLeadFunnel() {
  return request<ApiResponse<unknown>>('/admin/reports/lead-funnel')
}

export async function getLeadsOverTime(days: number = 30) {
  return request<ApiResponse<unknown>>(`/admin/reports/leads-over-time?days=${days}`)
}

export async function getPropertyPerformance() {
  return request<ApiResponse<unknown>>('/admin/reports/property-performance')
}

export async function getAgentLeaderboard() {
  return request<ApiResponse<unknown>>('/admin/reports/agent-leaderboard')
}

export async function getLeadsBySource() {
  return request<ApiResponse<unknown>>('/admin/reports/leads-by-source')
}
