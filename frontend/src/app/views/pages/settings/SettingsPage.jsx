import { useAuth } from '../../../core/context/useAuth'

export function SettingsPage() {
  const { user } = useAuth()
  const fullName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()

  return (
    <section className="settings-page">
      <header className="page-header-inline">
        <div>
          <h2>Mon compte</h2>
          <p>Informations de session et données de profil visibles dans l’application.</p>
        </div>
      </header>

      <section className="panel settings-panel">
        <div className="settings-heading">
          <div className="settings-avatar" aria-hidden="true">
            {(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}
          </div>
          <div>
            <h2>Informations du compte</h2>
            <p>Les informations actuellement enregistrées pour votre session.</p>
          </div>
        </div>

        <dl className="settings-details">
          <div>
            <dt>Nom complet</dt>
            <dd>{fullName || 'Non renseigné'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email || 'Non renseigné'}</dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>{user?.telephone || 'Non renseigné'}</dd>
          </div>
          <div>
            <dt>Rôle</dt>
            <dd>{user?.role || 'Non renseigné'}</dd>
          </div>
          <div>
            <dt>Statut</dt>
            <dd>{user?.actif ? 'Actif' : 'Inactif'}</dd>
          </div>
        </dl>
      </section>
    </section>
  )
}
