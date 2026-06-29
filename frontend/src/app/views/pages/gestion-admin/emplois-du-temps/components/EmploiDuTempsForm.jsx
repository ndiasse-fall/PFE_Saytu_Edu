import React from 'react'

export function EmploiDuTempsForm({
  mode,
  form,
  classes,
  teachers,
  matieres,
  fieldErrors,
  error,
  submitting,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = mode === 'edit'
  const submitLabel = isEditing ? 'Mettre à jour' : 'Planifier la séance'

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {error ? (
        <div className="alert alert-error full-width" style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem' }}>
          {error}
        </div>
      ) : null}
      {/* Classe */}
      <label className="full-width">
        <span>Classe <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="id_classe"
          value={form.id_classe}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez une classe</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom_classe}
            </option>
          ))}
        </select>
        {fieldErrors.id_classe ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.id_classe[0]}
          </small>
        ) : null}
      </label>

      {/* Matière */}
      <label className="full-width">
        <span>Matière <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="id_matiere"
          value={form.id_matiere}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez une matière</option>
          {matieres.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom}
            </option>
          ))}
        </select>
        {fieldErrors.id_matiere ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.id_matiere[0]}
          </small>
        ) : null}
      </label>

      {/* Enseignant */}
      <label className="full-width">
        <span>Enseignant <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="id_enseignant"
          value={form.id_enseignant}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez un enseignant</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.prenom} {t.nom} ({t.specialite || 'Enseignant'})
            </option>
          ))}
        </select>
        {fieldErrors.id_enseignant ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.id_enseignant[0]}
          </small>
        ) : null}
      </label>

      {/* Jour */}
      <label>
        <span>Jour <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="jour"
          value={form.jour}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez un jour</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {fieldErrors.jour ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.jour[0]}
          </small>
        ) : null}
      </label>

      {/* Salle */}
      <label>
        <span>Salle <span style={{ color: 'var(--danger)' }}>*</span></span>
        <input
          type="text"
          name="salle"
          value={form.salle}
          onChange={onInputChange}
          placeholder="Ex: Salle 103"
          required
        />
        {fieldErrors.salle ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.salle[0]}
          </small>
        ) : null}
      </label>

      {/* Heure Début */}
      <label>
        <span>Heure de début <span style={{ color: 'var(--danger)' }}>*</span></span>
        <input
          type="time"
          name="heure_debut"
          value={form.heure_debut}
          onChange={onInputChange}
          required
        />
        {fieldErrors.heure_debut ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.heure_debut[0]}
          </small>
        ) : null}
      </label>

      {/* Heure Fin */}
      <label>
        <span>Heure de fin <span style={{ color: 'var(--danger)' }}>*</span></span>
        <input
          type="time"
          name="heure_fin"
          value={form.heure_fin}
          onChange={onInputChange}
          required
        />
        {fieldErrors.heure_fin ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.heure_fin[0]}
          </small>
        ) : null}
      </label>

      {/* Publication Checkbox */}
      <label className="checkbox full-width" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        <input
          name="est_publie"
          type="checkbox"
          checked={form.est_publie}
          onChange={onInputChange}
        />
        <span>Séance publiée (visible par l'élève et l'enseignant)</span>
      </label>

      {/* Actions */}
      <div className="form-actions full-width" style={{ marginTop: '20px' }}>
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
