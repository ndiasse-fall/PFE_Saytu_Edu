import { apiClient } from '../../core/api/apiClient'

const pendingRequests = new Map()

function deduplicateRequest(key, request) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }

  const promise = request().finally(() => pendingRequests.delete(key))
  pendingRequests.set(key, promise)

  return promise
}

export async function listUsers(filters = {}) {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.role) params.set('role', filters.role)
  if (filters.actif !== '' && filters.actif !== undefined) params.set('actif', filters.actif)
  if (filters.perPage) params.set('per_page', filters.perPage)
  if (filters.page) params.set('page', filters.page)

  const query = params.toString()
  const path = `/users${query ? `?${query}` : ''}`

  return deduplicateRequest(path, () => apiClient(path))
}

export function getDashboardSummary() {
  const path = '/dashboard/users-summary'
  return deduplicateRequest(path, () => apiClient(path))
}

export async function showUser(userId) {
  const response = await apiClient(`/users/${userId}`)
  return response.data
}

export async function createUser(payload) {
  return apiClient('/users', {
    method: 'POST',
    data: payload,
  })
}

export async function updateUser(userId, payload) {
  return apiClient(`/users/${userId}`, {
    method: 'PUT',
    data: payload,
  })
}

export async function deleteUser(userId) {
  return apiClient(`/users/${userId}`, {
    method: 'DELETE',
  })
}

export async function toggleUserStatus(userId) {
  return apiClient(`/users/${userId}/toggle-active`, {
    method: 'PATCH',
  })
}
