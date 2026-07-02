import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../../core/api/apiClient";
import { getResultatsParClasse } from "../../../../services/notes/noteService";

function formatNumber(value) {
    if (value === null || value === undefined || value === "") {
        return "--";
    }

    return new Intl.NumberFormat("fr-FR").format(Number(value));
}

function getFullName(eleve) {
    if (!eleve) return "Eleve non renseigne";
    return `${eleve.prenom ?? ""} ${eleve.nom ?? ""}`.trim() || "Eleve non renseigne";
}

export default function ClasseResultsPage() {
    const { classeId: routeClasseId } = useParams();
    const [classes, setClasses] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [filters, setFilters] = useState({
        classe: routeClasseId || "",
        matiere: "",
        periode: "",
    });
    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [classesResponse, matieresResponse] = await Promise.all([
                    apiClient("/classes"),
                    apiClient("/matieres"),
                ]);

                const loadedClasses = classesResponse?.data ?? classesResponse ?? [];
                const loadedMatieres = matieresResponse?.data ?? matieresResponse ?? [];

                setClasses(Array.isArray(loadedClasses) ? loadedClasses : []);
                setMatieres(Array.isArray(loadedMatieres) ? loadedMatieres : []);

                if (!filters.classe && Array.isArray(loadedClasses) && loadedClasses[0]?.id) {
                    setFilters((current) => ({ ...current, classe: String(loadedClasses[0].id) }));
                }
            } catch (err) {
                console.error("Erreur chargement references notes :", err);
                setError("Impossible de charger les classes et matieres.");
            }
        };

        loadReferences();
    }, []);

    useEffect(() => {
        if (!filters.classe) return;

        const loadResults = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getResultatsParClasse(filters.classe, {
                    matiere: filters.matiere,
                    periode: filters.periode,
                });
                setPayload(response?.data ?? response ?? null);
            } catch (err) {
                console.error("Erreur resultats classe :", err);
                setPayload(null);
                setError("Les resultats de la classe n'ont pas pu etre charges.");
            } finally {
                setLoading(false);
            }
        };

        loadResults();
    }, [filters.classe, filters.matiere, filters.periode]);

    const resultats = payload?.resultats ?? [];
    const selectedClasse = payload?.classe || classes.find((classe) => String(classe.id) === String(filters.classe));

    const topStudent = useMemo(() => {
        return resultats.length ? resultats[0] : null;
    }, [resultats]);

    return (
        <section className="dashboard-page dashboard-school-page">
            <header className="page-header-inline">
                <div>
                    <h2>Resultats par classe</h2>
                    <p>Suivi des moyennes et des notes par eleve, matiere et periode.</p>
                </div>
                <div className="dashboard-header-actions">
                    <Link className="dashboard-primary-action" to="/notes">
                        <i className="bi bi-arrow-left" aria-hidden="true" />
                        Retour aux notes
                    </Link>
                </div>
            </header>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <div className="dashboard-insights-grid">
                <section className="panel dashboard-insight-panel">
                    <div className="dashboard-panel-title">
                        <i className="bi bi-funnel" aria-hidden="true" />
                        <div>
                            <h2>Filtres</h2>
                            <p>Filtrer les resultats par classe, matiere et semestre.</p>
                        </div>
                    </div>

                    <label className="field">
                        <span className="field-label">Classe</span>
                        <select
                            className="field-input"
                            value={filters.classe}
                            onChange={(event) => setFilters({ ...filters, classe: event.target.value })}
                        >
                            <option value="">Choisir une classe</option>
                            {classes.map((classe) => (
                                <option key={classe.id} value={classe.id}>
                                    {classe.nom_classe || `Classe ${classe.id}`}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field">
                        <span className="field-label">Matiere</span>
                        <select
                            className="field-input"
                            value={filters.matiere}
                            onChange={(event) => setFilters({ ...filters, matiere: event.target.value })}
                        >
                            <option value="">Toutes les matieres</option>
                            {matieres.map((matiere) => (
                                <option key={matiere.id} value={matiere.id}>
                                    {matiere.nom_matiere || matiere.nom || `Matiere ${matiere.id}`}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field">
                        <span className="field-label">Periode</span>
                        <select
                            className="field-input"
                            value={filters.periode}
                            onChange={(event) => setFilters({ ...filters, periode: event.target.value })}
                        >
                            <option value="">Toutes les periodes</option>
                            <option value="Semestre 1">Semestre 1</option>
                            <option value="Semestre 2">Semestre 2</option>
                        </select>
                    </label>
                </section>

                <section className="panel dashboard-insight-panel">
                    <div className="dashboard-panel-title">
                        <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                        <div>
                            <h2>Synthese</h2>
                            <p>{selectedClasse?.nom_classe || "Aucune classe selectionnee"}</p>
                        </div>
                    </div>

                    <div className="dashboard-status-list">
                        <div className="dashboard-status-item">
                            <div className="dashboard-status-heading">
                                <span>Moyenne classe</span>
                                <b>{payload?.moyenne_classe ? `${payload.moyenne_classe} / 20` : "--"}</b>
                            </div>
                        </div>
                        <div className="dashboard-status-item">
                            <div className="dashboard-status-heading">
                                <span>Total notes</span>
                                <b>{formatNumber(payload?.total_notes)}</b>
                            </div>
                        </div>
                        <div className="dashboard-status-item">
                            <div className="dashboard-status-heading">
                                <span>Meilleur eleve</span>
                                <b>{topStudent ? getFullName(topStudent.eleve) : "--"}</b>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="panel dashboard-table-card">
                <div className="dashboard-section-head">
                    <div>
                        <h2>Classement des eleves</h2>
                        <p>Moyennes calculees a partir des notes visibles.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="screen-state">Chargement des resultats...</div>
                ) : !filters.classe ? (
                    <div className="screen-state">Selectionnez une classe pour consulter les resultats.</div>
                ) : resultats.length === 0 ? (
                    <div className="screen-state">Aucune note enregistree pour cette classe.</div>
                ) : (
                    <div className="table-wrapper dashboard-teachers-table-wrapper">
                        <table className="dashboard-teachers-table">
                            <thead>
                                <tr>
                                    <th>Eleve</th>
                                    <th>Moyenne</th>
                                    <th>Notes</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultats.map((resultat) => (
                                    <tr key={resultat.eleve?.id}>
                                        <td>{getFullName(resultat.eleve)}</td>
                                        <td>{Number(resultat.moyenne || 0).toFixed(2)} / 20</td>
                                        <td>{formatNumber(resultat.total_notes)}</td>
                                        <td>
                                            <Link to={`/notes/${resultat.eleve?.id}`} state={{ eleve: resultat.eleve, classeId: filters.classe }}>
                                                Voir les notes
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </section>
    );
}
