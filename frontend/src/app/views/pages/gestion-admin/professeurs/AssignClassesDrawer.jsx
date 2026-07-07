import { useEffect, useState, useMemo } from 'react'
import { DrawerPanel } from '../../../../shared/components/ui/DrawerPanel'
import { listClasses } from '../../../../services/classes/ClasseServices'
import { assignClassesToTeacher } from '../../../../services/professeurs/teacherService'

export function AssignClassesDrawer({ teacher, open, onClose, onSuccess }) {
  const [classes, setClasses] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [niveauFiltre, setNiveauFiltre] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setLoading(true)
    listClasses()
      .then((data) => setClasses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [open])

  const niveauxDisponibles = useMemo(() => {
    return [...new Set(classes.map((c) => c.niveau))].filter(Boolean)
  }, [classes])

  const classesFiltrees = useMemo(() => {
    if (!niveauFiltre) return classes
    return classes.filter((c) => c.niveau === niveauFiltre)
  }, [classes, niveauFiltre])

  useEffect(() => {
    if (!teacher) return
    const current = teacher.classes ?? teacher.enseignantClasses ?? []
    setSelectedIds(current.map((classe) => classe.id))
  }, [teacher])

  function toggleClasse(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((classeId) => classeId !== id)
        : [...current, id],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!teacher) return
    setSubmitting(true)
    setError('')
    try {
      await assignClassesToTeacher(teacher.id, selectedIds)
      onSuccess?.()
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DrawerPanel
      open={open}
      onClose={onClose}
      title="Attribuer des classes"
      subtitle={teacher ? `${teacher.prenom} ${teacher.nom}` : ''}
    >
      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <p>Chargement des classes...</p>
      ) : (
        <form onSubmit={handleSubmit} className="drawer-form">
          <div style={{ marginBottom: '18px' }}>
            <label className="field-label" style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
              Filtrer par niveau
            </label>
            <select
              className="field-input"
              value={niveauFiltre}
              onChange={(e) => setNiveauFiltre(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db' }}
            >
              <option value="">Tous les niveaux</option>
              {niveauxDisponibles.map((niveau) => (
                <option key={niveau} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
            {classesFiltrees.map((classe) => (
              <label
                key={classe.id}
                className="checkbox-item"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  background: selectedIds.includes(classe.id) ? 'rgba(37, 99, 235, 0.04)' : '#fff',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(classe.id)}
                  onChange={() => toggleClasse(classe.id)}
                  style={{ width: '18px', height: '18px', marginTop: '3px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {classe.nom_classe}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {classe.niveau} {classe.annee_scolaire ? `• ${classe.annee_scolaire}` : ''}
                  </span>
                </div>
              </label>
            ))}
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '10px 12px' }}>Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: '10px 12px' }}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </DrawerPanel>
  )
}
