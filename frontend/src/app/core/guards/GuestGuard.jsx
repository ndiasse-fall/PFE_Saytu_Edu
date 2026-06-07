import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function GuestGuard() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <div className="screen-state">Chargement...</div>
  }

  if (isAuthenticated) {
    const fallback = user?.role === 'ENSEIGNANT' || user?.role === 'ELEVE'
      ? '/user/dashboard'
      : '/admin/dashboard'

    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
