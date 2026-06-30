import { apiClient } from '../../core/api/apiClient.js'

let currentUserRequest = null

export function normalizeAuthenticatedUser(rawUser) {
  if (!rawUser) return null

  const unwrapped = rawUser?.data ?? rawUser
  const user = unwrapped?.user ?? unwrapped

  if (!user || typeof user !== 'object') {
    return rawUser
  }

  const roleValue = user?.role?.value ?? user?.role ?? user?.role_name ?? user?.statut

  return {
    ...user,
    role: typeof roleValue === 'string' ? roleValue : roleValue?.value ?? null,
  }
}

export function login(credentials) {
  return apiClient('/login', {
    method: 'POST',
    data: credentials,
  }).then((response) => ({
    ...response,
    user: normalizeAuthenticatedUser(response?.user ?? response?.data ?? response),
  }))
}

export function logout() {
  return apiClient('/logout', {
    method: 'POST',
  })
}

export function changePassword(payload) {
  return apiClient('/change-password', {
    method: 'POST',
    data: payload,
  }).then((response) => ({
    ...response,
    user: normalizeAuthenticatedUser(response?.user ?? response?.data ?? response),
  }))
}

export async function getCurrentUser() {
  if (!currentUserRequest) {
    currentUserRequest = apiClient('/me')
      .then((response) => normalizeAuthenticatedUser(response))
      .finally(() => {
        currentUserRequest = null
      })
  }

  return currentUserRequest
}

export async function updateCurrentUserProfile(payload) {
  const response = await apiClient('/me', {
    method: 'PATCH',
    data: payload,
  })

  return normalizeAuthenticatedUser(response?.data ?? response)
}
