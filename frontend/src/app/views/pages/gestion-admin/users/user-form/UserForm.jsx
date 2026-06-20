const roles = ['ADMIN', 'ENSEIGNANT', 'ELEVE']

export function UserForm({
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
  const passwordLabel = isEditing ? 'Mot de passe (optionnel)' : 'Mot de passe'

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
        <label>
          <span>{passwordLabel}</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onInputChange}
            autoComplete={isEditing ? 'new-password' : 'current-password'}
            required={!isEditing}
          />
          {fieldErrors.password ? <small>{fieldErrors.password[0]}</small> : null}
        </label>
        <label>
          <span>Téléphone</span>
          <input name="telephone" value={form.telephone} onChange={onInputChange} autoComplete="tel" inputMode="tel" />
        </label>
        <label>
          <span>Rôle</span>
          <select name="role" value={form.role} onChange={onInputChange}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className="full-width">
          <span>Adresse</span>
          <textarea name="adresse" rows="3" value={form.adresse} onChange={onInputChange} autoComplete="street-address" />
        </label>
        <label className="checkbox full-width">
          <input name="actif" type="checkbox" checked={form.actif} onChange={onInputChange} />
          <span>Utilisateur actif</span>
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
