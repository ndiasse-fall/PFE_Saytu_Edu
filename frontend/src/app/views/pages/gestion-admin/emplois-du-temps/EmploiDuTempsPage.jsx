import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '../../../../core/context/useAuth'
import { DrawerPanel } from '../../../../shared/components/ui/DrawerPanel'
import {
  listEmplois,
  createEmploi,
  updateEmploi,
  deleteEmploi,
  listClasses,
  listTeachers,
  listMatieres
} from '../../../../services/emplois-du-temps/emploiDuTempsService'
import { EmploiDuTempsCalendar } from './components/EmploiDuTempsCalendar'
import { EmploiDuTempsList } from './components/EmploiDuTempsList'
import { EmploiDuTempsForm } from './components/EmploiDuTempsForm'
import { EmploiDuTempsDetails } from './components/EmploiDuTempsDetails'

const emptyForm = {
  id_classe: '',
  id_matiere: '',
  id_enseignant: '',
  jour: '',
  heure_debut: '',
  heure_fin: '',
  salle: '',
}

const initialFilters = {
  id_classe: '',
  id_enseignant: '',
  id_matiere: '',
  jour: '',
}

export default function EmploiDuTempsPage() {
  const { user } = useAuth()

  // 🛡️ DÉFINITION STRICTE DES DROITS ET RÔLES
  const isAdmin = useMemo(() => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  }, [user])

  const isEnseignant = useMemo(() => user?.role === 'ENSEIGNANT', [user])
  const isEleve = useMemo(() => user?.role === 'ELEVE', [user])

  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [matieres, setMatieres] = useState([])

  const [filters, setFilters] = useState(initialFilters)
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('closed') // 'create', 'edit', 'details'
  const [selectedSession, setSelectedSession] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Charger les données des listes déroulantes (Seulement pour l'Admin pour la gestion ou filtres généraux)
  const loadFormData = useCallback(async () => {
    try {
      const [classesRes, teachersRes, matieresRes] = await Promise.all([
        listClasses(),
        listTeachers(),
        listMatieres()
      ])
      setClasses(classesRes.data ?? classesRes)
      setTeachers(teachersRes.data ?? teachersRes)
      setMatieres(matieresRes.data ?? matieresRes)
    } catch (err) {
      console.error('Erreur de chargement des données de formulaire:', err)
    }
  }, [])

  // Charger les séances (Laravel filtre déjà selon le token du rôle connecté !)
  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listEmplois()
      const extractedData = response.data?.data ?? response.data ?? response ?? []
      setSessions(Array.isArray(extractedData) ? extractedData : [])
    } catch (err) {
      setError(err.message || "Impossible de charger l'emploi du temps.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
    if (isAdmin) {
      loadFormData() // On ne charge les données globales que si c'est un Admin
    }
  }, [loadSessions, loadFormData, isAdmin])

  // Filtrage local (Utile principalement pour l'Admin pour naviguer)
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (filters.id_classe && String(session.id_classe) !== String(filters.id_classe)) {
        return false
      }
      if (filters.id_enseignant && String(session.id_enseignant) !== String(filters.id_enseignant)) {
        return false
      }
      if (filters.id_matiere && String(session.id_matiere) !== String(filters.id_matiere)) {
        return false
      }
      if (filters.jour && session.jour !== filters.jour) {
        return false
      }
      return true
    })
  }, [sessions, filters])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleClearFilters = () => {
    setFilters(initialFilters)
  }

  const resetForm = () => {
    setForm(emptyForm)
    setFieldErrors({})
    setDrawerOpen(false)
    setDrawerMode('closed')
    setSelectedSession(null)
  }

  const handleCreateStart = () => {
    if (!isAdmin) return // Sécurité UI
    setForm(emptyForm)
    setFieldErrors({})
    setError('')
    setSuccess('')
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const handleSelectSlot = (slotData) => {
    if (!isAdmin) return // Seul l'admin peut cliquer sur une case vide pour créer
    setError('')
    setSuccess('')
    setFieldErrors({})
    setForm({
      ...emptyForm,
      jour: slotData.jour,
      heure_debut: slotData.heure_debut,
      heure_fin: slotData.heure_fin,
    })
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    return parts.slice(0, 2).join(':')
  }

  const handleEditStart = (session) => {
    if (!isAdmin) return // Seul l'admin peut modifier
    setError('')
    setSuccess('')
    setFieldErrors({})
    setSelectedSession(session)
    setForm({
      id_classe: session.id_classe ?? '',
      id_matiere: session.id_matiere ?? '',
      id_enseignant: session.id_enseignant ?? '',
      jour: session.jour ?? '',
      heure_debut: formatTime(session.heure_debut),
      heure_fin: formatTime(session.heure_fin),
      salle: session.salle ?? '',
    })
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const handleShowDetails = (session) => {
    setError('')
    setSuccess('')
    setSelectedSession(session)
    setDrawerMode('details')
    setDrawerOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isAdmin) return

    setSubmitting(true)
    setFieldErrors({})
    setError('')
    setSuccess('')

    const payload = {
      id_classe: Number(form.id_classe),
      id_matiere: Number(form.id_matiere),
      id_enseignant: Number(form.id_enseignant),
      jour: form.jour,
      heure_debut: form.heure_debut,
      heure_fin: form.heure_fin,
      salle: form.salle,
    }

    try {
      if (drawerMode === 'edit' && selectedSession) {
        await updateEmploi(selectedSession.id, payload)
        setSuccess('Séance mise à jour avec succès.')
      } else {
        await createEmploi(payload)
        setSuccess('Séance planifiée avec succès.')
      }
      resetForm()
      await loadSessions()
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.')
      setFieldErrors(err.details ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin) return
    if (!window.confirm('Voulez-vous vraiment supprimer cette séance ?')) {
      return
    }

    setError('')
    setSuccess('')
    try {
      await deleteEmploi(id)
      setSuccess('Séance supprimée avec succès.')
      resetForm()
      await loadSessions()
    } catch (err) {
      setError(err.message || 'Impossible de supprimer la séance.')
    }
  }

  return (
    <section className="page-section users-page">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <header className="users-page-header" style={{ marginBottom: '24px' }}>
        <div className="users-page-heading">
          <h2>Emploi du temps</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            {isAdmin && "Planification, gestion et publication des séances de cours hebdomadaires"}
            {isEnseignant && "Consultation de votre planning individuel de cours"}
            {isEleve && "Consultation du planning de cours de votre classe"}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="toggle-group" style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500',
                backgroundColor: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'calendar' ? '#ffffff' : 'var(--text)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <i className="bi bi-calendar-week"></i> Calendrier
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500',
                backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <i className="bi bi-list-task"></i> Liste
            </button>
          </div>

          {/* 🛡️ BOUTON AJOUTER : Visible UNIQUEMENT par l'Admin */}
          {isAdmin && (
            <button
              type="button"
              className="users-page-add-button"
              onClick={handleCreateStart}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="bi bi-plus-circle"></i> Ajouter séance
            </button>
          )}
        </div>
      </header>

      {viewMode === 'calendar' ? (
        <EmploiDuTempsCalendar
          sessions={filteredSessions}
          filters={filters}
          classes={classes}
          teachers={teachers}
          matieres={matieres}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onShow={handleShowDetails}
          isAdmin={isAdmin} // Transmet si l'user est admin pour activer le clic d'ajout
          onSelectSlot={handleSelectSlot}
          user={user}
        />
      ) : (
        <EmploiDuTempsList
          sessions={filteredSessions}
          loading={loading}
          filters={filters}
          classes={classes}
          teachers={teachers}
          matieres={matieres}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onShow={handleShowDetails}
          onEdit={handleEditStart}
          onDelete={handleDelete}
          isAdmin={isAdmin} // Masque les boutons d'action d'édition dans la liste si pas admin
          user={user}
        />
      )}

      <DrawerPanel
        open={drawerOpen}
        onClose={resetForm}
        title={
          drawerMode === 'create' ? 'Planifier une séance' : drawerMode === 'edit' ? 'Modifier la séance' : 'Détails de la séance'
        }
        headerAction={
          <button type="button" className="ghost-button" onClick={resetForm}>Fermer</button>
        }
      >
        {drawerMode === 'details' ? (
          <EmploiDuTempsDetails
            session={selectedSession}
            onEdit={handleEditStart}
            onDelete={handleDelete}
            onClose={resetForm}
            isAdmin={isAdmin} // L'enseignant/élève verra les détails mais pas les boutons Supprimer/Modifier
          />
        ) : (
          <EmploiDuTempsForm
            mode={drawerMode}
            form={form}
            classes={classes}
            teachers={teachers}
            matieres={matieres}
            fieldErrors={fieldErrors}
            error={error}
            submitting={submitting}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        )}
      </DrawerPanel>
    </section>
  )
}
export { EmploiDuTempsPage }