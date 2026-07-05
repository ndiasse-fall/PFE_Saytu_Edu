import { PasswordField } from '../../../../../shared/components/forms/PasswordField'

const roles = ['ADMIN', 'ENSEIGNANT', 'ELEVE']

export function UserForm({
  mode,
  form,
  classes = [],
  matieres = [],
  fieldErrors,
  submitting,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = mode === 'edit'
  const submitLabel = isEditing ? 'Mettre à jour' : 'Créer'
  const passwordLabel = isEditing ? 'Mot de passe (optionnel)' : 'Mot de passe'
  const usesTemporaryPassword = !isEditing && ['ELEVE', 'ENSEIGNANT'].includes(form.role)
  const teacherMatieres = Array.isArray(matieres) ? matieres : []
  const teacherClasses = Array.isArray(classes) ? classes : []

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
        {usesTemporaryPassword ? (
          <div className="alert alert-info full-width">
            Un mot de passe temporaire sera généré automatiquement pour ce rôle.
          </div>
        ) : (
          <PasswordField
            label={passwordLabel}
            name="password"
            value={form.password}
            onChange={onInputChange}
            autoComplete={isEditing ? 'new-password' : 'current-password'}
            required={!isEditing}
            error={fieldErrors.password?.[0]}
          />
        )}
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
        {form.role === 'ELEVE' ? (
          <label className="full-width">
            <span>Classe</span>
            <select name="classe_id" value={form.classe_id} onChange={onInputChange} required>
              <option value="">Sélectionner la classe</option>
              {teacherClasses.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom_classe} - {classe.niveau} ({classe.annee_scolaire})
                </option>
              ))}
            </select>
            {fieldErrors.classe_id ? <small>{fieldErrors.classe_id[0]}</small> : null}
          </label>
        ) : null}
        {form.role === 'ENSEIGNANT' ? (
          <>
            <label className="full-width">
              <span>Spécialité principale</span>
              <select name="specialite" value={form.specialite} onChange={onInputChange} required>
                <option value="">Sélectionner une spécialité</option>
                {teacherMatieres.map((matiere) => (
                  <option key={matiere.id} value={matiere.nom_matiere}>
                    {matiere.nom_matiere}
                  </option>
                ))}
              </select>
              {fieldErrors.specialite ? <small>{fieldErrors.specialite[0]}</small> : null}
            </label>
            <label className="full-width">
              <span>Classes attribuées</span>
              <select
                name="classe_ids"
                multiple
                value={Array.isArray(form.classe_ids) ? form.classe_ids : []}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
                  onInputChange({ target: { name: 'classe_ids', value: selected, type: 'multiselect' } })
                }}
                size={4}
                required
              >
                {teacherClasses.map((classe) => (
                  <option key={classe.id} value={String(classe.id)}>
                    {classe.nom_classe} - {classe.niveau}
                  </option>
                ))}
              </select>
              {fieldErrors.classe_ids ? <small>{fieldErrors.classe_ids[0]}</small> : null}
            </label>
            <label className="full-width">
              <span>Matières enseignées</span>
              <select
                name="matiere_ids"
                multiple
                value={Array.isArray(form.matiere_ids) ? form.matiere_ids : []}
                onChange={(event) => {
                  const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
                  onInputChange({ target: { name: 'matiere_ids', value: selected, type: 'multiselect' } })
                }}
                size={4}
              >
                {teacherMatieres.map((matiere) => (
                  <option key={matiere.id} value={String(matiere.id)}>
                    {matiere.nom_matiere}
                  </option>
                ))}
              </select>
              {fieldErrors.matiere_ids ? <small>{fieldErrors.matiere_ids[0]}</small> : null}
            </label>
          </>
        ) : null}
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
