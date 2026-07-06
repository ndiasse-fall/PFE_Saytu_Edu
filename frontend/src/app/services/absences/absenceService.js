import { apiClient } from '../../core/api/apiClient'

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function listAbsences(params = {}) {
  return apiClient(`/absences${buildQuery(params)}`)
}

export function listMyAbsences() {
  return apiClient('/absences')
}

export function createAbsences(payload) {
  return apiClient('/absences', {
    method: 'POST',
    data: payload,
  })
}

export function updateAbsence(absenceId, payload) {
  return apiClient(`/absences/${absenceId}`, {
    method: 'PUT',
    data: payload,
  })
}

export function deleteAbsence(absenceId) {
  return apiClient(`/absences/${absenceId}`, {
    method: 'DELETE',
  })
}

export function listMyClasses() {
  return apiClient('/mes-classes')
}

export function listClassStudents(classeId) {
  return apiClient(`/mes-classes/${classeId}/eleves`)
}
