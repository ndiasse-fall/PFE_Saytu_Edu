import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../../core/context/useAuth'
import { listUsers } from '../../../../services/user/userService'

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
        const [utilisateursResponse, adminsResponse, elevesResponse, professeursResponse] = await Promise.all([
          listUsers({ perPage: 1 }),
          listUsers({ role: 'ADMIN', perPage: 1 }),
          listUsers({ role: 'ELEVE', perPage: 1 }),
          listUsers({ role: 'ENSEIGNANT', perPage: 5 }),
        ])

        if (!isMounted) return

        setDashboardData({
          loading: false,
          error: '',
          utilisateursTotal: utilisateursResponse.total ?? 0,
          adminsTotal: adminsResponse.total ?? 0,
          elevesTotal: elevesResponse.total ?? 0,
          professeursTotal: professeursResponse.total ?? 0,
          utilisateurs: professeursResponse.data ?? [],
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
      help: 'Total des comptes actifs et inactifs',
    },
    {
      label: 'Administrateurs',
      value: dashboardData.adminsTotal,
      tone: 'primary',
      help: 'Comptes de gestion',
    },
    {
      label: 'Élèves',
      value: dashboardData.elevesTotal,
      tone: 'primary',
      help: 'Donnée issue des utilisateurs',
    },
    {
      label: 'Professeurs',
      value: dashboardData.professeursTotal,
      tone: 'primary',
      help: 'Donnée issue des utilisateurs',
    },
  ]), [
    dashboardData.adminsTotal,
    dashboardData.elevesTotal,
    dashboardData.professeursTotal,
    dashboardData.utilisateursTotal,
  ])

  if (!isAdmin) {
    return (
      <section className="dashboard-page dashboard-page-compact">
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
              <strong>{getFullName(user) || 'Non renseigné'}</strong>
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

      <div className="dashboard-metrics dashboard-school-metrics" aria-busy={dashboardData.loading}>
        {stats.map((stat) => (
          <article key={stat.label} className="panel dashboard-stat-card dashboard-school-stat-card">
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
          </article>
        ))}
      </div>

      <section className="panel dashboard-table-card dashboard-teachers-card">
        <div className="dashboard-section-head">
          <div>
            <h2>Utilisateurs récents</h2>
            <p>Aperçu des derniers comptes enseignants disponibles dans le module Utilisateur.</p>
          </div>
          <span className="dashboard-record-count">
            {formatNumber(dashboardData.professeursTotal)} enseignants
          </span>
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
                  <th>Prénom & nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Adresse</th>
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
