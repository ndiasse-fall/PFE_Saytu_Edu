import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../core/context/useAuth'
import { BrandLogo } from '../../../../shared/components/branding/BrandLogo'
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField'
import { TextField } from '../../../../shared/components/forms/TextField'
import { AuthSplitLayout } from '../../../../shared/components/layout/AuthSplitLayout'
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    if (type === 'checkbox') {
      setRemember(checked)
      return
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await signIn(form)
      const fallback = data.user.role === 'ENSEIGNANT' || data.user.role === 'ELEVE'
        ? '/user/dashboard'
        : '/admin/dashboard'
      const redirectTo = location.state?.from?.pathname || fallback

      navigate(redirectTo, { replace: true })
    } catch (err) {
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
              <h1>L’administration scolaire réinventée pour les lycées d’aujourd’hui.</h1>
              <ul className="auth-feature-list">
                <li>Gestion des élèves</li>
                <li>Gestion des enseignants</li>
                <li>Gestion des classes</li>
                <li>Gestion financière</li>
                <li>Gestion académique</li>
              </ul>
            </div>
          </div>
        )}
        right={(
          <div className="auth-panel-content">
            <div className="auth-panel-head">
              <h2>Bienvenue sur Saytu Edu</h2>
              <p>Connectez-vous à votre compte</p>
            </div>

            <div className="auth-card auth-card-strong">
              {error ? <div className="alert alert-error">{error}</div> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
                <TextField
                  label="Email ou Nom d’utilisateur"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email ou Nom d’utilisateur"
                  required
                />

                <TextField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  required
                />

                <div className="auth-meta-row">
                  <CheckboxField
                    name="remember"
                    checked={remember}
                    onChange={handleChange}
                    label="Se souvenir de moi"
                  />
                  <button type="button" className="text-link">
                    Mot de passe oublié ?
                  </button>
                </div>

                <PrimaryButton type="submit" disabled={loading} block>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </PrimaryButton>
              </form>

              <p className="auth-support">
                Vous n’avez pas de compte? contactez l’école
              </p>
            </div>
          </div>
        )}
      />
    </div>
  )
}
