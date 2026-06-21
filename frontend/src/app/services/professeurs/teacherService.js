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

export async function listEnseignants(filters = {}) {
  const params = new URLSearchParams()
  params.set('role', 'ENSEIGNANT')
  if (filters.search) params.set('search', filters.search)
  if (filters.actif !== '' && filters.actif !== undefined) params.set('actif', filters.actif)
  if (filters.perPage) params.set('per_page', filters.perPage)
  if (filters.page) params.set('page', filters.page)
  const query = params.toString()
  const path = `/users${query ? `?${query}` : ''}`
  return apiClient(path)
}

export async function showEnseignant(enseignantId) {
  const response = await apiClient(`/users/${enseignantId}`)
  return response.data
}

export async function createEnseignant(payload) {
  return apiClient('/users', {
    method: 'POST',
    data: { ...payload, role: 'ENSEIGNANT' },
  })
}

export async function updateEnseignant(enseignantId, payload) {
  return apiClient(`/users/${enseignantId}`, {
    method: 'PUT',
    data: { ...payload, role: 'ENSEIGNANT' },
  })
}

export async function deleteEnseignant(enseignantId) {
  return apiClient(`/users/${enseignantId}`, {
    method: 'DELETE',
  })
}

export async function toggleEnseignantStatus(enseignantId) {
  return apiClient(`/users/${enseignantId}/toggle-active`, {
    method: 'PATCH',
  })
}

export async function listMatieres() {
  const path = '/matieres'
  return deduplicateRequest(path, () => apiClient(path))
}

export async function affecterMatiere(enseignantId, matiereId) {
  return apiClient(`/users/${enseignantId}/matieres`, {
    method: 'POST',
    data: { id_matiere: Number(matiereId) },
  })
}