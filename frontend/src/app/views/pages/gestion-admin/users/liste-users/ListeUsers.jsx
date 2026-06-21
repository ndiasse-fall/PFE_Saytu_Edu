const roles = ["SUPER_ADMIN", "ADMIN", "ENSEIGNANT", "ELEVE"];
import TablePagination from "@mui/material/TablePagination";
import { ActionMenu } from "../../../../../shared/components/ui/ActionMenu";
import { FilterToolbar } from "../../../../../shared/components/ui/FilterToolbar";

function getInitials(user) {
    return (
        [user.prenom, user.nom]
            .filter(Boolean)
            .map((part) => String(part).trim().charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"
    );
}

export function ListeUsers({
    users,
    loading,
    filters,
    pagination,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    onShow,
    onEdit,
    onToggle,
    onDelete,
    onPageChange,
    onRowsPerPageChange,
}) {
    const currentPage = pagination?.currentPage ?? 1;

    return (
        <section className="panel users-table-panel">
            <FilterToolbar className="users-filter-shell">
                <form
                    className="users-filter-toolbar"
                    onSubmit={onApplyFilters}
                >
                    <label className="users-toolbar-field mt-3 users-toolbar-search">
                        <i className="bi bi-search" aria-hidden="true" />
                        <input
                            type="search"
                            name="search"
                            value={filters.search}
                            onChange={onFilterChange}
                            placeholder="Nom, prénom, email..."
                            aria-label="Rechercher un utilisateur"
                        />
                    </label>
                    <label className="users-toolbar-field">
                        <span>Rôle</span>
                        <select
                            name="role"
                            value={filters.role}
                            onChange={onFilterChange}
                        >
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
                        <select
                            name="actif"
                            value={filters.actif}
                            onChange={onFilterChange}
                        >
                            <option value="">Tous</option>
                            <option value="1">Actif</option>
                            <option value="0">Inactif</option>
                        </select>
                    </label>
                    <div className="form-actions users-toolbar-actions">
                        <button type="submit">Filtrer</button>
                        <button
                            type="button"
                            className="ghost-button"
                            onClick={() => void onClearFilters()}
                        >
                            Réinitialiser
                        </button>
                    </div>
                </form>
            </FilterToolbar>

            {loading ? (
                <div className="screen-state users-table-state">
                    Chargement des utilisateurs...
                </div>
            ) : users.length === 0 ? (
                <div className="screen-state users-table-state">
                    Aucun utilisateur trouvé.
                </div>
            ) : (
                <div className="table-wrapper users-table-wrapper">
                    <table className="users-table">
                        <colgroup>
                            <col className="users-col-user" />
                            <col className="users-col-contact" />
                            <col className="users-col-role" />
                            <col className="users-col-status" />
                            <col className="users-col-actions" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">Utilisateur</th>
                                <th scope="col">Contact</th>
                                <th scope="col">Rôle</th>
                                <th scope="col">Statut</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <span className="users-identity">
                                            <span
                                                className="users-identity-avatar"
                                                aria-hidden="true"
                                            >
                                                {getInitials(user)}
                                            </span>
                                            <strong>
                                                {user.prenom} {user.nom}
                                            </strong>
                                        </span>
                                    </td>
                                    <td>
                                        <span>
                                            {user.telephone || "Non renseigné"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-role">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${user.actif ? "badge-active" : "badge-inactive"}`}
                                        >
                                            {user.actif ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td>
                                        <ActionMenu
                                            ariaLabel={`Ouvrir les actions pour ${user.prenom} ${user.nom}`}
                                            items={
                                                user.role === "SUPER_ADMIN"
                                                    ? [
                                                          {
                                                              label: "Voir",
                                                              onClick: () =>
                                                                  void onShow(
                                                                      user.id,
                                                                  ),
                                                          },
                                                      ]
                                                    : [
                                                          {
                                                              label: "Voir",
                                                              onClick: () =>
                                                                  void onShow(
                                                                      user.id,
                                                                  ),
                                                          },
                                                          {
                                                              label: "Modifier",
                                                              onClick: () =>
                                                                  onEdit(user),
                                                          },
                                                          {
                                                              label: user.actif
                                                                  ? "Désactiver"
                                                                  : "Activer",
                                                              onClick: () =>
                                                                  void onToggle(
                                                                      user.id,
                                                                  ),
                                                          },
                                                          {
                                                              label: "Supprimer",
                                                              onClick: () =>
                                                                  void onDelete(
                                                                      user.id,
                                                                  ),
                                                              danger: true,
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

            {!loading && pagination && pagination.total > 0 ? (
                <TablePagination
                    component="div"
                    className="users-table-pagination"
                    count={pagination.total}
                    page={currentPage - 1}
                    onPageChange={(_, nextPage) =>
                        void onPageChange(nextPage + 1)
                    }
                    rowsPerPage={pagination.perPage}
                    onRowsPerPageChange={(event) =>
                        void onRowsPerPageChange(Number(event.target.value))
                    }
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    labelRowsPerPage="Lignes par page :"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}–${to} sur ${count}`
                    }
                    slotProps={{
                        actions: {
                            previousButton: { "aria-label": "Page précédente" },
                            nextButton: { "aria-label": "Page suivante" },
                        },
                        select: {
                            "aria-label": "Nombre de lignes par page",
                        },
                    }}
                />
            ) : null}
        </section>
    );
}
