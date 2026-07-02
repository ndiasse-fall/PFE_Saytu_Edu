import { useEffect, useState } from 'react'
import { DrawerPanel } from '../../../../shared/components/ui/DrawerPanel'
import { listClasses } from '../../../../services/classes/ClasseServices'
import { assignClassesToTeacher } from '../../../../services/professeurs/teacherService'

export function AssignClassesDrawer({ teacher, open, onClose, onSuccess }) {
  const [classes, setClasses] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    setError('')
    setLoading(true)
    listClasses()
      .then((data) => setClasses(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [open])

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
        <form onSubmit={handleSubmit}>
          <div className="checkbox-list">
            {classes.map((classe) => (
              <label key={classe.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(classe.id)}
                  onChange={() => toggleClasse(classe.id)}
                />
                {' '}
                {classe.nom_classe} ({classe.niveau})
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Annuler
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}
    </DrawerPanel>
  )
}