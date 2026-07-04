import { useState } from 'react'

export function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) {
  const [visible, setVisible] = useState(false)
  const inputId = props.id ?? name

  return (
    <div className={`field password-field${className ? ` ${className}` : ''}`}>
      <label className="field-label" htmlFor={inputId}>{label}</label>
      <span className="password-field-control">
        <input
          {...props}
          id={inputId}
          className={`field-input password-field-input${error ? ' field-input-error' : ''}`}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          className="password-toggle-button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Masquer la valeur' : 'Afficher la valeur'}
          title={visible ? 'Masquer' : 'Afficher'}
        >
          <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
        </button>
      </span>
      {error ? <small>{error}</small> : null}
    </div>
  )
}
