import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createAbsences,
  deleteAbsence,
  listAbsences,
  listClassStudents,
  listMyClasses,
  updateAbsence,
} from '../../../../services/absences/absenceService'
import { useAuth } from '../../../../core/context/useAuth'

const today = new Date().toISOString().slice(0, 10)

function normalizeList(response) {
  const data = response?.data ?? response ?? []
  return Array.isArray(data) ? data : []
}

function getFullName(user) {
  return `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || 'Élève non renseigné'
}

export function AbsenceManagementPage() {
  const { user } = useAuth()
  const canManage = ['SUPER_ADMIN', 'ADMIN', 'ENSEIGNANT'].includes(user?.role)

  const [classes, setClasses] = useState([])
  const [eleves, setEleves] = useState([])
  const [absences, setAbsences] = useState([])
  const [filters, setFilters] = useState({
    classe: '',
    eleve_id: '',
    date_debut: '',
    date_fin: '',
    est_justifiee: '',
    search: '',
  })
  const [form, setForm] = useState({
    id_classe: '',
    date_absence: today,
    motif: '',
    absents: [],
  })
  const [editingAbsence, setEditingAbsence] = useState(null)
  const [editForm, setEditForm] = useState({ motif: '', est_justifiee: false })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const kpis = useMemo(() => {
    const justified = absences.filter((absence) => absence.est_justifiee).length
    const unjustified = absences.length - justified

    return [
      { label: 'Total', value: absences.length, icon: 'bi-calendar-x' },
      { label: 'Justifiées', value: justified, icon: 'bi-check-circle-fill' },
      { label: 'Non justifiées', value: unjustified, icon: 'bi-exclamation-circle-fill' },
      { label: 'Élèves classe', value: eleves.length, icon: 'bi-mortarboard-fill' },
    ]
  }, [absences, eleves.length])

  const loadAbsences = useCallback(async (nextFilters = filters) => {
    setLoading(true)
    setError('')

    try {
      const response = await listAbsences(nextFilters)
      setAbsences(normalizeList(response))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadClasses = useCallback(async () => {
    try {
      const response = await listMyClasses()
      const data = normalizeList(response)
      setClasses(data)

      if (data.length && !form.id_classe) {
        const firstClassId = String(data[0].id)
        setForm((current) => ({ ...current, id_classe: firstClassId }))
        setFilters((current) => ({ ...current, classe: firstClassId }))
      }
    } catch (err) {
      setError(err.message)
    }
  }, [form.id_classe])

  const loadEleves = useCallback(async (classeId) => {
    if (!classeId) {
      setEleves([])
      return
    }

    try {
      const response = await listClassStudents(classeId)
      setEleves(normalizeList(response))
    } catch (err) {
      setEleves([])
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    void loadClasses()
  }, [loadClasses])

  useEffect(() => {
    void loadEleves(form.id_classe || filters.classe)
  }, [filters.classe, form.id_classe, loadEleves])

  useEffect(() => {
    void loadAbsences()
  }, [loadAbsences])

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'id_classe' ? { absents: [] } : {}),
    }))
  }

  function toggleAbsent(eleveId) {
    setForm((current) => {
      const exists = current.absents.includes(eleveId)
      return {
        ...current,
        absents: exists
          ? current.absents.filter((id) => id !== eleveId)
          : [...current.absents, eleveId],
      }
    })
  }

  async function applyFilters(event) {
    event.preventDefault()
    await loadAbsences(filters)
  }

  async function clearFilters() {
    const reset = {
      classe: '',
      eleve_id: '',
      date_debut: '',
      date_fin: '',
      est_justifiee: '',
      search: '',
    }
    setFilters(reset)
    await loadAbsences(reset)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    setFieldErrors({})

    try {
      await createAbsences({
        id_classe: form.id_classe,
        date_absence: form.date_absence,
        motif: form.motif || null,
        absents: form.absents,
      })
      setSuccess('Absences enregistrées avec succès.')
      setForm((current) => ({ ...current, motif: '', absents: [] }))
      await loadAbsences(filters)
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.details ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(absence) {
    setEditingAbsence(absence)
    setEditForm({
      motif: absence.motif ?? '',
      est_justifiee: Boolean(absence.est_justifiee),
    })
    setError('')
    setSuccess('')
  }

  async function handleUpdate(event) {
    event.preventDefault()
    if (!editingAbsence) return

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await updateAbsence(editingAbsence.id, editForm)
      setSuccess('Absence mise à jour avec succès.')
      setEditingAbsence(null)
      await loadAbsences(filters)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(absenceId) {
    if (!window.confirm('Supprimer cette absence ?')) return

    try {
      await deleteAbsence(absenceId)
      setSuccess('Absence supprimée avec succès.')
      await loadAbsences(filters)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="page-section users-page absence-page">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <section className="users-kpi-grid" aria-label="Indicateurs absences">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="panel users-kpi-card">
            <span className="users-kpi-icon" aria-hidden="true">
              <i className={`bi ${kpi.icon}`} />
            </span>
            <div className="users-kpi-copy">
              <strong>{kpi.value}</strong>
              <span>{kpi.label}</span>
            </div>
          </article>
        ))}
      </section>

      {canManage ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Saisie des absences</h2>
              <p className="muted">Sélectionnez une classe, une date et les élèves absents.</p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Classe</span>
              <select name="id_classe" value={form.id_classe} onChange={handleFormChange} required>
                <option value="">Choisir une classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom_classe}
                  </option>
                ))}
              </select>
              {fieldErrors.id_classe ? <small>{fieldErrors.id_classe[0]}</small> : null}
            </label>

            <label>
              <span>Date</span>
              <input name="date_absence" type="date" value={form.date_absence} onChange={handleFormChange} required />
              {fieldErrors.date_absence ? <small>{fieldErrors.date_absence[0]}</small> : null}
            </label>

            <label className="full-width">
              <span>Motif général</span>
              <textarea name="motif" rows="2" value={form.motif} onChange={handleFormChange} placeholder="Ex: absence non justifiée, maladie, retard..." />
              {fieldErrors.motif ? <small>{fieldErrors.motif[0]}</small> : null}
            </label>

            <div className="full-width absence-student-list">
              {eleves.length === 0 ? (
                <div className="screen-state users-table-state">Sélectionnez une classe avec des élèves.</div>
              ) : (
                eleves.map((eleve) => (
                  <label key={eleve.id} className="checkbox absence-student-item">
                    <input
                      type="checkbox"
                      checked={form.absents.includes(eleve.id)}
                      onChange={() => toggleAbsent(eleve.id)}
                    />
                    <span>{getFullName(eleve)}</span>
                  </label>
                ))
              )}
              {fieldErrors.absents ? <small>{fieldErrors.absents[0]}</small> : null}
            </div>

            <div className="form-actions full-width">
              <button type="submit" disabled={submitting || form.absents.length === 0}>
                {submitting ? 'Enregistrement...' : 'Enregistrer les absences'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="panel users-table-panel">
        <div className="panel-header users-table-header">
          <div className="users-table-title">
            <h2>Liste des absences</h2>
            <span className="muted">{absences.length} enregistrements</span>
          </div>
          <form className="users-filter-toolbar absence-filter-toolbar" onSubmit={applyFilters}>
            <label className="users-toolbar-field users-toolbar-search">
              <i className="bi bi-search" aria-hidden="true" />
              <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Nom, prénom, email..." />
            </label>
            <label className="users-toolbar-field">
              <span>Classe</span>
              <select name="classe" value={filters.classe} onChange={handleFilterChange}>
                <option value="">Toutes</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>{classe.nom_classe}</option>
                ))}
              </select>
            </label>
            <label className="users-toolbar-field">
              <span>Statut</span>
              <select name="est_justifiee" value={filters.est_justifiee} onChange={handleFilterChange}>
                <option value="">Tous</option>
                <option value="1">Justifiée</option>
                <option value="0">Non justifiée</option>
              </select>
            </label>
            <label className="users-toolbar-field">
              <span>Début</span>
              <input name="date_debut" type="date" value={filters.date_debut} onChange={handleFilterChange} />
            </label>
            <label className="users-toolbar-field">
              <span>Fin</span>
              <input name="date_fin" type="date" value={filters.date_fin} onChange={handleFilterChange} />
            </label>
            <div className="form-actions users-toolbar-actions">
              <button type="submit">Filtrer</button>
              <button type="button" className="ghost-button" onClick={() => void clearFilters()}>
                Réinitialiser
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="screen-state users-table-state">Chargement des absences...</div>
        ) : absences.length === 0 ? (
          <div className="screen-state users-table-state">Aucune absence trouvée.</div>
        ) : (
          <div className="table-wrapper users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  {canManage ? <th>Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {absences.map((absence) => (
                  <tr key={absence.id}>
                    <td>
                      <span className="users-identity">
                        <span className="users-identity-avatar" aria-hidden="true">
                          {(absence.eleve?.prenom?.[0] || '') + (absence.eleve?.nom?.[0] || '')}
                        </span>
                        <strong>{getFullName(absence.eleve)}</strong>
                      </span>
                    </td>
                    <td>{absence.date_absence}</td>
                    <td>{absence.motif || 'Non renseigné'}</td>
                    <td>
                      <span className={`badge ${absence.est_justifiee ? 'badge-active' : 'badge-inactive'}`}>
                        {absence.est_justifiee ? 'Justifiée' : 'Non justifiée'}
                      </span>
                    </td>
                    {canManage ? (
                      <td>
                        <div className="form-actions">
                          <button type="button" className="ghost-button" onClick={() => startEdit(absence)}>
                            Modifier
                          </button>
                          <button type="button" className="link-button danger" onClick={() => void handleDelete(absence.id)}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingAbsence ? (
        <>
          <button type="button" className="users-drawer-backdrop" aria-label="Fermer le panneau" onClick={() => setEditingAbsence(null)} />
          <aside className="users-drawer users-drawer-form" aria-label="Modifier une absence">
            <section className="panel users-drawer-panel">
              <div className="panel-header">
                <div>
                  <h2>Modifier l'absence</h2>
                  <p className="muted">{getFullName(editingAbsence.eleve)} - {editingAbsence.date_absence}</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => setEditingAbsence(null)}>
                  Fermer
                </button>
              </div>

              <form className="form-grid" onSubmit={handleUpdate}>
                <label className="full-width">
                  <span>Motif</span>
                  <textarea
                    rows="4"
                    value={editForm.motif}
                    onChange={(event) => setEditForm((current) => ({ ...current, motif: event.target.value }))}
                  />
                </label>
                <label className="checkbox full-width">
                  <input
                    type="checkbox"
                    checked={editForm.est_justifiee}
                    onChange={(event) => setEditForm((current) => ({ ...current, est_justifiee: event.target.checked }))}
                  />
                  <span>Absence justifiée</span>
                </label>
                <div className="form-actions full-width">
                  <button type="button" className="ghost-button" onClick={() => setEditingAbsence(null)}>
                    Annuler
                  </button>
                  <button type="submit" disabled={submitting}>
                    Enregistrer
                  </button>
                </div>
              </form>
            </section>
          </aside>
        </>
      ) : null}
    </section>
  )
}
