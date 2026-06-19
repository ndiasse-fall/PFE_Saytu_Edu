import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getDashboardPath } from '../../util/roleNavigation'

export function GuestGuard() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <div className="screen-state">Chargement...</div>
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />
  }

  return <Outlet />
}
