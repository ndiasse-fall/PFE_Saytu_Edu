const TOKEN_KEY = 'saytou_edu_token'
const USER_KEY = 'saytou_edu_user'

function getStorageWithToken() {
  if (localStorage.getItem(TOKEN_KEY)) {
    return localStorage
  }

  if (sessionStorage.getItem(TOKEN_KEY)) {
    return sessionStorage
  }

  return null
}

export function getStoredToken() {
  return getStorageWithToken()?.getItem(TOKEN_KEY) ?? null
}

export function getStoredUser() {
  const storage = getStorageWithToken()
  const rawUser = storage?.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    clearStoredAuth()
    return null
  }
}

export function storeAuth(token, user, remember) {
  clearStoredAuth()

  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function storeUser(user) {
  const storage = getStorageWithToken()

  if (storage) {
    storage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function clearStoredAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(TOKEN_KEY)
    storage.removeItem(USER_KEY)
  }
}
