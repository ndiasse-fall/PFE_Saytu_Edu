export function PrimaryButton({ children, disabled = false, type = 'button', block = false, className = '', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-primary${block ? ' btn-block' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
