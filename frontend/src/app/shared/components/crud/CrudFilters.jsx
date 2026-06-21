import { FilterToolbar } from '../ui/FilterToolbar'

export function CrudFilters({
  fields,
  filters,
  onChange,
  onApply,
  onClear,
}) {
  if (!fields?.length) {
    return null
  }

  return (
    <FilterToolbar>
      <form className="form-grid" onSubmit={onApply}>
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.type === 'select' ? (
              <select
                name={field.name}
                value={filters[field.name] ?? ''}
                onChange={onChange}
              >
                <option value="">{field.placeholder ?? 'Tous'}</option>
                {(field.options ?? []).map((option) => {
                  const normalized = typeof option === 'object'
                    ? option
                    : { value: option, label: option }

                  return (
                    <option key={normalized.value} value={normalized.value}>
                      {normalized.label}
                    </option>
                  )
                })}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type ?? 'search'}
                value={filters[field.name] ?? ''}
                onChange={onChange}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}

        <div className="form-actions full-width">
          <button type="submit">Filtrer</button>
          <button type="button" className="ghost-button" onClick={onClear}>
            Réinitialiser
          </button>
        </div>
      </form>
    </FilterToolbar>
  )
}
