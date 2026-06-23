export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  required = false,
  ...props
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select
        className={`field-input${error ? ' field-input-error' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}
