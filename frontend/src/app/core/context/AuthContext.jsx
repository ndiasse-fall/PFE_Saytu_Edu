import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser, login, logout } from '../../services/auth/authService'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('saytou_edu_token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('saytou_edu_user')
    return raw ? JSON.parse(raw) : null
  })
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
        localStorage.setItem('saytou_edu_user', JSON.stringify(currentUser))
      } catch {
        localStorage.removeItem('saytou_edu_token')
        localStorage.removeItem('saytou_edu_user')
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
      async signIn(credentials) {
        const data = await login(credentials)
        localStorage.setItem('saytou_edu_token', data.token)
        localStorage.setItem('saytou_edu_user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        return data
      },
      async signOut() {
        try {
          await logout()
        } finally {
          localStorage.removeItem('saytou_edu_token')
          localStorage.removeItem('saytou_edu_user')
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
