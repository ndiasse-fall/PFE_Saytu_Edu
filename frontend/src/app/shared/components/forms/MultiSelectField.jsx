import { useEffect, useMemo, useRef, useState } from 'react'

function normalizeOption(option) {
  return typeof option === 'object'
    ? option
    : { value: option, label: option }
}

function normalizeValueList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item))
    : []
}

export function MultiSelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner des éléments',
  searchPlaceholder = 'Rechercher...',
  required = false,
  disabled = false,
  error = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const normalizedValue = normalizeValueList(value)

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption),
    [options],
  )

  const selectedOptions = useMemo(
    () => normalizedOptions.filter((option) => normalizedValue.includes(String(option.value))),
    [normalizedOptions, normalizedValue],
  )

  const filteredOptions = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase()

    return normalizedOptions.filter((option) => {
      const labelText = String(option.label ?? option.value ?? '').toLowerCase()
      if (!loweredQuery) return true
      return labelText.includes(loweredQuery)
    })
  }, [normalizedOptions, query])

  useEffect(() => {
    function handleOutsideClick(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const updateValue = (nextValues) => {
    onChange({
      target: {
        name,
        value: nextValues,
        type: 'multiselect',
      },
    })
  }

  const toggleValue = (optionValue) => {
    const normalizedOptionValue = String(optionValue)
    const nextValues = normalizedValue.includes(normalizedOptionValue)
      ? normalizedValue.filter((item) => item !== normalizedOptionValue)
      : [...normalizedValue, normalizedOptionValue]

    updateValue(nextValues)
  }

  const removeValue = (optionValue) => {
    updateValue(normalizedValue.filter((item) => item !== String(optionValue)))
  }

  return (
    <div className={`form-group ${className}`} ref={containerRef} style={{ position: 'relative' }}>
      {label ? (
        <label className="form-label">
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={`${name}-multi-select`}
        className="form-select"
        style={{
          width: '100%',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          textAlign: 'left',
          background: '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ color: selectedOptions.length ? '#0f172a' : '#94a3b8' }}>
          {selectedOptions.length ? `${selectedOptions.length} sélectionné(s)` : placeholder}
        </span>
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" />
      </button>

      {selectedOptions.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {selectedOptions.map((option) => (
            <span
              key={String(option.value)}
              className="badge badge-role"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '999px',
              }}
            >
              {option.label}
              <button
                type="button"
                onClick={() => removeValue(option.value)}
                aria-label={`Retirer ${option.label}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'inherit',
                  padding: 0,
                  width: '18px',
                  height: '18px',
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {isOpen ? (
        <div
          id={`${name}-multi-select`}
          className="panel"
          style={{
            position: 'absolute',
            zIndex: 30,
            left: 0,
            right: 0,
            top: 'calc(100% + 8px)',
            padding: '12px',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.14)',
            maxHeight: '320px',
            overflow: 'hidden',
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              marginBottom: '10px',
            }}
          />

          <div style={{ display: 'grid', gap: '8px', maxHeight: '230px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '10px 4px', color: '#64748b', fontSize: '14px' }}>
                Aucun résultat.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const checked = normalizedValue.includes(String(option.value))

                return (
                  <label
                    key={String(option.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      background: checked ? 'rgba(37, 99, 235, 0.05)' : '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleValue(option.value)}
                      style={{ width: '18px', height: '18px', marginTop: '2px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{option.label}</span>
                      {option.hint ? (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{option.hint}</span>
                      ) : null}
                    </div>
                  </label>
                )
              })
            )}
          </div>
        </div>
      ) : null}

      {error ? <span className="form-error">{error}</span> : null}
    </div>
  )
}
