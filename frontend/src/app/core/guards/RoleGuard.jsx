import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function RoleGuard({ roles }) {
  const { user, hasRole } = useAuth()

  if (!hasRole(roles)) {
    const fallback = user?.role === 'ENSEIGNANT' || user?.role === 'ELEVE'
      ? '/user/dashboard'
      : '/unauthorized'

    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
