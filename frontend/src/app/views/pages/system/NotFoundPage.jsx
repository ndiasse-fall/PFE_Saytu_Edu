import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>404</h1>
        <p>La page demandée est introuvable.</p>
        <Link className="inline-link" to="/login">
          Revenir à la connexion
        </Link>
      </div>
    </div>
  )
}
