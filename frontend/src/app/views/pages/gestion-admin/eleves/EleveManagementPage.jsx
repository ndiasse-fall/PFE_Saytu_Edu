import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createEleve,
  deleteEleve,
  inscrireDansClasse,
  listClasses,
  listEleves,
  toggleEleveStatus,
  updateEleve,
} from '../../../../services/eleves/eleveService'
import { DrawerPanel } from '../../../../shared/components/ui/DrawerPanel'
import { KpiCard } from '../../../../shared/components/ui/KpiCard'
import { EleveForm } from './eleve-form/EleveForm'
import { InscrireEleveForm } from './inscrire-form/InscrireEleveForm'
import { ListeEleves } from './liste-eleves/ListeEleves'

const emptyForm = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  telephone: '',
  date_naissance: '',
  telephone_parent: '',
  adresse: '',
  actif: true,
}

const initialFilters = { search: '', actif: '' }

export function EleveManagementPage() {
  const navigate = useNavigate()
  const [eleves, setEleves] = useState([])
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [form, setForm] = useState(emptyForm)
  const [formMode, setFormMode] = useState('closed')
  const [editingEleveId, setEditingEleveId] = useState(null)
  const [selectedEleve, setSelectedEleve] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClasseId, setSelectedClasseId] = useState('')
  const [showInscription, setShowInscription] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const isEditing = useMemo(() => formMode === 'edit' && editingEleveId !== null, [editingEleveId, formMode])
  const isFormOpen = useMemo(() => formMode !== 'closed', [formMode])

  const kpis = useMemo(() => {
    return [
      { label: 'Total Élèves', value: pagination?.total ?? eleves.length, icon: 'bi-people-fill' },
      { label: 'Affichés', value: eleves.length, icon: 'bi-table' },
    ]
  }, [pagination?.total, eleves.length])

  const loadData = useCallback(async (nextFilters = null, page = null, perPage = null) => {
    setLoading(true)
    setError('')

    const activeFilters = nextFilters || filters
    const activePage = page || pagination?.currentPage || 1
    const activePerPage = perPage || pagination?.perPage || 15

    try {
      const data = await listEleves({ ...activeFilters, page: activePage, perPage: activePerPage })
      setEleves(data.data ?? [])
      setPagination({
        total: data.total ?? 0,
        perPage: data.per_page ?? 15,
        currentPage: data.current_page ?? 1,
        lastPage: data.last_page ?? 1,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination?.currentPage, pagination?.perPage])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(initialFilters, 1, 15)
    // On ne veut exécuter cela qu'au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function resetForm() {
    setForm(emptyForm)
    setFormMode('closed')
    setEditingEleveId(null)
    setFieldErrors({})
  }

  function handleCreateStart() {
    setForm(emptyForm)
    setFormMode('create')
    setEditingEleveId(null)
    setSelectedEleve(null)
    setFieldErrors({})
    setSuccess('')
    setError('')
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setError('')
    setSuccess('')

    const payload = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone || null,
      date_naissance: form.date_naissance || null,
      telephone_parent: form.telephone_parent || null,
      adresse: form.adresse || null,
      actif: form.actif,
    }

    if (form.password) {
      payload.password = form.password
    }

    try {
      if (isEditing) {
        await updateEleve(editingEleveId, payload)
        setSuccess('Élève modifié avec succès.')
      } else {
        await createEleve({ ...payload, password: form.password })
        setSuccess('Élève créé avec succès.')
      }

      resetForm()
      await loadData()
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.details ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  async function handleShow(eleveId) {
    navigate(`/admin/gestion-admin/eleves/${eleveId}`)
  }

  function handleEdit(eleve) {
    setFormMode('edit')
    setEditingEleveId(eleve.id)
    setSelectedEleve(null)
    setForm({
      nom: eleve.nom ?? '',
      prenom: eleve.prenom ?? '',
      email: eleve.email ?? '',
      password: '',
      telephone: eleve.telephone ?? '',
      date_naissance: eleve.date_naissance ? eleve.date_naissance.split('T')[0] : '',
      telephone_parent: eleve.telephone_parent ?? '',
      adresse: eleve.adresse ?? '',
      actif: Boolean(eleve.actif),
    })
    setFieldErrors({})
    setSuccess('')
    setError('')
  }

  async function handleInscrireStart(eleve) {
    try {
      setSelectedEleve(eleve)
      const data = await listClasses()
      setClasses(data || [])
      setShowInscription(true)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleInscriptionSubmit(event) {
    event.preventDefault()
    if (!selectedClasseId || !selectedEleve) return

    setSubmitting(true)
    try {
      await inscrireDansClasse(selectedClasseId, selectedEleve.id)
      setSuccess(`L'élève ${selectedEleve.prenom} a été inscrit à la classe avec succès.`)
      setShowInscription(false)
      setSelectedEleve(null)
      setSelectedClasseId('')
      // Rafraîchir explicitement avec les filtres actuels
      loadData(filters, pagination?.currentPage || 1, pagination?.perPage || 15)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }


  function closeInscription() {
    setShowInscription(false)
    setSelectedEleve(null)
    setSelectedClasseId('')
  }

  async function handleDelete(eleveId) {
    if (!window.confirm('Supprimer cet élève ?')) {
      return
    }

    try {
      await deleteEleve(eleveId)
      if (selectedEleve?.id === eleveId) setSelectedEleve(null)
      if (editingEleveId === eleveId) resetForm()
      setSuccess('Élève supprimé avec succès.')
      // Rafraîchir explicitement
      loadData(filters, pagination?.currentPage || 1, pagination?.perPage || 15)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggle(eleveId) {
    try {
      const data = await toggleEleveStatus(eleveId)
      setEleves((current) => current.map((eleve) => (eleve.id === eleveId ? data.data : eleve)))
      if (selectedEleve?.id === eleveId) setSelectedEleve(data.data)
      setSuccess('Statut élève mis à jour avec succès.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function applyFilters(event) {
    event.preventDefault()
    await loadData(filters, 1, pagination?.perPage ?? 15)
  }

  async function clearFilters() {
    const reset = initialFilters
    setFilters(reset)
    await loadData(reset, 1, pagination?.perPage ?? 15)
  }

  async function changePage(page) {
    if (loading || page < 1 || page > (pagination?.lastPage ?? 1)) {
      return
    }
    await loadData(filters, page, pagination?.perPage ?? 15)
  }

  async function changeRowsPerPage(perPage) {
    if (loading) return
    await loadData(filters, 1, perPage)
  }

  return (
    <section className="page-section users-page">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <header className="users-page-header">
        <div className="users-page-heading">
          <h2>Gestion des élèves</h2>
        </div>
        {!isFormOpen ? (
          <button type="button" className="users-page-add-button" onClick={handleCreateStart}>
            Ajouter un élève
          </button>
        ) : null}
      </header>

      <section className="users-kpi-grid" aria-label="Indicateurs élèves">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <ListeEleves
        eleves={eleves}
        loading={loading}
        filters={filters}
        pagination={pagination}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        onShow={handleShow}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onInscrire={handleInscrireStart}
        onPageChange={changePage}
        onRowsPerPageChange={changeRowsPerPage}
      />

      {/* Formulaire Ajout/Modif */}
      <DrawerPanel
        open={isFormOpen}
        onClose={resetForm}
        title={isEditing ? 'Modifier un élève' : 'Ajouter un élève'}
        headerAction={
          <button type="button" className="ghost-button" onClick={resetForm}>
            Fermer
          </button>
        }
      >
        <EleveForm
          mode={formMode}
          form={form}
          fieldErrors={fieldErrors}
          submitting={submitting}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </DrawerPanel>

      {/* Inscription dans une classe */}
      <DrawerPanel
        open={showInscription}
        onClose={closeInscription}
        width={520}
        title="Affectation à une classe"
        headerAction={
          <button type="button" className="ghost-button" onClick={closeInscription}>
            Fermer
          </button>
        }
      >
        <InscrireEleveForm
          eleve={selectedEleve}
          classes={classes}
          selectedClasse={selectedClasseId}
          submitting={submitting}
          onClasseChange={(e) => setSelectedClasseId(e.target.value)}
          onSubmit={handleInscriptionSubmit}
          onCancel={closeInscription}
        />
      </DrawerPanel>
    </section>
  )
}
