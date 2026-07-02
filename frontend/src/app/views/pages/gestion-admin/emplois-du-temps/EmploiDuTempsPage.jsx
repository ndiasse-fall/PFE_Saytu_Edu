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
  listMatieres,
  normalizeApiResponse,
  normalizeEdtPayload
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
  niveau: '',
  id_classe: '',
  id_enseignant: '',
  id_matiere: '',
  jour: '',
}

export function EmploiDuTempsPage() {
  const { user } = useAuth()

  const isAdmin = useMemo(() => user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN', [user])
  const isEnseignant = useMemo(() => user?.role === 'ENSEIGNANT', [user])
  const isEleve = useMemo(() => user?.role === 'ELEVE', [user])

  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [matieres, setMatieres] = useState([])

  const [filters, setFilters] = useState(initialFilters)
  const [viewMode, setViewMode] = useState('calendar')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('closed')
  const [selectedSession, setSelectedSession] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const niveauxDisponibles = useMemo(() => {
    if (!Array.isArray(classes) || classes.length === 0) return []
    return [...new Set(classes.map(c => c?.niveau).filter(Boolean))]
  }, [classes])

  const classesFiltreesParNiveau = useMemo(() => {
    if (!Array.isArray(classes)) return []
    if (!filters.niveau) return classes
    return classes.filter(c => String(c?.niveau) === String(filters.niveau))
  }, [classes, filters.niveau])

  const loadFormData = useCallback(async () => {
    try {
      const [classesRes, teachersRes, matieresRes] = await Promise.all([
        listClasses().catch(() => ({ data: [] })),
        listTeachers().catch(() => ({ data: [] })),
        listMatieres().catch(() => ({ data: [] }))
      ])
      setClasses(classesRes?.data?.data ?? classesRes?.data ?? classesRes ?? [])
      setTeachers(teachersRes?.data?.data ?? teachersRes?.data ?? teachersRes ?? [])
      setMatieres(matieresRes?.data?.data ?? matieresRes?.data ?? matieresRes ?? [])
    } catch (err) {
      console.error(err)
    }
  }, [])

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listEmplois(filters)
      const extractedData = normalizeApiResponse(response)
      setSessions(Array.isArray(extractedData) ? extractedData : [])
    } catch (err) {
      setError(err.message || "Impossible de charger l'emploi du temps.")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadFormData()
  }, [loadFormData])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const filteredSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return []

    return sessions.filter((session) => {
      if (!session) return false

      if (isEleve) {
        if (user?.id_classe && String(session.id_classe) !== String(user.id_classe)) return false
      }
      if (filters.id_classe && String(session.id_classe) !== String(filters.id_classe)) return false
      if (filters.id_enseignant && String(session.id_enseignant) !== String(filters.id_enseignant)) return false
      if (filters.id_matiere && String(session.id_matiere) !== String(filters.id_matiere)) return false
      if (filters.jour && String(session.jour).toLowerCase() !== String(filters.jour).toLowerCase()) return false
      
      return true
    })
  }, [sessions, filters, isEleve, user])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'niveau') updated.id_classe = ''
      return updated
    })
  }

  const handleClearFilters = () => setFilters(initialFilters)
  const resetForm = () => { setDrawerOpen(false); setDrawerMode('closed'); setSelectedSession(null); setForm(emptyForm); setFieldErrors({}); setError(''); }
  const handleCreateStart = () => { if (!isAdmin) return; setForm(emptyForm); setDrawerMode('create'); setDrawerOpen(true); }
  
  const handleSelectSlot = (slot) => { 
    if (!isAdmin) return; 
    setForm({ 
      ...emptyForm, 
      jour: slot?.jour || '',
      heure_debut: slot?.heure_debut || '',
      heure_fin: slot?.heure_fin || ''
    }); 
    setDrawerMode('create'); 
    setDrawerOpen(true); 
  }
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }
  
  const handleEditStart = (s) => { 
    if (!isAdmin) return; 
    setSelectedSession(s); 
    
    const hd = s.heure_debut ? String(s.heure_debut).substring(0, 5) : '';
    const hf = s.heure_fin ? String(s.heure_fin).substring(0, 5) : '';
    
    setForm({
      id_classe: s.id_classe || s.classe?.id || '',
      id_matiere: s.id_matiere || s.matiere?.id || '',
      id_enseignant: s.id_enseignant || s.enseignant?.id || '',
      jour: String(s.jour || '').toLowerCase().trim(),
      salle: s.salle || '',
      heure_debut: hd, 
      heure_fin: hf 
    }); 
    
    setDrawerMode('edit'); 
    setDrawerOpen(true); 
  }
  
  const handleShowDetails = (s) => { setSelectedSession(s); setDrawerMode('details'); setDrawerOpen(true); }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    setSubmitting(true)
    setError('')
    setFieldErrors({})
    
    try {
      let hd = form.heure_debut ? String(form.heure_debut).trim() : '';
      let hf = form.heure_fin ? String(form.heure_fin).trim() : '';

      if (hd.length === 5) hd = `${hd}:00`;
      if (hf.length === 5) hf = `${hf}:00`;

      // Nettoyage robuste du jour de la semaine
      let jourNettoye = String(form.jour || '').toLowerCase().trim();
      const joursValides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
      const jourTrouve = joursValides.find(j => jourNettoye.includes(j));
      if (jourTrouve) jourNettoye = jourTrouve;

      // Extraction stricte des IDs pour éviter d'envoyer des [object Object] au serveur Laravel
      const extractId = (field) => {
        if (!field) return null;
        if (typeof field === 'object') return field.id || null;
        return String(field).trim() !== '' ? Number(field) : null;
      };

      const payload = { 
        id_classe: extractId(form.id_classe), 
        id_matiere: extractId(form.id_matiere), 
        id_enseignant: extractId(form.id_enseignant),
        jour: jourNettoye,
        heure_debut: hd,
        heure_fin: hf,
        salle: form.salle ? String(form.salle).trim() : ''
      }

      if (!payload.id_classe || !payload.id_matiere || !payload.id_enseignant || !payload.jour || !payload.heure_debut || !payload.heure_fin) {
        throw new Error("Champs requis manquants. Veuillez vérifier la saisie.");
      }

      const normalizedPayload = normalizeEdtPayload(payload)

      if (drawerMode === 'edit' && selectedSession) {
        await updateEmploi(selectedSession.id, normalizedPayload)
        setSuccess('Séance mise à jour avec succès !')
      } else {
        await createEmploi(normalizedPayload)
        setSuccess('Séance créée avec succès !')
      }
      
      resetForm()
      await loadSessions()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error("Erreur d'envoi complète :", err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      const validationErrors = err.response?.data?.errors;
      
      if (validationErrors) {
        const messages = Object.values(validationErrors).flat().join(' ');
        setError(`Validation : ${messages}`);
        setFieldErrors(validationErrors);
      } else if (backendMessage) {
        setError(`Serveur : ${backendMessage}`);
      } else {
        setError(`Échec réseau : ${err.message || "Impossible de joindre le serveur PHP"}`);
      }
    } finally { 
      setSubmitting(false) 
    }
  }

  const handleDelete = async (id) => {
    if (!isAdmin || !window.confirm('Supprimer cette séance ?')) return
    try { 
      await deleteEmploi(id)
      setSuccess('Séance supprimée avec succès !')
      resetForm()
      await loadSessions()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { 
      setError(err.message) 
    }
  }

  return (
    <section className="page-section users-page">
      {error && <div className="alert alert-error" style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: '500' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: '500' }}>{success}</div>}

      <header className="users-page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Mon emploi du temps</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            {isAdmin && "Gestion globale des cours"} 
            {isEnseignant && "Consultez votre planning de cours personnel pour la semaine."} 
            {isEleve && "Planning des cours de votre classe."}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="toggle-group" style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button type="button" onClick={() => setViewMode('calendar')} style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'calendar' ? '#2563eb' : 'transparent', color: viewMode === 'calendar' ? '#fff' : 'inherit' }}>Calendrier</button>
            <button type="button" onClick={() => setViewMode('list')} style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'list' ? '#2563eb' : 'transparent', color: viewMode === 'list' ? '#fff' : 'inherit' }}>Liste</button>
          </div>
          {isAdmin && <button type="button" className="users-page-add-button" onClick={handleCreateStart} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Ajouter</button>}
        </div>
      </header>

      {viewMode === 'calendar' ? (
        <EmploiDuTempsCalendar 
          sessions={filteredSessions} 
          filters={filters} 
          classes={classesFiltreesParNiveau} 
          niveauxDisponibles={niveauxDisponibles} 
          teachers={teachers} 
          matieres={matieres} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters} 
          onShow={handleShowDetails} 
          isAdmin={isAdmin} 
          onSelectSlot={handleSelectSlot} 
          user={user} 
        />
      ) : (
        <EmploiDuTempsList 
          sessions={filteredSessions} 
          loading={loading} 
          filters={filters} 
          classes={classesFiltreesParNiveau} 
          niveauxDisponibles={niveauxDisponibles} 
          teachers={teachers} 
          matieres={matieres} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters} 
          onShow={handleShowDetails} 
          onEdit={handleEditStart} 
          onDelete={handleDelete} 
          isAdmin={isAdmin} 
          user={user} 
        />
      )}

      <DrawerPanel open={drawerOpen} onClose={resetForm} title={drawerMode === 'create' ? 'Créer' : drawerMode === 'edit' ? 'Modifier' : 'Détails'}>
        {drawerMode === 'details' ? (
          <EmploiDuTempsDetails session={selectedSession} onEdit={handleEditStart} onDelete={handleDelete} onClose={resetForm} isAdmin={isAdmin} />
        ) : (
          <EmploiDuTempsForm mode={drawerMode} form={form} classes={classes} teachers={teachers} matieres={matieres} fieldErrors={fieldErrors} error={error} submitting={submitting} onInputChange={handleInputChange} onSubmit={handleSubmit} onCancel={resetForm} />
        )}
      </DrawerPanel>
    </section>
  )
}

export default EmploiDuTempsPage;