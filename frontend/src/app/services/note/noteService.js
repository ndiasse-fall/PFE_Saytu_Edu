import { apiClient } from '../../core/api/apiClient'

export function buildNoteQuery(filters = {}) {
  const params = new URLSearchParams()

  if (filters.classId) params.set('id_classe', filters.classId)
  if (filters.subjectId) params.set('id_matiere', filters.subjectId)
  if (filters.studentId) params.set('id_eleve', filters.studentId)
  if (filters.period) params.set('periode', filters.period)
  if (filters.evaluationType) {
    params.set('type_evaluation', filters.evaluationType)
  }
  if (filters.page) params.set('page', filters.page)
  if (filters.perPage) params.set('per_page', filters.perPage)

  return params.toString()
}

export function listNotes(filters = {}) {
  const query = buildNoteQuery(filters)

  return apiClient(`/notes${query ? `?${query}` : ''}`)
}

export async function showNote(noteId) {
  const response = await apiClient(`/notes/${noteId}`)

  return response.data
}

export function saveNotes(payload) {
  return apiClient('/notes/saisir', {
    method: 'POST',
    data: payload,
  })
}

export function updateNote(noteId, payload) {
  return apiClient(`/notes/${noteId}`, {
    method: 'PUT',
    data: payload,
  })
}

export function deleteNote(noteId) {
  return apiClient(`/notes/${noteId}`, {
    method: 'DELETE',
  })
}

export function getClassResults(classId, filters = {}) {
  const query = buildNoteQuery(filters)

  return apiClient(
    `/notes/resultats/classe/${classId}${query ? `?${query}` : ''}`,
  )
}

export function getStudentResults(studentId, filters = {}) {
  const query = buildNoteQuery(filters)

  return apiClient(
    `/notes/resultats/eleve/${studentId}${query ? `?${query}` : ''}`,
  )
}import { apiClient } from '../../core/api/apiClient'

export function buildNoteQuery(filters = {}) {
  const params = new URLSearchParams()

  if (filters.classId) params.set('id_classe', filters.classId)
  if (filters.subjectId) params.set('id_matiere', filters.subjectId)
  if (filters.studentId) params.set('id_eleve', filters.studentId)
  if (filters.period) params.set('periode', filters.period)
  if (filters.evaluationType) {
    params.set('type_evaluation', filters.evaluationType)
  }
  if (filters.page) params.set('page', filters.page)
  if (filters.perPage) params.set('per_page', filters.perPage)

  return params.toString()
}

export function listNotes(filters = {}) {
  const query = buildNoteQuery(filters)

  return apiClient(`/notes${query ? `?${query}` : ''}`)
}

export async function showNote(noteId) {
  const response = await apiClient(`/notes/${noteId}`)

  return response.data
}

export function saveNotes(payload) {
  return apiClient('/notes/saisir', {
    method: 'POST',
    data: payload,
  })
}

export function updateNote(noteId, payload) {
  return apiClient(`/notes/${noteId}`, {
    method: 'PUT',
    data: payload,
  })
}

export function deleteNote(noteId) {
  return apiClient(`/notes/${noteId}`, {
    method: 'DELETE',
  })
}

export function getClassResults(classId, filters = {}) {
  const query = buildNoteQuery(filters)

  return apiClient(
    `/notes/resultats/classe/${classId}${query ? `?${query}` : ''}`,
  )
}

export function getStudentResults(studentId, filters = {}) {
  const query = buildNoteQuery(filters)

  return apiClient(
    `/notes/resultats/eleve/${studentId}${query ? `?${query}` : ''}`,
  )
}