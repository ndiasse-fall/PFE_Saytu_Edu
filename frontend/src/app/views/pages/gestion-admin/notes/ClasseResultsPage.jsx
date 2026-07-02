import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../../core/api/apiClient";
import { getResultatsParClasse } from "../../../../services/notes/noteService";

function formatNumber(value) {
    if (value === null || value === undefined || value === "") return "--";
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
                setClasses(classesResponse?.data ?? classesResponse ?? []);
                setMatieres(matieresResponse?.data ?? matieresResponse ?? []);
            } catch (err) {
                setError("Impossible de charger les données.");
            }
        };
        loadReferences();
    }, []);

    useEffect(() => {
        if (!filters.classe) return;
        const loadResults = async () => {
            setLoading(true);
            try {
                const response = await getResultatsParClasse(filters.classe, {
                    matiere: filters.matiere,
                    periode: filters.periode,
                });
                setPayload(response?.data ?? response ?? null);
            } catch (err) {
                setPayload(null);
            } finally {
                setLoading(false);
            }
        };
        loadResults();
    }, [filters.classe, filters.matiere, filters.periode]);

    const resultats = payload?.resultats ?? [];
    const topStudent = useMemo(() => (resultats.length ? resultats[0] : null), [resultats]);

    return (
        <section className="dashboard-page dashboard-school-page">
            <header className="page-header-inline">
                <div>
                    <h2>Résultats par classe</h2>
                </div>
                <Link className="dashboard-primary-action" to="/notes">Retour</Link>
            </header>

            {/* Grille symétrique pour Filtres et Synthèse */}
            <div className="dashboard-insights-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Panneau Filtres complet */}
                <section className="panel dashboard-insight-panel">
                    <div className="dashboard-panel-title">
                        <h2>Filtres</h2>
                    </div>
                    
                   

                    <label className="field">
                        <span>Matière</span>
                        <select className="field-input" value={filters.matiere} onChange={(e) => setFilters({...filters, matiere: e.target.value})}>
                            <option value="">Toutes les matières</option>
                            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom_matiere || m.nom}</option>)}
                        </select>
                    </label>

                    <label className="field">
                        <span>Période</span>
                        <select className="field-input" value={filters.periode} onChange={(e) => setFilters({...filters, periode: e.target.value})}>
                            <option value="">Toutes les périodes</option>
                            <option value="Semestre 1">Semestre 1</option>
                            <option value="Semestre 2">Semestre 2</option>
                        </select>
                    </label>
                </section>

                {/* Panneau Synthèse */}
                <section className="panel dashboard-insight-panel">
                    <div className="dashboard-panel-title">
                        <h2>Synthèse</h2>
                    </div>
                    <div className="dashboard-status-list">
                        <div className="dashboard-status-item">
                            <span>Moyenne classe: </span>
                            <b>{payload?.moyenne_classe ? `${payload.moyenne_classe} / 20` : "--"}</b>
                        </div>
                        <div className="dashboard-status-item">
                            <span>Total notes: </span>
                            <b>{formatNumber(payload?.total_notes)}</b>
                        </div>
                        <div className="dashboard-status-item">
                            <span>Meilleur élève: </span>
                            <b>{topStudent ? getFullName(topStudent.eleve) : "--"}</b>
                        </div>
                    </div>
                </section>
            </div>

            {/* Tableau des résultats */}
            <section className="panel dashboard-table-card" style={{ marginTop: '20px' }}>
                <h2>Classement des élèves</h2>
                {loading ? (
                    <div>Chargement des résultats...</div>
                ) : resultats.length > 0 ? (
                    <table className="dashboard-teachers-table">
                        <thead>
                            <tr><th>Élève</th><th>Moyenne</th><th>Notes</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {resultats.map((r) => (
                                <tr key={r.eleve?.id}>
                                    <td>{getFullName(r.eleve)}</td>
                                    <td>{Number(r.moyenne || 0).toFixed(2)} / 20</td>
                                    <td>{formatNumber(r.total_notes)}</td>
                                    <td><Link to={`/notes/${r.eleve?.id}`}>Voir</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>Aucune note trouvée pour ces critères.</div>
                )}
            </section>
        </section>
    );
}