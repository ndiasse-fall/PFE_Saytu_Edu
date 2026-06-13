import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="system-page-shell">
      <div className="panel screen-panel system-page-panel">
        <h1>404</h1>
        <p>La page demandée est introuvable.</p>
        <Link className="inline-link" to="/login">
          Revenir à la connexion
        </Link>
      </div>
    </div>
  )
}
