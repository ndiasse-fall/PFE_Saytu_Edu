import { PasswordField } from '../forms/PasswordField'
import { MultiSelectField } from '../forms/MultiSelectField'

function FieldError({ errors }) {
  return errors?.length ? <small>{errors[0]}</small> : null
}

export function CrudForm({
  fields,
  form,
  fieldErrors,
  submitting,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      {fields.map((field) => {
        const value = form[field.name] ?? ''
        const required = typeof field.required === 'function'
          ? field.required({ isEditing, form })
          : Boolean(field.required)
        const label = isEditing && field.editLabel
          ? field.editLabel
          : field.label
        const className = field.fullWidth ? 'full-width' : undefined

        if (field.type === 'checkbox') {
          return (
            <label key={field.name} className={`checkbox${className ? ` ${className}` : ''}`}>
              <input
                name={field.name}
                type="checkbox"
                checked={Boolean(value)}
                onChange={onChange}
              />
              <span>{label}</span>
              <FieldError errors={fieldErrors[field.name]} />
            </label>
          )
        }

        if (field.type === 'select') {
          return (
            <label key={field.name} className={className}>
              <span>{label}</span>
              <select
                name={field.name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={field.disabled}
              >
                {field.placeholder ? (
                  <option value="">{field.placeholder}</option>
                ) : null}
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
              <FieldError errors={fieldErrors[field.name]} />
            </label>
          )
        }

        if (field.type === 'multiselect') {
          return (
            <MultiSelectField
              key={field.name}
              className={className}
              label={label}
              name={field.name}
              value={value}
              onChange={onChange}
              options={field.options}
              placeholder={field.placeholder}
              searchPlaceholder={field.searchPlaceholder}
              required={required}
              disabled={field.disabled}
              error={fieldErrors[field.name]?.[0]}
            />
          )
        }

        if (field.type === 'textarea') {
          return (
            <label key={field.name} className={className}>
              <span>{label}</span>
              <textarea
                name={field.name}
                value={value}
                onChange={onChange}
                required={required}
                rows={field.rows ?? 3}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
              />
              <FieldError errors={fieldErrors[field.name]} />
            </label>
          )
        }

        if (field.type === 'password') {
          return (
            <PasswordField
              key={field.name}
              className={className}
              label={label}
              name={field.name}
              value={value}
              onChange={onChange}
              required={required}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              disabled={field.disabled}
              error={fieldErrors[field.name]?.[0]}
            />
          )
        }

        return (
          <label key={field.name} className={className}>
            <span>{label}</span>
            <input
              name={field.name}
              type={field.type ?? 'text'}
              value={value}
              onChange={onChange}
              required={required}
              min={field.min}
              max={field.max}
              step={field.step}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              inputMode={field.inputMode}
              disabled={field.disabled}
            />
            <FieldError errors={fieldErrors[field.name]} />
          </label>
        )
      })}

      <div className="form-actions full-width">
        <button type="button" className="ghost-button" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" disabled={submitting}>
          {submitting
            ? 'Enregistrement...'
            : isEditing
              ? 'Mettre à jour'
              : 'Créer'}
        </button>
      </div>
    </form>
  )
}
