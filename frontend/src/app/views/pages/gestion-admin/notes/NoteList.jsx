import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../../../../core/api/apiClient";
import { getStoredUser } from "../../../../core/storage/authStorage";

export default function NoteList() {
    const navigate = useNavigate();
    const [eleves, setEleves] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ niveau: "", classe: "" });

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        loadEleves(filters.classe);
    }, [filters.classe]);

    async function loadClasses() {
        try {
            const user = getStoredUser();
            const url =
                user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
                    ? "/classes"
                    : "/mes-classes";
            const res = await apiClient(url);
            const data = res?.data ?? res;
            setClasses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur chargement classes notes :", error);
            setClasses([]);
        }
    }

    async function loadEleves(idClasse) {
        if (!idClasse) {
            setEleves([]);
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient(`/mes-classes/${idClasse}/eleves`);
            const data = res?.data ?? res;
            setEleves(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur chargement élèves notes :", error);
            setEleves([]);
        } finally {
            setLoading(false);
        }
    }

    const niveaux = useMemo(() => {
        const seen = new Set();
        return classes.reduce((acc, classe) => {
            const niveau = classe.niveau || classe.nom_niveau;
            if (niveau && !seen.has(niveau)) {
                seen.add(niveau);
                acc.push({ id: niveau, label: niveau });
            }
            return acc;
        }, []);
    }, [classes]);

    const filteredClasses = useMemo(
        () =>
            classes.filter(
                (classe) =>
                    !filters.niveau ||
                    classe.niveau === filters.niveau ||
                    classe.nom_niveau === filters.niveau ||
                    String(classe.id_niveau) === String(filters.niveau),
            ),
        [classes, filters.niveau],
    );

    const filteredEleves = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return eleves;
        }

        return eleves.filter((eleve) =>
            `${eleve.prenom ?? ""} ${eleve.nom ?? ""}`.toLowerCase().includes(query),
        );
    }, [eleves, search]);

    function resetFilters() {
        setFilters({ niveau: "", classe: "" });
        setSearch("");
        setEleves([]);
    }

    function openEleveDetails(eleve) {
        navigate(`/notes/${eleve.id}`, {
            state: {
                eleve,
                classeId: filters.classe,
            },
        });
    }

    return (
        <section className="notes-page">
            <h1 className="notes-page-title">Gestion des Notes</h1>

            <div className="notes-filter-bar notes-filter-bar-compact">
                <label className="notes-filter-field" htmlFor="notes-niveau">
                    <span>Niveau</span>
                    <select
                        id="notes-niveau"
                        value={filters.niveau}
                        onChange={(event) =>
                            setFilters({
                                niveau: event.target.value,
                                classe: "",
                            })
                        }
                    >
                        <option value="">Tous les niveaux</option>
                        {niveaux.map((niveau) => (
                            <option key={niveau.id} value={niveau.id}>
                                {niveau.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="notes-filter-field" htmlFor="notes-classe">
                    <span>Classe</span>
                    <select
                        id="notes-classe"
                        value={filters.classe}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                classe: event.target.value,
                            }))
                        }
                    >
                        <option value="">Toutes les classes</option>
                        {filteredClasses.map((classe) => (
                            <option key={classe.id} value={classe.id}>
                                {classe.nom_classe || classe.libelle || `Classe ${classe.id}`}
                            </option>
                        ))}
                    </select>
                </label>

                <button type="button" className="notes-filter-reset" onClick={resetFilters}>
                    Réinitialiser
                </button>
            </div>

            <input
                className="notes-search-input"
                type="search"
                placeholder="Rechercher un élève..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            <div className="notes-table-card table-wrapper">
                {loading ? (
                    <div className="screen-state" role="status">Chargement...</div>
                ) : (
                    <table className="notes-table">
                        <thead>
                            <tr>
                                <th>Prénom</th>
                                <th>Nom</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!filters.classe ? (
                                <tr>
                                    <td colSpan="3" className="notes-empty-row">
                                        Sélectionnez une classe.
                                    </td>
                                </tr>
                            ) : filteredEleves.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="notes-empty-row">
                                        Aucun élève trouvé.
                                    </td>
                                </tr>
                            ) : (
                                filteredEleves.map((eleve) => (
                                    <tr key={eleve.id}>
                                        <td>{eleve.prenom}</td>
                                        <td>{eleve.nom}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="notes-view-button"
                                                onClick={() => openEleveDetails(eleve)}
                                            >
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    );
}
