import { Link } from 'react-router-dom'
import { useAuth } from '../../../core/context/useAuth'
import { getDashboardPath } from '../../../util/roleNavigation'

export function UnauthorizedPage() {
  const { user } = useAuth()

  return (
    <section className="panel screen-panel system-page-panel">
      <h2>Accès refusé</h2>
      <p>Veuillez contacter votre Administrateur.</p>
      <Link className="inline-link" to={getDashboardPath(user?.role)}>
        Retour au tableau de bord
      </Link>
    </section>
  )
}
