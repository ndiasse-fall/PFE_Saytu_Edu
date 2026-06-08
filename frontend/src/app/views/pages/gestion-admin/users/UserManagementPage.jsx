import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createUser,
  deleteUser,
  listUsers,
  showUser,
  toggleUserStatus,
  updateUser,
} from '../../../../services/user/userService'
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

export function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState({ search: '', role: '', actif: '' })
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
    const activeCount = users.filter((user) => user.actif).length
    const inactiveCount = users.length - activeCount

    return [
      { label: 'Total', value: pagination?.total ?? users.length, icon: 'bi-people-fill' },
      { label: 'Affichés', value: users.length, icon: 'bi-table' },
      { label: 'Actifs', value: activeCount, icon: 'bi-check-circle-fill' },
      { label: 'Inactifs', value: inactiveCount, icon: 'bi-pause-circle-fill' },
    ]
  }, [pagination?.total, users])

  const loadData = useCallback(async (nextFilters = filters) => {
    setLoading(true)
    setError('')

    try {
      const data = await listUsers(nextFilters)
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
  }, [filters])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadData])

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
      await loadData()
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
      await loadData()
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
    } catch (err) {
      setError(err.message)
    }
  }

  async function applyFilters(event) {
    event.preventDefault()
    await loadData(filters)
  }

  async function clearFilters() {
    const reset = { search: '', role: '', actif: '' }
    setFilters(reset)
    await loadData(reset)
  }

  return (
    <section className="page-section users-page">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <section className="users-kpi-grid" aria-label="Indicateurs utilisateur">
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

      <ListeUsers
        users={users}
        pagination={pagination}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
        onShow={handleShow}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onCreate={handleCreateStart}
        canCreate={!isFormOpen}
      />

      {(isFormOpen || selectedUser) ? (
        <>
          <button
            type="button"
            className="users-drawer-backdrop"
            aria-label="Fermer le panneau"
            onClick={isFormOpen ? resetForm : closeDetails}
          />

          {isFormOpen ? (
            <aside className="users-drawer users-drawer-form" aria-label={isEditing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}>
              <UserForm
                mode={formMode}
                form={form}
                fieldErrors={fieldErrors}
                submitting={submitting}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onCancel={resetForm}
              />
            </aside>
          ) : null}

          {selectedUser ? (
            <aside className="users-drawer users-drawer-details" aria-label="Détails utilisateur">
              <section className="panel users-drawer-panel">
                <div className="panel-header">
                  <div>
                    <h2>Détails utilisateur</h2>
                    <p className="muted">Consultation rapide sans quitter le tableau.</p>
                  </div>
                  <button type="button" className="ghost-button" onClick={closeDetails}>
                    Fermer
                  </button>
                </div>
                <div className="users-details-grid">
                  <div><span className="detail-label">Identifiant</span><strong>#{selectedUser.id}</strong></div>
                  <div><span className="detail-label">Nom complet</span><strong>{selectedUser.prenom} {selectedUser.nom}</strong></div>
                  <div><span className="detail-label">Email</span><strong>{selectedUser.email}</strong></div>
                  <div><span className="detail-label">Téléphone</span><strong>{selectedUser.telephone || 'Non renseigné'}</strong></div>
                  <div><span className="detail-label">Adresse</span><strong>{selectedUser.adresse || 'Non renseignée'}</strong></div>
                  <div><span className="detail-label">Rôle</span><strong>{selectedUser.role}</strong></div>
                  <div><span className="detail-label">Statut</span><strong>{selectedUser.actif ? 'Actif' : 'Inactif'}</strong></div>
                </div>
              </section>
            </aside>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
