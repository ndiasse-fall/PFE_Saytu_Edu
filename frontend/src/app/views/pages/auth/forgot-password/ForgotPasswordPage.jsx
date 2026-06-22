import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../../../services/auth/passwordResetService'
import { BrandLogo } from '../../../../shared/components/branding/BrandLogo'
import { TextField } from '../../../../shared/components/forms/TextField'
import { AuthSplitLayout } from '../../../../shared/components/layout/AuthSplitLayout'
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldErrors({})
    setMessage('')
    setError('')
    setLoading(true)

    try {
      const response = await requestPasswordReset(email)
      setMessage(response.message || 'Un lien de réinitialisation a été envoyé.')
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
              <h1>Réinitialisez votre accès en toute sécurité.</h1>
              <ul className="auth-feature-list">
                <li>Lien unique envoyé par email</li>
                <li>Token sécurisé et temporaire</li>
                <li>Nouveau mot de passe chiffré</li>
              </ul>
            </div>
          </div>
        )}
        right={(
          <div className="auth-panel-content">
            <div className="auth-panel-head">
              <h2>Mot de passe oublié</h2>
              <p>Entrez votre email pour recevoir le lien de réinitialisation.</p>
            </div>

            <div className="auth-card auth-card-strong">
              {message ? <div className="alert alert-success">{message}</div> : null}
              {error && !message ? <div className="alert alert-error">{error}</div> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Entrez votre email"
                  autoComplete="email"
                  error={fieldErrors.email?.[0]}
                  required
                />

                <PrimaryButton type="submit" disabled={loading} block className="auth-submit-button">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
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
