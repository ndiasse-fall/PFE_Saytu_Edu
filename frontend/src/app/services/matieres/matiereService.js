import api from '../../core/api'

export const listMatieres = () =>
  api.get('/matieres')

export const createMatiere = (data) =>
  api.post('/matieres', data)

export const updateMatiere = (id, data) =>
  api.put(`/matieres/${id}`, data)

export const deleteMatiere = (id) =>
  api.delete(`/matieres/${id}`)