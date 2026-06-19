import { apiClient } from '../../core/api/apiClient'

let currentUserRequest = null

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
  if (!currentUserRequest) {
    currentUserRequest = apiClient('/me')
      .then((response) => response.data)
      .finally(() => {
        currentUserRequest = null
      })
  }

  return currentUserRequest
}
