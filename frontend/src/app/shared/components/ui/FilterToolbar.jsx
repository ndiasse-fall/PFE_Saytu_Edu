export function FilterToolbar({ title, subtitle, children, className = '' }) {
  return (
    <div className={`panel-header users-table-header${className ? ` ${className}` : ''}`}>
      {title || subtitle ? (
        <div className="users-table-title">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <span className="muted">{subtitle}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}
