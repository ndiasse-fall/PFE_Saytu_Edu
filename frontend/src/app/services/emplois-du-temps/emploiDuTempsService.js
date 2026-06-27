import { apiClient } from '../../core/api/apiClient'

const BASE_URL = '/emplois-du-temps'

export async function listEmplois(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  const query = params.toString()
  return apiClient(`${BASE_URL}${query ? `?${query}` : ''}`)
}

export async function showEmploi(id) {
  const response = await apiClient(`${BASE_URL}/${id}`)
  return response.data
}

export async function createEmploi(payload) {
  return apiClient(BASE_URL, {
    method: 'POST',
    data: payload,
  })
}

export async function updateEmploi(id, payload) {
  return apiClient(`${BASE_URL}/${id}`, {
    method: 'PUT',
    data: payload,
  })
}

export async function deleteEmploi(id) {
  return apiClient(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

export async function publierEmploi(idClasse, estPublie) {
  return apiClient(`${BASE_URL}/publier`, {
    method: 'POST',
    data: {
      id_classe: Number(idClasse),
      est_publie: Boolean(estPublie),
    },
  })
}

// Helpers for dropdowns in forms
export async function listClasses() {
  return apiClient('/classes')
}

export async function listTeachers() {
  return apiClient('/users?role=ENSEIGNANT')
}

export async function listMatieres() {
  return apiClient('/matieres')
}
