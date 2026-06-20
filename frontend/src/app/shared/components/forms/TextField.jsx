export function TextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  ...props
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className={`field-input${error ? ' field-input-error' : ''}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...props}
      />
      {error ? <small>{error}</small> : null}
    </label>
  )
}
