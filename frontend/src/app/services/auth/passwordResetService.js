import { apiClient } from '../../core/api/apiClient'

export function requestPasswordReset(email) {
  return apiClient('/forgot-password', {
    method: 'POST',
    data: { email },
  })
}

export function resetPassword(payload) {
  return apiClient('/reset-password', {
    method: 'POST',
    data: payload,
  })
}
