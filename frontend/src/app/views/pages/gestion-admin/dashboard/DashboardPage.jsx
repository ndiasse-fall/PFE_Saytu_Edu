import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../../core/context/useAuth'
import { getDashboardSummary } from '../../../../services/user/userService'

const unavailableValue = '—'

function formatNumber(value) {
  if (value === null || value === undefined) {
    return unavailableValue
  }

  return new Intl.NumberFormat('fr-FR').format(value)
}

function getFullName(user) {
  return `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()
}

export function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
  const [dashboardData, setDashboardData] = useState({
    loading: isAdmin,
    error: '',
    utilisateursTotal: null,
    adminsTotal: null,
    elevesTotal: null,
    professeursTotal: null,
    actifsTotal: null,
    inactifsTotal: null,
    profilsIncomplets: null,
    utilisateurs: [],
  })

  useEffect(() => {
    if (!isAdmin) {
      setDashboardData((current) => ({ ...current, loading: false }))
      return
    }

    let isMounted = true

    async function loadDashboardData() {
      setDashboardData((current) => ({ ...current, loading: true, error: '' }))

      try {
        const response = await getDashboardSummary()

        if (!isMounted) return

        setDashboardData({
          loading: false,
          error: '',
          utilisateursTotal: response.counts?.total ?? 0,
          adminsTotal: response.counts?.admins ?? 0,
          elevesTotal: response.counts?.eleves ?? 0,
          professeursTotal: response.counts?.enseignants ?? 0,
          actifsTotal: response.counts?.actifs ?? 0,
          inactifsTotal: response.counts?.inactifs ?? 0,
          profilsIncomplets: response.counts?.profils_incomplets ?? 0,
          utilisateurs: response.recent_teachers ?? [],
        })
      } catch (error) {
        if (!isMounted) return

        setDashboardData((current) => ({
          ...current,
          loading: false,
          error: error.message,
        }))
      }
    }

    void loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [isAdmin])

  const stats = useMemo(() => ([
    {
      label: 'Utilisateurs',
      value: dashboardData.utilisateursTotal,
      tone: 'primary',
      help: 'Tous les comptes',
      icon: 'bi-people-fill',
    },
    {
      label: 'Administrateurs',
      value: dashboardData.adminsTotal,
      tone: 'primary',
      help: 'Comptes de gestion',
      icon: 'bi-person-gear',
    },
    {
      label: 'Élèves',
      value: dashboardData.elevesTotal,
      tone: 'primary',
      help: 'Comptes élèves',
      icon: 'bi-mortarboard-fill',
    },
    {
      label: 'Professeurs',
      value: dashboardData.professeursTotal,
      tone: 'primary',
      help: 'Comptes enseignants',
      icon: 'bi-person-video3',
    },
  ]), [
    dashboardData.adminsTotal,
    dashboardData.elevesTotal,
    dashboardData.professeursTotal,
    dashboardData.utilisateursTotal,
  ])

  const distribution = useMemo(() => {
    const total = dashboardData.utilisateursTotal || 0
    const items = [
      { label: 'Élèves', value: dashboardData.elevesTotal || 0, color: '#22a06b' },
      { label: 'Professeurs', value: dashboardData.professeursTotal || 0, color: '#7c5ce5' },
      { label: 'Administrateurs', value: dashboardData.adminsTotal || 0, color: '#24a8df' },
    ]
    let cursor = 0
    const segments = items.map((item) => {
      const start = cursor
      cursor += total > 0 ? (item.value / total) * 100 : 0
      return `${item.color} ${start}% ${cursor}%`
    })

    return {
      items,
      chart: total > 0 ? `conic-gradient(${segments.join(', ')}, #e7edf6 ${cursor}% 100%)` : '#e7edf6',
    }
  }, [
    dashboardData.adminsTotal,
    dashboardData.elevesTotal,
    dashboardData.professeursTotal,
    dashboardData.utilisateursTotal,
  ])

  const activeRate = dashboardData.utilisateursTotal
    ? Math.round(((dashboardData.actifsTotal || 0) / dashboardData.utilisateursTotal) * 100)
    : 0
  const inactiveRate = dashboardData.utilisateursTotal
    ? Math.round(((dashboardData.inactifsTotal || 0) / dashboardData.utilisateursTotal) * 100)
    : 0

  if (!isAdmin) {
    return (
      <section className="dashboard-page dashboard-page-compact">
        <header className="page-header-inline">
          <div>
            <h2>Mon tableau de bord</h2>
            <p>Résumé de votre session et de vos informations de compte.</p>
          </div>
        </header>
        <section className="panel dashboard-table-card">
          <div className="dashboard-section-head">
            <div>
              <h2>Informations du compte</h2>
              <p>Données issues de la session courante.</p>
            </div>
          </div>

          <div className="dashboard-profile-grid">
            <article className="dashboard-profile-card">
              <span>Nom complet</span>
              <strong translate="no">{getFullName(user) || 'Non renseigné'}</strong>
            </article>
            <article className="dashboard-profile-card">
              <span>Email</span>
              <strong>{user?.email || 'Non renseigné'}</strong>
            </article>
            <article className="dashboard-profile-card">
              <span>Téléphone</span>
              <strong>{user?.telephone || 'Non renseigné'}</strong>
            </article>
            <article className="dashboard-profile-card">
              <span>Rôle</span>
              <strong>{user?.role || 'Non renseigné'}</strong>
            </article>
          </div>
        </section>
      </section>
    )
  }

  return (
    <section className="dashboard-page dashboard-school-page">
      {dashboardData.error ? <div className="alert alert-error">{dashboardData.error}</div> : null}

      <header className="page-header-inline">
        <div>
          <h2>Bonjour, {user?.prenom || 'Administrateur'}</h2>
          <p>Voici l’état de votre plateforme aujourd’hui.</p>
        </div>
        <div className="dashboard-header-actions">
          <Link className="dashboard-primary-action" to="/admin/gestion-admin/users">
            <i className="bi bi-person-plus" aria-hidden="true" />
            Ajouter un utilisateur
          </Link>
          <Link className="dashboard-secondary-action" to="/admin/gestion-admin/users">
            Voir les utilisateurs
          </Link>
        </div>
      </header>

      <div className="dashboard-metrics dashboard-school-metrics" aria-busy={dashboardData.loading}>
        {stats.map((stat) => (
          <article key={stat.label} className="panel dashboard-stat-card dashboard-school-stat-card">
            <span className="dashboard-school-stat-icon" aria-hidden="true">
              <i className={`bi ${stat.icon}`} />
            </span>
            <div className="dashboard-school-stat-content">
              <div className={`dashboard-stat-value ${stat.tone}${stat.value === null ? ' unavailable' : ''}`}>
                {dashboardData.loading && stat.value !== null ? '...' : formatNumber(stat.value)}
              </div>
              <div className="dashboard-stat-copy">
                <div className="dashboard-stat-label">{stat.label}</div>
                {stat.help ? (
                  <span className={stat.value === null ? 'warning-copy' : ''}>
                    {stat.value === null ? <i className="bi bi-exclamation-circle" aria-hidden="true" /> : null}
                    {stat.help}
                  </span>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-insights-grid">
        <section className="panel dashboard-insight-panel dashboard-distribution-panel">
          <div className="dashboard-panel-title">
            <i className="bi bi-pie-chart-fill" aria-hidden="true" />
            <div>
              <h2>Répartition des utilisateurs</h2>
              <p>Composition actuelle des comptes.</p>
            </div>
          </div>
          <div className="dashboard-distribution-content">
            <div
              className="dashboard-donut"
              style={{ '--dashboard-chart': distribution.chart }}
              role="img"
              aria-label="Répartition des élèves, professeurs et administrateurs"
            >
              <span>{formatNumber(dashboardData.utilisateursTotal)}</span>
              <small>Total</small>
            </div>
            <div className="dashboard-legend">
              {distribution.items.map((item) => (
                <div key={item.label} className="dashboard-legend-row">
                  <span className="dashboard-legend-dot" style={{ backgroundColor: item.color }} />
                  <strong>{item.label}</strong>
                  <span>{formatNumber(item.value)}</span>
                  <b>
                    {dashboardData.utilisateursTotal
                      ? `${Math.round((item.value / dashboardData.utilisateursTotal) * 100)} %`
                      : '0 %'}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel dashboard-insight-panel">
          <div className="dashboard-panel-title">
            <i className="bi bi-person-check-fill" aria-hidden="true" />
            <div>
              <h2>État des comptes</h2>
              <p>Disponibilité des accès utilisateurs.</p>
            </div>
          </div>
          <div className="dashboard-status-list">
            <div className="dashboard-status-item">
              <div className="dashboard-status-heading">
                <span className="dashboard-status-icon success"><i className="bi bi-check-lg" /></span>
                <div><span>Actifs</span><strong>{formatNumber(dashboardData.actifsTotal)}</strong></div>
                <b>{activeRate} %</b>
              </div>
              <div className="dashboard-progress"><span style={{ width: `${activeRate}%` }} /></div>
            </div>
            <div className="dashboard-status-item">
              <div className="dashboard-status-heading">
                <span className="dashboard-status-icon danger"><i className="bi bi-x-lg" /></span>
                <div><span>Inactifs</span><strong>{formatNumber(dashboardData.inactifsTotal)}</strong></div>
                <b>{inactiveRate} %</b>
              </div>
              <div className="dashboard-progress danger"><span style={{ width: `${inactiveRate}%` }} /></div>
            </div>
          </div>
        </section>

        <section className="panel dashboard-insight-panel">
          <div className="dashboard-panel-title">
            <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
            <div>
              <h2>Actions rapides</h2>
              <p>Accès directs aux tâches courantes.</p>
            </div>
          </div>
          <nav className="dashboard-quick-actions" aria-label="Actions rapides">
            <Link to="/admin/gestion-admin/users"><i className="bi bi-person-plus" />Ajouter un utilisateur<i className="bi bi-chevron-right" /></Link>
            <Link to="/admin/gestion-admin/users"><i className="bi bi-people" />Gérer les utilisateurs<i className="bi bi-chevron-right" /></Link>
            <Link to="/admin/gestion-admin/users"><i className="bi bi-person-video3" />Voir les enseignants<i className="bi bi-chevron-right" /></Link>
            <Link to="/settings"><i className="bi bi-gear" />Paramètres<i className="bi bi-chevron-right" /></Link>
          </nav>
        </section>
      </div>

      <section className="dashboard-alert-strip" aria-label="Informations importantes">
        <div className={dashboardData.inactifsTotal ? 'warning' : 'success'}>
          <i className={`bi ${dashboardData.inactifsTotal ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} />
          <span><strong>{formatNumber(dashboardData.inactifsTotal)} compte(s) inactif(s)</strong>Vérifiez les accès qui ne sont plus actifs.</span>
        </div>
        <div className="info">
          <i className="bi bi-info-circle-fill" />
          <span><strong>{formatNumber(dashboardData.profilsIncomplets)} profil(s) incomplet(s)</strong>Complétez les téléphones et adresses manquants.</span>
        </div>
        <div className="success">
          <i className="bi bi-shield-check" />
          <span><strong>Système opérationnel</strong>Les données du dashboard sont à jour.</span>
        </div>
      </section>

      <section className="panel dashboard-table-card dashboard-teachers-card">
        <div className="dashboard-section-head">
          <div>
            <h2>Enseignants récents</h2>
            <p>Derniers comptes enseignants disponibles.</p>
          </div>
          <Link className="dashboard-table-link" to="/admin/gestion-admin/users">
            Voir tous les enseignants <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {dashboardData.loading ? (
          <div className="screen-state">Chargement des utilisateurs...</div>
        ) : dashboardData.utilisateurs.length === 0 ? (
          <div className="screen-state">Aucun utilisateur enseignant trouvé.</div>
        ) : (
          <div className="table-wrapper dashboard-teachers-table-wrapper">
            <table className="dashboard-teachers-table">
              <thead>
                <tr>
                  <th scope="col">Prénom & nom</th>
                  <th scope="col">Email</th>
                  <th scope="col">Téléphone</th>
                  <th scope="col">Adresse</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.utilisateurs.map((utilisateur) => (
                  <tr key={utilisateur.id}>
                    <td>
                      <span className="teacher-identity">
                        <span className="teacher-avatar" aria-hidden="true">
                          {(utilisateur.prenom?.[0] || '') + (utilisateur.nom?.[0] || '')}
                        </span>
                        <strong>{getFullName(utilisateur) || 'Non renseigné'}</strong>
                      </span>
                    </td>
                    <td className="teacher-email">{utilisateur.email || 'Non renseigné'}</td>
                    <td>
                      <span className="data-tag">{utilisateur.telephone || 'Non renseigné'}</span>
                    </td>
                    <td>
                      <span className="data-tag">{utilisateur.adresse || 'Non renseignée'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
