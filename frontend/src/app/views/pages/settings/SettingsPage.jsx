import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../core/context/useAuth'
import { TextField } from '../../../shared/components/forms/TextField'
import { PrimaryButton } from '../../../shared/components/ui/PrimaryButton'
import { getDashboardPath } from '../../../util/roleNavigation'

const roleLabels = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  ENSEIGNANT: 'Enseignant',
  ELEVE: 'Élève',
}

const roleActions = {
  SUPER_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
    { label: 'Utilisateurs', path: '/admin/gestion-admin/users', icon: 'bi-people-fill' },
    { label: 'Élèves', path: '/admin/gestion-admin/eleves', icon: 'bi-mortarboard-fill' },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
    { label: 'Élèves', path: '/admin/gestion-admin/eleves', icon: 'bi-mortarboard-fill' },
    { label: 'Professeurs', path: '/admin/professeurs', icon: 'bi-person-video3' },
  ],
  ENSEIGNANT: [
    { label: 'Dashboard', path: '/enseignant/dashboard', icon: 'bi-grid-1x2-fill' },
    { label: 'Classes', path: '/enseignant/classes', icon: 'bi-building' },
    { label: 'Emploi du temps', path: '/enseignant/emploi-du-temps', icon: 'bi-calendar-week' },
  ],
  ELEVE: [
    { label: 'Dashboard', path: '/eleve/dashboard', icon: 'bi-grid-1x2-fill' },
    { label: 'Emploi du temps', path: '/eleve/emploi-du-temps', icon: 'bi-calendar-week' },
    { label: 'Bulletin', path: '/eleve/bulletin', icon: 'bi-file-earmark-text' },
  ],
}

function buildProfileForm(user) {
  return {
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    email: user?.email ?? '',
    telephone: user?.telephone ?? '',
    adresse: user?.adresse ?? '',
  }
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || 'Non renseigné'}</dd>
    </div>
  )
}

export function SettingsPage() {
  const { user, updateProfile, updatePassword, signOut } = useAuth()
  const [profileForm, setProfileForm] = useState(() => buildProfileForm(user))
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const fullName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}` || 'SE'
  const roleLabel = roleLabels[user?.role] ?? user?.role ?? 'Non renseigné'
  const actions = roleActions[user?.role] ?? []
  const dashboardPath = useMemo(() => getDashboardPath(user?.role), [user?.role])

  function handleProfileChange(event) {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileErrors({})
    setMessage('')
    setError('')
    setProfileLoading(true)

    try {
      const nextUser = await updateProfile({
        ...profileForm,
        telephone: profileForm.telephone || null,
        adresse: profileForm.adresse || null,
      })
      setProfileForm(buildProfileForm(nextUser))
      setMessage('Profil mis à jour avec succès.')
    } catch (err) {
      setProfileErrors(err.details || {})
      setError(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordErrors({})
    setMessage('')
    setError('')
    setPasswordLoading(true)

    try {
      await updatePassword(passwordForm)
      setPasswordForm({
        current_password: '',
        password: '',
        password_confirmation: '',
      })
      setMessage('Mot de passe modifié avec succès.')
    } catch (err) {
      setPasswordErrors(err.details || {})
      setError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <section className="settings-page">
      <header className="page-header-inline">
        <div>
          <h2>Paramètres du compte</h2>
          <p>Profil, sécurité et raccourcis utiles selon votre rôle.</p>
        </div>
        <Link className="ghost-button" to={dashboardPath}>Retour dashboard</Link>
      </header>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel settings-panel settings-identity-panel">
        <div className="settings-heading">
          <div className="settings-avatar" aria-hidden="true">{initials}</div>
          <div>
            <h2>{fullName || 'Utilisateur Saytu Edu'}</h2>
            <p>{roleLabel} · {user?.actif ? 'Compte actif' : 'Compte inactif'}</p>
          </div>
        </div>

        <dl className="settings-details">
          <InfoItem label="Nom complet" value={fullName} />
          <InfoItem label="Email" value={user?.email} />
          <InfoItem label="Téléphone" value={user?.telephone} />
          <InfoItem label="Adresse" value={user?.adresse} />
          <InfoItem label="Rôle" value={roleLabel} />
          <InfoItem label="Mot de passe" value={user?.must_change_password ? 'Changement requis' : 'À jour'} />
        </dl>
      </section>

      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="settings-section-title">
            <i className="bi bi-person-lines-fill" aria-hidden="true" />
            <div>
              <h3>Profil personnel</h3>
              <p>Ces informations sont utilisées dans la barre de navigation et les vues profil.</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={handleProfileSubmit}>
            <TextField label="Nom" name="nom" value={profileForm.nom} onChange={handleProfileChange} error={profileErrors.nom?.[0]} required />
            <TextField label="Prénom" name="prenom" value={profileForm.prenom} onChange={handleProfileChange} error={profileErrors.prenom?.[0]} required />
            <TextField label="Email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} error={profileErrors.email?.[0]} required />
            <TextField label="Téléphone" name="telephone" value={profileForm.telephone} onChange={handleProfileChange} error={profileErrors.telephone?.[0]} inputMode="tel" />
            <label className="field settings-field-full">
              <span className="field-label">Adresse</span>
              <textarea
                className="field-input"
                name="adresse"
                rows="3"
                value={profileForm.adresse}
                onChange={handleProfileChange}
              />
              {profileErrors.adresse?.[0] ? <small>{profileErrors.adresse[0]}</small> : null}
            </label>

            <PrimaryButton type="submit" disabled={profileLoading}>
              {profileLoading ? 'Enregistrement...' : 'Enregistrer le profil'}
            </PrimaryButton>
          </form>
        </section>

        <section className="panel settings-panel">
          <div className="settings-section-title">
            <i className="bi bi-shield-lock-fill" aria-hidden="true" />
            <div>
              <h3>Sécurité</h3>
              <p>Changez votre mot de passe sans passer par l’administration.</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <TextField
              label="Mot de passe actuel"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              error={passwordErrors.current_password?.[0]}
              autoComplete="current-password"
              required
            />
            <TextField
              label="Nouveau mot de passe"
              name="password"
              type="password"
              value={passwordForm.password}
              onChange={handlePasswordChange}
              error={passwordErrors.password?.[0]}
              autoComplete="new-password"
              required
            />
            <TextField
              label="Confirmation"
              name="password_confirmation"
              type="password"
              value={passwordForm.password_confirmation}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              required
            />

            <PrimaryButton type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Modification...' : 'Modifier le mot de passe'}
            </PrimaryButton>
          </form>
        </section>
      </div>

      <section className="panel settings-panel">
        <div className="settings-section-title">
          <i className="bi bi-compass-fill" aria-hidden="true" />
          <div>
            <h3>Raccourcis de votre rôle</h3>
            <p>Accès rapide aux vues les plus utiles pour votre profil.</p>
          </div>
        </div>

        <div className="settings-actions-grid">
          {actions.map((action) => (
            <Link key={action.path} className="settings-action-card" to={action.path}>
              <i className={`bi ${action.icon}`} aria-hidden="true" />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>

        <div className="settings-danger-zone">
          <div>
            <strong>Session</strong>
            <p>Fermer la session sur cet appareil.</p>
          </div>
          <button type="button" className="ghost-button" onClick={() => void signOut()}>
            Se déconnecter
          </button>
        </div>
      </section>
    </section>
  )
}
