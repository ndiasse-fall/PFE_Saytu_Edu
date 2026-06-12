import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section className="panel screen-panel system-page-panel">
      <h2>Accès refusé</h2>
      <p>Veuillez contacter votre Administrateur.</p>
      <Link className="inline-link" to="/user/dashboard">
        Retour au tableau de bord
      </Link>
    </section>
  )
}
