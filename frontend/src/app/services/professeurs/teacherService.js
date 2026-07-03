import { apiClient } from '../../core/api/apiClient'

const BASE_URL = '/users'

function withTeacherRole(filters = {}) {
  return { ...filters, role: 'ENSEIGNANT' }
}

export async function listTeachers(filters = {}) {
  const params = new URLSearchParams()
  Object.entries(withTeacherRole(filters)).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  return apiClient(`${BASE_URL}?${params.toString()}`)
}

export async function showTeacher(id) {
  const response = await apiClient(`${BASE_URL}/${id}`)
  return response.data
}

export async function createTeacher(payload) {
  return apiClient(BASE_URL, {
    method: 'POST',
    data: { ...payload, role: 'ENSEIGNANT' },
  })
}

export async function updateTeacher(id, payload) {
  return apiClient(`${BASE_URL}/${id}`, {
    method: 'PUT',
    data: { ...payload, role: 'ENSEIGNANT' },
  })
}

export async function deleteTeacher(id) {
  return apiClient(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  })
}

export async function toggleTeacherActive(id) {
  return apiClient(`${BASE_URL}/${id}/toggle-active`, {
    method: 'PATCH',
  })
}

export async function assignClassesToTeacher(id, classeIds) {
  return apiClient(`${BASE_URL}/${id}/classes`, {
    method: 'PUT',
    data: { classe_ids: classeIds },
  })
}

// ==========================================
//  AJOUT : Récupération de la table matières
// ==========================================
export async function listMatieres() {
  // Appelle directement l'endpoint GET 'matieres' de votre API Laravel
  return apiClient('/matieres')
}