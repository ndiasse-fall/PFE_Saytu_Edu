import { apiClient } from '../../core/api/apiClient'

export const listMatieres = async () => {
  const response = await apiClient('/matieres')
  return Array.isArray(response) ? response : (response?.data || [])
}

export const createMatiere = (data) =>
  apiClient('/matieres', { method: 'POST', data })

export const updateMatiere = (id, data) =>
  apiClient(`/matieres/${id}`, { method: 'PUT', data })

export const deleteMatiere = (id) =>
  apiClient(`/matieres/${id}`, { method: 'DELETE' })