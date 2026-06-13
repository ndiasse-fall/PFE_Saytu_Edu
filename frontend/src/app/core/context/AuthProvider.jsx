import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login, logout } from '../../services/auth/authService'
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  storeAuth,
  storeUser,
} from '../storage/authStorage'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken)
  const [user, setUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        storeUser(currentUser)
      } catch {
        clearStoredAuth()
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [token])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      async signIn(credentials, remember = true) {
        const data = await login(credentials)
        storeAuth(data.token, data.user, remember)
        setToken(data.token)
        setUser(data.user)
        return data
      },
      async signOut() {
        try {
          await logout()
        } finally {
          clearStoredAuth()
          setToken(null)
          setUser(null)
        }
      },
      hasRole(expectedRoles) {
        if (!user?.role) {
          return false
        }

        return expectedRoles.includes(user.role)
      },
    }),
    [loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
