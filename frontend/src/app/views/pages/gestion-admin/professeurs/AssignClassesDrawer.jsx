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
          {/* Section Filtre stylisée */}
          <div className="filter-section" style={{ marginBottom: '20px' }}>
            <label className="field-label" style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              Filtrer par niveau
            </label>
            <select 
              className="field-input" 
              value={niveauFiltre} 
              onChange={(e) => setNiveauFiltre(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">Tous les niveaux</option>
              {niveauxDisponibles.map((niveau) => (
                <option key={niveau} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>

          {/* Liste des classes avec flex pour l'alignement */}
          <div className="checkbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {classesFiltrees.map((classe) => (
              <label key={classe.id} className="checkbox-item" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                cursor: 'pointer',
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0' 
              }}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(classe.id)}
                  onChange={() => toggleClasse(classe.id)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '14px', color: '#333' }}>
                  {classe.nom_classe} ({classe.niveau})
                </span>
              </label>
            ))}
          </div>

          <div className="form-actions" style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>Annuler</button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </DrawerPanel>
  )
}