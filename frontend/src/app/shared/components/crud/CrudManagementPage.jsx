import { useCallback, useEffect, useState } from 'react'
import { DrawerPanel } from '../ui/DrawerPanel'
import { CrudForm } from './CrudForm'
import { CrudTable } from './CrudTable'

function buildForm(fields, item = null) {
  return Object.fromEntries(fields.map((field) => {
    if (!item) {
      return [field.name, field.defaultValue ?? (field.type === 'checkbox' ? false : '')]
    }

    const sourceValue = field.fromItem
      ? field.fromItem(item)
      : item[field.name]

    return [
      field.name,
      sourceValue ?? field.defaultValue ?? (field.type === 'checkbox' ? false : ''),
    ]
  }))
}

function buildPayload(fields, form, isEditing) {
  return Object.fromEntries(fields.flatMap((field) => {
    if (field.readOnly || (isEditing && field.omitOnEdit && !form[field.name])) {
      return []
    }

    const value = field.toPayload
      ? field.toPayload(form[field.name], form)
      : form[field.name]

    return [[field.payloadKey ?? field.name, value]]
  }))
}

function normalizeDefaultList(response, fallbackPerPage) {
  const isPaginated = Array.isArray(response?.data)
    && (
      response.current_page !== undefined
      || response.total !== undefined
      || response.last_page !== undefined
    )

  return {
    items: Array.isArray(response) ? response : response?.data ?? [],
    pagination: isPaginated
      ? {
          total: response.total ?? 0,
          perPage: response.per_page ?? fallbackPerPage,
          currentPage: response.current_page ?? 1,
          lastPage: response.last_page ?? 1,
        }
      : null,
  }
}

export function CrudManagementPage({
  config,
  service,
  permissions = {},
}) {
  const {
    title,
    singularLabel,
    pluralLabel,
    fields,
    columns,
    filterFields = [],
    initialFilters = {},
    details = columns,
    perPage = 15,
    normalizeList,
  } = config

  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [form, setForm] = useState(() => buildForm(fields))
  const [mode, setMode] = useState('closed')
  const [editingId, setEditingId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const isEditing = mode === 'edit'
  const isFormOpen = mode !== 'closed'
  const canCreate = permissions.create !== false
  const canEdit = permissions.edit !== false
  const canDelete = permissions.delete !== false
  const canShow = permissions.show !== false

  const loadData = useCallback(async (
    nextFilters = initialFilters,
    page = 1,
    nextPerPage = perPage,
  ) => {
    setLoading(true)
    setError('')

    try {
      const response = await service.list({
        ...nextFilters,
        page,
        perPage: nextPerPage,
      })
      const normalized = normalizeList
        ? normalizeList(response)
        : normalizeDefaultList(response, nextPerPage)
      setItems(normalized.items ?? [])
      setPagination(normalized.pagination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [initialFilters, normalizeList, perPage, service])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadData])

  function closeForm() {
    setMode('closed')
    setEditingId(null)
    setForm(buildForm(fields))
    setFieldErrors({})
  }

  function openCreate() {
    setForm(buildForm(fields))
    setMode('create')
    setEditingId(null)
    setSelectedItem(null)
    setFieldErrors({})
    setError('')
    setSuccess('')
  }

  function openEdit(item) {
    setForm(buildForm(fields, item))
    setMode('edit')
    setEditingId(item.id)
    setSelectedItem(null)
    setFieldErrors({})
    setError('')
    setSuccess('')
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

    try {
      const payload = buildPayload(fields, form, isEditing)

      if (isEditing) {
        await service.update(editingId, payload)
        setSuccess(`${singularLabel} modifié avec succès.`)
      } else {
        await service.create(payload)
        setSuccess(`${singularLabel} créé avec succès.`)
      }

      closeForm()
      await loadData(
        filters,
        pagination?.currentPage ?? 1,
        pagination?.perPage ?? perPage,
      )
    } catch (requestError) {
      setError(requestError.message)
      setFieldErrors(requestError.details ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  async function handleShow(item) {
    try {
      const response = service.show
        ? await service.show(item.id)
        : item
      setSelectedItem(response.data ?? response)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Supprimer ${singularLabel.toLowerCase()} ?`)) {
      return
    }

    try {
      await service.remove(item.id)
      setSelectedItem((current) => current?.id === item.id ? null : current)
      setSuccess(`${singularLabel} supprimé avec succès.`)
      await loadData(
        filters,
        pagination?.currentPage ?? 1,
        pagination?.perPage ?? perPage,
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function getActions(item) {
    return [
      ...(canShow
        ? [{ label: 'Voir', onClick: () => void handleShow(item) }]
        : []),
      ...(canEdit
        ? [{ label: 'Modifier', onClick: () => openEdit(item) }]
        : []),
      ...(canDelete
        ? [{
            label: 'Supprimer',
            onClick: () => void handleDelete(item),
            danger: true,
          }]
        : []),
    ]
  }

  async function applyFilters(event) {
    event.preventDefault()
    await loadData(filters, 1, pagination?.perPage ?? perPage)
  }

  async function clearFilters() {
    setFilters(initialFilters)
    await loadData(initialFilters, 1, pagination?.perPage ?? perPage)
  }

  return (
    <section className="page-section">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          <span className="muted">{pluralLabel}</span>
        </div>
        {canCreate && !isFormOpen ? (
          <button type="button" onClick={openCreate}>
            Ajouter {singularLabel.toLowerCase()}
          </button>
        ) : null}
      </header>

      <CrudTable
        items={items}
        columns={columns}
        loading={loading}
        emptyMessage={`Aucun ${singularLabel.toLowerCase()} trouvé.`}
        filters={filters}
        filterFields={filterFields}
        pagination={pagination}
        getActions={getActions}
        onFilterChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onClearFilters={() => void clearFilters()}
        onPageChange={(page) => void loadData(
          filters,
          page,
          pagination?.perPage ?? perPage,
        )}
        onRowsPerPageChange={(rows) => void loadData(filters, 1, rows)}
      />

      <DrawerPanel
        open={isFormOpen}
        onClose={closeForm}
        title={isEditing
          ? `Modifier ${singularLabel.toLowerCase()}`
          : `Ajouter ${singularLabel.toLowerCase()}`}
      >
        <CrudForm
          fields={fields}
          form={form}
          fieldErrors={fieldErrors}
          submitting={submitting}
          isEditing={isEditing}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </DrawerPanel>

      <DrawerPanel
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title={`Détails ${singularLabel.toLowerCase()}`}
      >
        {selectedItem ? (
          <dl>
            {details.map((detail) => {
              const value = detail.render
                ? detail.render(
                    detail.key.split('.').reduce(
                      (current, part) => current?.[part],
                      selectedItem,
                    ),
                    selectedItem,
                  )
                : detail.key.split('.').reduce(
                    (current, part) => current?.[part],
                    selectedItem,
                  )

              return (
                <div key={detail.key}>
                  <dt>{detail.label}</dt>
                  <dd>{value ?? 'Non renseigné'}</dd>
                </div>
              )
            })}
          </dl>
        ) : null}
      </DrawerPanel>
    </section>
  )
}
