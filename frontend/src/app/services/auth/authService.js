import { apiClient } from '../../core/api/apiClient'

export function login(credentials) {
  return apiClient('/login', {
    method: 'POST',
    data: credentials,
  })
}

export function logout() {
  return apiClient('/logout', {
    method: 'POST',
  })
}

export async function getCurrentUser() {
  const response = await apiClient('/me')
  return response.data
}
