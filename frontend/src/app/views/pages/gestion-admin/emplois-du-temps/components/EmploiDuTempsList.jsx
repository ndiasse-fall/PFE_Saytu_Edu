import React from 'react'
import { ActionMenu } from '../../../../../shared/components/ui/ActionMenu'
import { FilterToolbar } from '../../../../../shared/components/ui/FilterToolbar'

export function EmploiDuTempsList({
  sessions,
  loading,
  filters,
  classes,
  teachers,
  matieres,
  onFilterChange,
  onClearFilters,
  onShow,
  onEdit,
  onDelete,
  isAdmin,
  user,
}) {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const isStudent = user?.role === 'ELEVE'
  const isTeacher = user?.role === 'ENSEIGNANT'

  // Format time (e.g. "08:00:00" -> "08:00")
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    return parts.slice(0, 2).join(':')
  }

  return (
    <section className="panel users-table-panel">
      <FilterToolbar className="users-filter-shell">
        <div className="users-filter-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px' }}>
          {/* Classe */}
          {!isStudent && (
            <label className="users-toolbar-field">
              <span>Classe</span>
              <select
                name="id_classe"
                value={filters.id_classe ?? ''}
                onChange={onFilterChange}
              >
                <option value="">Toutes les classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom_classe}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Enseignant */}
          {!isStudent && !isTeacher && (
            <label className="users-toolbar-field">
              <span>Enseignant</span>
              <select
                name="id_enseignant"
                value={filters.id_enseignant ?? ''}
                onChange={onFilterChange}
              >
                <option value="">Tous les enseignants</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.prenom} {t.nom}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Matière */}
          <label className="users-toolbar-field">
            <span>Matière</span>
            <select
              name="id_matiere"
              value={filters.id_matiere ?? ''}
              onChange={onFilterChange}
            >
              <option value="">Toutes les matières</option>
              {matieres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nom_matiere}
                </option>
              ))}
            </select>
          </label>

          {/* Jour */}
          <label className="users-toolbar-field">
            <span>Jour</span>
            <select
              name="jour"
              value={filters.jour ?? ''}
              onChange={onFilterChange}
            >
              <option value="">Tous les jours</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          {/* Bouton Réinitialiser modifié en bleu */}
          <div className="form-actions users-toolbar-actions" style={{ marginTop: '0', marginBottom: '4px' }}>
            <button
              type="button"
              onClick={onClearFilters}
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.9rem', 
                height: '38px', 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'var(--primary, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </FilterToolbar>

      {loading ? (
        <div className="screen-state users-table-state">
          Chargement des séances...
        </div>
      ) : sessions.length === 0 ? (
        <div className="screen-state users-table-state">
          Aucune séance programmée.
        </div>
      ) : (
        <div className="table-wrapper users-table-wrapper">
          <table className="users-table">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '5%' }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Matière</th>
                <th scope="col">Classe</th>
                <th scope="col">Enseignant</th>
                <th scope="col">Jour</th>
                <th scope="col">Horaire</th>
                <th scope="col">Salle</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <strong translate="no" style={{ color: 'var(--text-strong)' }}>
                      {session.matiere?.nom_matiere || '-'}
                    </strong>
                  </td>
                  <td>
                    <span
                      className="badge badge-info"
                      style={{
                        backgroundColor: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        fontWeight: '600',
                      }}
                    >
                      {session.classe?.nom_classe || '-'}
                    </span>
                  </td>
                  <td>
                    <span>
                      {session.enseignant
                        ? `${session.enseignant.prenom} ${session.enseignant.nom}`
                        : '-'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>{session.jour}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', color: 'var(--text)' }}>
                      {session.salle || '-'}
                    </span>
                  </td>
                  <td>
                    <ActionMenu
                      ariaLabel={`Ouvrir les actions pour la séance`}
                      items={
                        isAdmin
                          ? [
                              {
                                label: 'Voir détails',
                                onClick: () => onShow(session),
                              },
                              {
                                label: 'Modifier',
                                onClick: () => onEdit(session),
                              },
                              {
                                label: 'Supprimer',
                                onClick: () => onDelete(session.id),
                                danger: true,
                              },
                            ]
                          : [
                              {
                                label: 'Voir détails',
                                onClick: () => onShow(session),
                              },
                            ]
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}