import React from 'react';

export function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = '',
  required = false,
  disabled = false,
  error = null,
  className = '',
}) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label htmlFor={name} className="form-label">{label}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`form-select ${error ? 'form-select-error' : ''}`}
      >
        <option value="">{placeholder || 'Sélectionner une option'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
