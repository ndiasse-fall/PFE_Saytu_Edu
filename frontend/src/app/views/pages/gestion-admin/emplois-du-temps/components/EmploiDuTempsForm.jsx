import React, { useMemo, useState, useEffect } from 'react'

export function EmploiDuTempsForm({
  mode,
  form,
  classes = [],
  teachers = [],
  matieres = [],
  fieldErrors = {},
  error,
  submitting,
  onInputChange,
  onSubmit,
  onCancel,
}) {
  const isEditing = mode === 'edit'
  const submitLabel = isEditing ? 'Mettre à jour' : 'Planifier la séance'

  // Liste des jours normalisée pour correspondre aux soumissions
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

  // Helper pour capitaliser l'affichage cosmétique des jours
  const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1)

  // État local pour le niveau sélectionné dans le formulaire
  const [selectedNiveau, setSelectedNiveau] = useState('')

  // 1. Extraire la liste unique de tous les niveaux existants depuis les classes reçues
  const niveauxDisponibles = useMemo(() => {
    if (!Array.isArray(classes)) return []
    const allNiveaux = classes.map(c => c?.niveau).filter(Boolean)
    return [...new Set(allNiveaux)]
  }, [classes])

  // 2. Synchroniser ou pré-remplir le niveau si on est en mode édition (edit)
  useEffect(() => {
    if (form.id_classe && classes.length > 0) {
      const classeAssociee = classes.find(c => String(c.id) === String(form.id_classe))
      if (classeAssociee && classeAssociee.niveau) {
        setSelectedNiveau(classeAssociee.niveau)
      }
    } else if (!form.id_classe) {
      setSelectedNiveau('')
    }
  }, [form.id_classe, classes])

  // 3. Vider la liste des classes si aucun niveau n'est sélectionné, sinon filtrer
  const classesFiltrees = useMemo(() => {
    if (!selectedNiveau || !Array.isArray(classes)) return []
    return classes.filter(c => String(c?.niveau) === String(selectedNiveau))
  }, [classes, selectedNiveau])

  const handleNiveauChange = (e) => {
    const value = e.target.value
    setSelectedNiveau(value)
    
    // Si l'utilisateur change de niveau, on réinitialise le champ classe global
    if (form.id_classe) {
      const fakeEvent = { target: { name: 'id_classe', value: '' } }
      onInputChange(fakeEvent)
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {error ? (
        <div className="alert alert-error full-width" style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      ) : null}

      {/* Niveau (Obligatoire avant de choisir une classe) */}
      <label className="full-width">
        <span>Niveau <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="form_niveau"
          value={selectedNiveau}
          onChange={handleNiveauChange}
          required
        >
          <option value="">Sélectionnez un niveau</option>
          {niveauxDisponibles.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      {/* Classe (Bloquée tant qu'aucun niveau n'est choisi) */}
      <label className="full-width">
        <span>Classe <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="id_classe"
          value={form.id_classe || ''}
          onChange={onInputChange}
          required
          disabled={!selectedNiveau}
          style={{ opacity: !selectedNiveau ? 0.6 : 1, cursor: !selectedNiveau ? 'not-allowed' : 'pointer' }}
        >
          <option value="">
            {!selectedNiveau ? "Sélectionnez d'abord un niveau" : "Sélectionnez une classe"}
          </option>
          {classesFiltrees.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom_classe}
            </option>
          ))}
        </select>
        {fieldErrors?.id_classe ? (
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
          value={form.id_matiere || ''}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez une matière</option>
          {Array.isArray(matieres) && matieres.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom_matiere}
            </option>
          ))}
        </select>
        {fieldErrors?.id_matiere ? (
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
          value={form.id_enseignant || ''}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez un enseignant</option>
          {Array.isArray(teachers) && teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.prenom} {t.nom} ({t.specialite || 'Enseignant'})
            </option>
          ))}
        </select>
        {fieldErrors?.id_enseignant ? (
          <small style={{ color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.id_enseignant[0]}
          </small>
        ) : null}
      </label>

      {/* Jour (Converti en minuscules pour correspondre à la bdd) */}
      <label>
        <span>Jour <span style={{ color: 'var(--danger)' }}>*</span></span>
        <select
          name="jour"
          value={form.jour ? String(form.jour).toLowerCase().trim() : ''}
          onChange={onInputChange}
          required
        >
          <option value="">Sélectionnez un jour</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {capitalize(d)}
            </option>
          ))}
        </select>
        {fieldErrors?.jour ? (
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
          value={form.salle || ''}
          onChange={onInputChange}
          placeholder="Ex: Salle 103"
          required
        />
        {fieldErrors?.salle ? (
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
          value={form.heure_debut || ''}
          onChange={onInputChange}
          required
        />
        {fieldErrors?.heure_debut ? (
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
          value={form.heure_fin || ''}
          onChange={onInputChange}
          required
        />
        {fieldErrors?.heure_fin ? (
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
          checked={!!form.est_publie}
          onChange={(e) => onInputChange({ target: { name: 'est_publie', value: e.target.checked } })}
        />
        <span>Séance publiée (visible par l'élève et l'enseignant)</span>
      </label>

      {/* Actions */}
      <div className="form-actions full-width" style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" className="ghost-button" onClick={onCancel} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Annuler
        </button>
        <button type="submit" disabled={submitting} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px' }}>
          {submitting ? 'Enregistrement...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default EmploiDuTempsForm;