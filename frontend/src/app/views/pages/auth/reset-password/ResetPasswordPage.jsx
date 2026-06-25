import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../../../services/auth/passwordResetService'
import { BrandLogo } from '../../../../shared/components/branding/BrandLogo'
import { TextField } from '../../../../shared/components/forms/TextField'
import { AuthSplitLayout } from '../../../../shared/components/layout/AuthSplitLayout'
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams])
  const [form, setForm] = useState({
    email: initialEmail,
    password: '',
    password_confirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setMessage('')
    setError('')

    if (!token) {
      setError('Le lien de réinitialisation est invalide ou incomplet.')
      return
    }

    setLoading(true)

    try {
      const response = await resetPassword({
        token,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      })

      setMessage(response.message || 'Mot de passe réinitialisé avec succès.')
      window.setTimeout(() => navigate('/login', { replace: true }), 1500)
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
              <h1>Choisissez un nouveau mot de passe sécurisé.</h1>
              <ul className="auth-feature-list">
                <li>Vérification du token reçu par email</li>
                <li>Mise à jour sécurisée du mot de passe</li>
                <li>Token supprimé après utilisation</li>
              </ul>
            </div>
          </div>
        )}
        right={(
          <div className="auth-panel-content">
            <div className="auth-panel-head">
              <h2>Nouveau mot de passe</h2>
              <p>Renseignez votre email et votre nouveau mot de passe.</p>
            </div>

            <div className="auth-card auth-card-strong">
              {message ? <div className="alert alert-success">{message}</div> : null}
              {error && !message ? <div className="alert alert-error">{error}</div> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Entrez votre email"
                  autoComplete="email"
                  error={fieldErrors.email?.[0]}
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
                  placeholder="Confirmez le mot de passe"
                  autoComplete="new-password"
                  required
                />

                <PrimaryButton type="submit" disabled={loading || !token} block className="auth-submit-button">
                  {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                </PrimaryButton>
              </form>

              <p className="auth-support">
                <Link className="text-link" to="/login">Retour à la connexion</Link>
              </p>
            </div>
          </div>
        )}
      />
    </div>
  )
}
