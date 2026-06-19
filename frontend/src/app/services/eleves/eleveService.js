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

/**
 * Liste les élèves (utilisateurs avec le rôle ELEVE).
 */
export async function listEleves(filters = {}) {
  const params = new URLSearchParams()

  params.set('role', 'ELEVE') // Forcé pour ce service
  if (filters.search) params.set('search', filters.search)
  if (filters.actif !== '' && filters.actif !== undefined) params.set('actif', filters.actif)
  if (filters.perPage) params.set('per_page', filters.perPage)
  if (filters.page) params.set('page', filters.page)

  const query = params.toString()
  const path = `/users${query ? `?${query}` : ''}`

  // Pas de déduplication ici pour forcer le rafraîchissement
  return apiClient(path)
}

/**
 * Affiche les détails d'un élève.
 */
export async function showEleve(eleveId) {
  const response = await apiClient(`/users/${eleveId}`)
  return response.data
}

/**
 * Crée un nouvel élève.
 */
export async function createEleve(payload) {
  return apiClient('/users', {
    method: 'POST',
    data: { ...payload, role: 'ELEVE' },
  })
}

/**
 * Met à jour un élève.
 */
export async function updateEleve(eleveId, payload) {
  return apiClient(`/users/${eleveId}`, {
    method: 'PUT',
    data: { ...payload, role: 'ELEVE' },
  })
}

/**
 * Supprime un élève.
 */
export async function deleteEleve(eleveId) {
  return apiClient(`/users/${eleveId}`, {
    method: 'DELETE',
  })
}

/**
 * Active/Désactive un élève.
 */
export async function toggleEleveStatus(eleveId) {
  return apiClient(`/users/${eleveId}/toggle-active`, {
    method: 'PATCH',
  })
}

/**
 * Inscrit un élève dans une classe.
 */
export async function inscrireDansClasse(classeId, eleveId) {
  return apiClient(`/classes/${classeId}/inscrire-eleve`, {
    method: 'POST',
    data: { id_eleve: Number(eleveId) },
  })
}

/**
 * Liste toutes les classes pour le select d'inscription.
 */
export async function listClasses() {
  const path = '/classes'
  return deduplicateRequest(path, () => apiClient(path))
}
