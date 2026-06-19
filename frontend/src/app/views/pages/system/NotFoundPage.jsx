import { Link } from 'react-router-dom'
import { useAuth } from '../../../core/context/useAuth'
import { getDashboardPath } from '../../../util/roleNavigation'

export function NotFoundPage() {
  const { isAuthenticated, user } = useAuth()
  const returnPath = isAuthenticated ? getDashboardPath(user?.role) : '/login'

  return (
    <div className="system-page-shell">
      <div className="panel screen-panel system-page-panel">
        <h1>404</h1>
        <p>La page demandée est introuvable.</p>
        <Link className="inline-link" to={returnPath}>
          {isAuthenticated ? 'Retour au tableau de bord' : 'Revenir à la connexion'}
        </Link>
      </div>
    </div>
  )
}
