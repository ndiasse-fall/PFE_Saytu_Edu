const roles = ['SUPER_ADMIN', 'ADMIN', 'ENSEIGNANT', 'ELEVE']
import { ActionMenu } from '../../../../../shared/components/ui/ActionMenu'
import { FilterToolbar } from '../../../../../shared/components/ui/FilterToolbar'

export function ListeUsers({
  users,
  pagination,
  loading,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onShow,
  onEdit,
  onToggle,
  onDelete,
  onCreate,
  canCreate,
}) {
  return (
    <section className="panel users-table-panel">
      <FilterToolbar title="Liste des utilisateurs" subtitle={`${pagination?.total ?? users.length} enregistrements`}>
        <form className="users-filter-toolbar" onSubmit={onApplyFilters}>
          <label className="users-toolbar-field users-toolbar-search">
            <i className="bi bi-search" aria-hidden="true" />
            <input
              name="search"
              value={filters.search}
              onChange={onFilterChange}
              placeholder="Nom, prénom, email..."
            />
          </label>
          <label className="users-toolbar-field">
            <span>Rôle</span>
            <select name="role" value={filters.role} onChange={onFilterChange}>
              <option value="">Tous</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className="users-toolbar-field">
            <span>Statut</span>
            <select name="actif" value={filters.actif} onChange={onFilterChange}>
              <option value="">Tous</option>
              <option value="1">Actif</option>
              <option value="0">Inactif</option>
            </select>
          </label>
          <div className="form-actions users-toolbar-actions">
            <button type="submit">Filtrer</button>
            <button type="button" className="ghost-button" onClick={() => void onClearFilters()}>
              Réinitialiser
            </button>
            {canCreate ? (
              <button type="button" onClick={onCreate}>
                Ajouter
              </button>
            ) : null}
          </div>
        </form>
      </FilterToolbar>

      {loading ? (
        <div className="screen-state users-table-state">Chargement des utilisateurs...</div>
      ) : users.length === 0 ? (
        <div className="screen-state users-table-state">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="table-wrapper users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Contact</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <span className="users-identity">
                      <span className="users-identity-avatar" aria-hidden="true">
                        {(user.prenom?.[0] || '') + (user.nom?.[0] || '')}
                      </span>
                      <strong>{user.prenom} {user.nom}</strong>
                    </span>
                  </td>
                  <td>
                    <span>{user.telephone || 'Non renseigné'}</span>
                  </td>
                  <td>
                    <span className="badge badge-role">{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${user.actif ? 'badge-active' : 'badge-inactive'}`}>
                      {user.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <ActionMenu
                      ariaLabel={`Ouvrir les actions pour ${user.prenom} ${user.nom}`}
                      items={[
                        { label: 'Voir', onClick: () => void onShow(user.id) },
                        { label: 'Modifier', onClick: () => onEdit(user) },
                        { label: user.actif ? 'Désactiver' : 'Activer', onClick: () => void onToggle(user.id) },
                        { label: 'Supprimer', onClick: () => void onDelete(user.id), danger: true },
                      ]}
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
