import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function RoleGuard({ roles }) {
  const { hasRole } = useAuth()

  if (!hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
