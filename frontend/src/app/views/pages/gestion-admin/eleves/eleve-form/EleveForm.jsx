import { PasswordField } from '../../../../../shared/components/forms/PasswordField'

export function EleveForm({
  mode,
  form,
  fieldErrors,
  submitting,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = mode === 'edit'
  const submitLabel = isEditing ? 'Mettre à jour' : 'Créer'

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label>
        <span>Nom</span>
        <input name="nom" value={form.nom} onChange={onInputChange} autoComplete="family-name" required />
        {fieldErrors.nom ? <small>{fieldErrors.nom[0]}</small> : null}
      </label>
      <label>
        <span>Prénom</span>
        <input name="prenom" value={form.prenom} onChange={onInputChange} autoComplete="given-name" required />
        {fieldErrors.prenom ? <small>{fieldErrors.prenom[0]}</small> : null}
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" value={form.email} onChange={onInputChange} autoComplete="email" required />
        {fieldErrors.email ? <small>{fieldErrors.email[0]}</small> : null}
      </label>
      {isEditing ? (
        <PasswordField
          label="Mot de passe (optionnel)"
          name="password"
          value={form.password}
          onChange={onInputChange}
          autoComplete="new-password"
          error={fieldErrors.password?.[0]}
        />
      ) : (
        <div className="alert alert-info full-width">
          Un mot de passe temporaire sera généré automatiquement et envoyé par email.
        </div>
      )}
      <label>
        <span>Téléphone</span>
        <input name="telephone" value={form.telephone} onChange={onInputChange} autoComplete="tel" inputMode="tel" />
      </label>
      <label>
        <span>Date de naissance</span>
        <input name="date_naissance" type="date" value={form.date_naissance} onChange={onInputChange} required />
        {fieldErrors.date_naissance ? <small>{fieldErrors.date_naissance[0]}</small> : null}
      </label>
      <label>
        <span>Téléphone parent</span>
        <input name="telephone_parent" value={form.telephone_parent} onChange={onInputChange} autoComplete="tel" inputMode="tel" required />
        {fieldErrors.telephone_parent ? <small>{fieldErrors.telephone_parent[0]}</small> : null}
      </label>
      <label className="full-width">
        <span>Adresse</span>
        <textarea name="adresse" rows="3" value={form.adresse} onChange={onInputChange} autoComplete="street-address" />
      </label>
      <label className="checkbox full-width">
        <input name="actif" type="checkbox" checked={form.actif} onChange={onInputChange} />
        <span>Élève actif</span>
      </label>
      <div className="form-actions full-width">
        <button type="button" className="ghost-button" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
