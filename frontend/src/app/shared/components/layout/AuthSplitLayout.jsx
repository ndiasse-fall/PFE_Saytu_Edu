export function AuthSplitLayout({ left, right }) {
  return (
    <div className="auth-shell">
      <section className="auth-showcase">{left}</section>
      <section className="auth-panel">{right}</section>
    </div>
  )
}
