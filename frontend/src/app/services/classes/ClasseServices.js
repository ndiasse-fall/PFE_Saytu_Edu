import api from '../../core/api'

export const listClasses = () =>
  api.get('/classes')

export const createClasse = (data) =>
  api.post('/classes', data)

export const updateClasse = (id, data) =>
  api.put(`/classes/${id}`, data)

export const deleteClasse = (id) =>
  api.delete(`/classes/${id}`)