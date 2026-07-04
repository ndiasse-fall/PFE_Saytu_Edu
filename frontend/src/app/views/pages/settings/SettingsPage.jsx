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

function buildProfileForm(user) {
  return {
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    email: user?.email ?? '',
    telephone: user?.telephone ?? '',
    adresse: user?.adresse ?? '',
  }
}

function getUserInitials(user) {
  const nameParts = [user?.prenom, user?.nom].filter(Boolean)

  if (nameParts.length > 0) {
    return nameParts
      .slice(0, 2)
      .map((part) => part.trim().charAt(0))
      .join('')
      .toUpperCase()
  }

  return user?.email?.trim().charAt(0).toUpperCase() ?? ''
}

export function SettingsPage() {
  const { user, updateProfile, updatePassword, signOut } = useAuth()
  const [activeEditor, setActiveEditor] = useState(null)
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
  const displayName = fullName || user?.email || 'Compte utilisateur'
  const initials = getUserInitials(user)
  const roleLabel = roleLabels[user?.role] ?? user?.role ?? 'Non renseigné'
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
      setActiveEditor(null)
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
      setActiveEditor(null)
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

      <div className="profile-editor-shell">
        <aside className="profile-editor-sidebar panel">
          <div className="profile-editor-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-editor-name">
            <strong>{displayName}</strong>
            <span>{roleLabel}</span>
          </div>

          <div className="profile-editor-status">
            <span className={user?.actif ? 'badge badge-active' : 'badge badge-inactive'}>
              {user?.actif ? 'Compte actif' : 'Compte inactif'}
            </span>
            <span className={user?.must_change_password ? 'badge badge-warning' : 'badge badge-active'}>
              {user?.must_change_password ? 'Mot de passe à changer' : 'Mot de passe à jour'}
            </span>
          </div>

          <nav className="profile-editor-links" aria-label="Actions du profil">
            <button
              type="button"
              className={activeEditor === null ? 'is-active' : ''}
              onClick={() => setActiveEditor(null)}
            >
              Mon compte
            </button>
            <button
              type="button"
              className={activeEditor === 'profile' ? 'is-active' : ''}
              onClick={() => setActiveEditor('profile')}
            >
              Modifier le profil
            </button>
            <button
              type="button"
              className={activeEditor === 'password' ? 'is-active' : ''}
              onClick={() => setActiveEditor('password')}
            >
              Changer le mot de passe
            </button>
            <button type="button" onClick={() => void signOut()}>Déconnexion</button>
          </nav>
        </aside>

        <div className="profile-editor-main panel">
          {activeEditor === null ? (
            <section className="profile-editor-section">
              <div className="profile-editor-section-head">
                <h3>Mon compte</h3>
                <p>Résumé des informations rattachées à votre compte Saytu Edu.</p>
              </div>

              <div className="profile-details-grid">
                <div className="profile-details-item">
                  <span>Nom complet</span>
                  <strong>{fullName || 'Non renseigné'}</strong>
                </div>
                <div className="profile-details-item">
                  <span>Rôle</span>
                  <strong>{roleLabel}</strong>
                </div>
                <div className="profile-details-item">
                  <span>Email</span>
                  <strong>{user?.email || 'Non renseigné'}</strong>
                </div>
                <div className="profile-details-item">
                  <span>Téléphone</span>
                  <strong>{user?.telephone || 'Non renseigné'}</strong>
                </div>
                <div className="profile-details-item settings-field-full">
                  <span>Adresse</span>
                  <strong>{user?.adresse || 'Non renseignée'}</strong>
                </div>
                <div className="profile-details-item">
                  <span>Statut du compte</span>
                  <strong>{user?.actif ? 'Actif' : 'Inactif'}</strong>
                </div>
                <div className="profile-details-item">
                  <span>Sécurité</span>
                  <strong>{user?.must_change_password ? 'Mot de passe à changer' : 'Mot de passe à jour'}</strong>
                </div>
              </div>
            </section>
          ) : null}

          {activeEditor === 'profile' ? (
          <section className="profile-editor-section" id="profile-form">
            <div className="profile-editor-section-head">
              <h3>Profil</h3>
              <p>Informations visibles dans l’application Saytu Edu.</p>
            </div>

            <form className="settings-form profile-editor-form" onSubmit={handleProfileSubmit}>
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
                  placeholder="Adresse"
                />
                {profileErrors.adresse?.[0] ? <small>{profileErrors.adresse[0]}</small> : null}
              </label>

              <div className="profile-editor-actions settings-field-full">
                <PrimaryButton type="submit" disabled={profileLoading}>
                  {profileLoading ? 'Enregistrement...' : 'Enregistrer'}
                </PrimaryButton>
                <button type="button" className="ghost-button" onClick={() => setActiveEditor(null)}>
                  Annuler
                </button>
              </div>
            </form>
          </section>
          ) : null}

          {activeEditor === 'password' ? (
          <section className="profile-editor-section" id="password-form">
            <div className="profile-editor-section-head">
              <h3>Sécurité</h3>
              <p>Modifier votre mot de passe personnel.</p>
            </div>

            <form className="settings-form profile-editor-form" onSubmit={handlePasswordSubmit}>
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

              <div className="profile-editor-actions settings-field-full">
                <PrimaryButton type="submit" disabled={passwordLoading}>
                  {passwordLoading ? 'Modification...' : 'Mettre à jour'}
                </PrimaryButton>
                <button type="button" className="ghost-button" onClick={() => setActiveEditor(null)}>
                  Annuler
                </button>
              </div>
            </form>
          </section>
          ) : null}
        </div>
      </div>
    </section>
  )
}
