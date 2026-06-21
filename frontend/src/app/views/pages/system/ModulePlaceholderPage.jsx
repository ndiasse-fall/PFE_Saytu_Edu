export function ModulePlaceholderPage({ title }) {
  return (
    <section className="page-section">
      <header className="page-header-inline">
        <div>
          <h2>{title}</h2>
          <p>Ce module est déclaré et sera implémenté dans une prochaine étape.</p>
        </div>
      </header>

      <section className="panel screen-panel">
        <p>La route et l’accès selon le rôle sont prêts.</p>
      </section>
    </section>
  )
}
