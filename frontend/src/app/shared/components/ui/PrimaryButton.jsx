export function PrimaryButton({ children, disabled = false, type = 'button', block = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-primary${block ? ' btn-block' : ''}`}
    >
      {children}
    </button>
  )
}
