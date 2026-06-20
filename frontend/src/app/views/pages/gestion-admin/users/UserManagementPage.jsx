import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createUser,
  deleteUser,
  getDashboardSummary,
  listUsers,
  showUser,
  toggleUserStatus,
  updateUser,
} from '../../../../services/user/userService'
import { DrawerPanel } from '../../../../shared/components/ui/DrawerPanel'
import { KpiCard } from '../../../../shared/components/ui/KpiCard'
import { ListeUsers } from './liste-users/ListeUsers'
import { UserForm } from './user-form/UserForm'

const emptyForm = {
  nom: '',
  prenom: '',
  email: '',
  password: '',
  telephone: '',
  adresse: '',
  role: 'ELEVE',
  actif: true,
}

const initialFilters = { search: '', role: '', actif: '' }

export function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [form, setForm] = useState(emptyForm)
  const [formMode, setFormMode] = useState('closed')
  const [editingUserId, setEditingUserId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const isEditing = useMemo(() => formMode === 'edit' && editingUserId !== null, [editingUserId, formMode])
  const isFormOpen = useMemo(() => formMode !== 'closed', [formMode])
  const kpis = useMemo(() => {
    return [
      { label: 'Total', value: summary?.total ?? pagination?.total ?? users.length, icon: 'bi-people-fill' },
      { label: 'Affichés', value: users.length, icon: 'bi-table' },
      { label: 'Actifs', value: summary?.actifs ?? 0, icon: 'bi-check-circle-fill' },
      { label: 'Inactifs', value: summary?.inactifs ?? 0, icon: 'bi-pause-circle-fill' },
    ]
  }, [pagination?.total, summary, users.length])

  const loadSummary = useCallback(async () => {
    try {
      const data = await getDashboardSummary()
      setSummary(data.counts ?? null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const loadData = useCallback(async (nextFilters = initialFilters, page = 1, perPage = 15) => {
    setLoading(true)
    setError('')

    try {
      const data = await listUsers({ ...nextFilters, page, perPage })
      setUsers(data.data ?? [])
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
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void Promise.all([loadData(initialFilters), loadSummary()])
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadData, loadSummary])

  function resetForm() {
    setForm(emptyForm)
    setFormMode('closed')
    setEditingUserId(null)
    setFieldErrors({})
  }

  function handleCreateStart() {
    setForm(emptyForm)
    setFormMode('create')
    setEditingUserId(null)
    setSelectedUser(null)
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
      adresse: form.adresse || null,
      role: form.role,
      actif: form.actif,
    }

    if (form.password) {
      payload.password = form.password
    }

    try {
      if (isEditing) {
        await updateUser(editingUserId, payload)
        setSuccess('Utilisateur modifié avec succès.')
      } else {
        await createUser({ ...payload, password: form.password })
        setSuccess('Utilisateur créé avec succès.')
      }

      resetForm()
      await Promise.all([
        loadData(filters, pagination?.currentPage ?? 1, pagination?.perPage ?? 15),
        loadSummary(),
      ])
    } catch (err) {
      setError(err.message)
      setFieldErrors(err.details ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  async function handleShow(userId) {
    try {
      setFormMode('closed')
      setEditingUserId(null)
      setFieldErrors({})
      setSelectedUser(await showUser(userId))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  function handleEdit(user) {
    setFormMode('edit')
    setEditingUserId(user.id)
    setSelectedUser(null)
    setForm({
      nom: user.nom ?? '',
      prenom: user.prenom ?? '',
      email: user.email ?? '',
      password: '',
      telephone: user.telephone ?? '',
      adresse: user.adresse ?? '',
      role: user.role ?? 'ELEVE',
      actif: Boolean(user.actif),
    })
    setFieldErrors({})
    setSuccess('')
    setError('')
  }

  function closeDetails() {
    setSelectedUser(null)
  }

  async function handleDelete(userId) {
    if (!window.confirm('Supprimer cet utilisateur ?')) {
      return
    }

    try {
      await deleteUser(userId)
      if (selectedUser?.id === userId) setSelectedUser(null)
      if (editingUserId === userId) resetForm()
      setSuccess('Utilisateur supprimé avec succès.')
      await Promise.all([
        loadData(filters, pagination?.currentPage ?? 1, pagination?.perPage ?? 15),
        loadSummary(),
      ])
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleToggle(userId) {
    try {
      const data = await toggleUserStatus(userId)
      setUsers((current) => current.map((user) => (user.id === userId ? data.data : user)))
      if (selectedUser?.id === userId) setSelectedUser(data.data)
      setSuccess('Statut utilisateur mis à jour avec succès.')
      await loadSummary()
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
    if (loading) {
      return
    }

    await loadData(filters, 1, perPage)
  }

  return (
    <section className="page-section users-page">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <header className="users-page-header">
        <div className="users-page-heading">
          <h2>Gestion des utilisateurs</h2>
        </div>
        {!isFormOpen ? (
          <button type="button" className="users-page-add-button" onClick={handleCreateStart}>
            Ajouter un utilisateur
          </button>
        ) : null}
      </header>

      <section className="users-kpi-grid" aria-label="Indicateurs utilisateur">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <ListeUsers
        users={users}
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
        onPageChange={changePage}
        onRowsPerPageChange={changeRowsPerPage}
      />

      <DrawerPanel
        open={isFormOpen}
        onClose={resetForm}
        width={520}
        title={isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
        headerAction={
          <button type="button" className="ghost-button" onClick={resetForm}>
            Fermer
          </button>
        }
      >
        <UserForm
          mode={formMode}
          form={form}
          fieldErrors={fieldErrors}
          submitting={submitting}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </DrawerPanel>

      <DrawerPanel
        open={Boolean(selectedUser)}
        onClose={closeDetails}
        title="Détails utilisateur"
        subtitle="Consultation rapide sans quitter le tableau."
        headerAction={
          <button type="button" className="ghost-button" onClick={closeDetails}>
            Fermer
          </button>
        }
      >
        {selectedUser ? (
          <div className="users-details-grid">
            <div><span className="detail-label">Identifiant</span><strong>#{selectedUser.id}</strong></div>
            <div><span className="detail-label">Nom complet</span><strong>{selectedUser.prenom} {selectedUser.nom}</strong></div>
            <div><span className="detail-label">Email</span><strong>{selectedUser.email}</strong></div>
            <div><span className="detail-label">Téléphone</span><strong>{selectedUser.telephone || 'Non renseigné'}</strong></div>
            <div><span className="detail-label">Adresse</span><strong>{selectedUser.adresse || 'Non renseignée'}</strong></div>
            <div><span className="detail-label">Rôle</span><strong>{selectedUser.role}</strong></div>
            <div><span className="detail-label">Statut</span><strong>{selectedUser.actif ? 'Actif' : 'Inactif'}</strong></div>
          </div>
        ) : null}
      </DrawerPanel>
    </section>
  )
}
