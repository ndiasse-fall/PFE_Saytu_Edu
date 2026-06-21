import TablePagination from "@mui/material/TablePagination";
import { ActionMenu } from "../../../../../shared/components/ui/ActionMenu";
import { FilterToolbar } from "../../../../../shared/components/ui/FilterToolbar";

function getInitials(eleve) {
    return (
        [eleve.prenom, eleve.nom]
            .filter(Boolean)
            .map((part) => String(part).trim().charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase() || "?"
    );
}

export function ListeEleves({
    eleves,
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
    onInscrire,
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
                            aria-label="Rechercher un élève"
                        />
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
                    Chargement des élèves...
                </div>
            ) : eleves.length === 0 ? (
                <div className="screen-state users-table-state">
                    Aucun élève trouvé.
                </div>
            ) : (
                <div className="table-wrapper users-table-wrapper">
                    <table className="users-table">
                        <colgroup>
                            <col className="users-col-user" />
                            <col className="users-col-classe" />
                            <col className="users-col-contact" />
                            <col className="users-col-status" />
                            <col className="users-col-actions" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col">Élève</th>
                                <th scope="col">Classe</th>
                                <th scope="col">Contact</th>
                                <th scope="col">Statut</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eleves.map((eleve) => (
                                <tr key={eleve.id}>
                                    <td>
                                        <span className="users-identity">
                                            <span
                                                className="users-identity-avatar"
                                                aria-hidden="true"
                                            >
                                                {getInitials(eleve)}
                                            </span>
                                            <strong>
                                                {eleve.prenom} {eleve.nom}
                                            </strong>
                                        </span>
                                    </td>
                                    <td>
                                        {eleve.classes &&
                                        eleve.classes.length > 0 ? (
                                            <span
                                                className="badge badge-info"
                                                style={{
                                                    backgroundColor:
                                                        "var(--primary-light)",
                                                    color: "var(--primary-dark)",
                                                }}
                                            >
                                                {eleve.classes[0].nom_classe}
                                            </span>
                                        ) : (
                                            <span
                                                className="text-muted"
                                                style={{ fontSize: "0.85rem" }}
                                            >
                                                Non affecté
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span>
                                            {eleve.telephone || "Non renseigné"}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${eleve.actif ? "badge-active" : "badge-inactive"}`}
                                        >
                                            {eleve.actif ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td>
                                        <ActionMenu
                                            ariaLabel={`Ouvrir les actions pour ${eleve.prenom} ${eleve.nom}`}
                                            items={[
                                                {
                                                    label: "Voir",
                                                    onClick: () =>
                                                        void onShow(eleve.id),
                                                },
                                                {
                                                    label: "Modifier",
                                                    onClick: () =>
                                                        onEdit(eleve),
                                                },
                                                {
                                                    label: "Affecter à une classe",
                                                    onClick: () =>
                                                        onInscrire(eleve),
                                                },
                                                {
                                                    label: eleve.actif
                                                        ? "Désactiver"
                                                        : "Activer",
                                                    onClick: () =>
                                                        void onToggle(eleve.id),
                                                },
                                                {
                                                    label: "Supprimer",
                                                    onClick: () =>
                                                        void onDelete(eleve.id),
                                                    danger: true,
                                                },
                                            ]}
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
