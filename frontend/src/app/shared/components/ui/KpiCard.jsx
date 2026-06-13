export function KpiCard({ label, value, icon, className = '' }) {
  return (
    <article className={`panel users-kpi-card${className ? ` ${className}` : ''}`}>
      <span className="users-kpi-icon" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </span>
      <div className="users-kpi-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}
