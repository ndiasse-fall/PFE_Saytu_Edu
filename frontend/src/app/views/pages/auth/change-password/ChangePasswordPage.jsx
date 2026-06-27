import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../core/context/useAuth'
import { BrandLogo } from '../../../../shared/components/branding/BrandLogo'
import { TextField } from '../../../../shared/components/forms/TextField'
import { AuthSplitLayout } from '../../../../shared/components/layout/AuthSplitLayout'
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton'
import { getDashboardPath } from '../../../../util/roleNavigation'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, updatePassword, signOut } = useAuth()
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setError('')
    setLoading(true)

    try {
      const data = await updatePassword(form)
      const nextUser = data.user ?? user
      navigate(getDashboardPath(nextUser?.role), { replace: true })
    } catch (err) {
      setFieldErrors(err.details || {})
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthSplitLayout
        left={(
          <div className="auth-showcase-content">
            <BrandLogo size="xl" />
            <div className="auth-copy-block">
              <h1>Définissez votre mot de passe personnel.</h1>
              <ul className="auth-feature-list">
                <li>Mot de passe temporaire vérifié</li>
                <li>Accès complet après modification</li>
                <li>Sécurité renforcée dès la première connexion</li>
              </ul>
            </div>
          </div>
        )}
        right={(
          <div className="auth-panel-content">
            <div className="auth-panel-head">
              <h2>Changer le mot de passe</h2>
              <p>Votre mot de passe temporaire doit être remplacé avant de continuer.</p>
            </div>

            <div className="auth-card auth-card-strong">
              {error ? <div className="alert alert-error">{error}</div> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
                <TextField
                  label="Mot de passe temporaire"
                  name="current_password"
                  type="password"
                  value={form.current_password}
                  onChange={handleChange}
                  placeholder="Entrez le mot de passe reçu"
                  autoComplete="current-password"
                  error={fieldErrors.current_password?.[0]}
                  required
                />

                <TextField
                  label="Nouveau mot de passe"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                  error={fieldErrors.password?.[0]}
                  required
                />

                <TextField
                  label="Confirmer le mot de passe"
                  name="password_confirmation"
                  type="password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirmez le nouveau mot de passe"
                  autoComplete="new-password"
                  required
                />

                <PrimaryButton type="submit" disabled={loading} block className="auth-submit-button">
                  {loading ? 'Modification...' : 'Modifier mon mot de passe'}
                </PrimaryButton>
              </form>

              <p className="auth-support">
                Mauvais compte ?{' '}
                <button type="button" className="text-link link-button" onClick={() => void signOut()}>
                  Se déconnecter
                </button>
              </p>
            </div>
          </div>
        )}
      />
    </div>
  )
}
