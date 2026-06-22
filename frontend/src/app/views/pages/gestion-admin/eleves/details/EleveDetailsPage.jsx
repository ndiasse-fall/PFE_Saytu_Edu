import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showEleve } from "../../../../../services/eleves/eleveService";

export function EleveDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [eleve, setEleve] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadEleve() {
            try {
                const data = await showEleve(id);
                setEleve(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadEleve();
    }, [id]);

    if (loading) {
        return (
            <div className="screen-state">
                Chargement des détails de l'élève...
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    if (!eleve) {
        return <div className="screen-state">Élève non trouvé.</div>;
    }

    return (
        <section className="page-section eleve-details-page">
            <header className="page-header-inline mb-4">
                <div>
                    <h2 translate="no">
                        Détails de l'élève : {eleve.prenom} {eleve.nom}
                    </h2>
                    <p className="muted">
                        Informations complètes de l'élève et son parcours
                        académique.
                    </p>
                </div>
                <button
                    type="button"
                    className="ghost-button"
                    onClick={() => navigate(-1)}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Retour
                </button>
            </header>

            <div className="content-grid">
                <div className="stack">
                    <div className="panel">
                        <div className="panel-header">
                            <h3>Informations Personnelles</h3>
                        </div>
                        <div className="users-details-grid">
                            <div>
                                <span className="detail-label">Prénom</span>
                                <strong translate="no">{eleve.prenom}</strong>
                            </div>
                            <div>
                                <span className="detail-label">Nom</span>
                                <strong translate="no">{eleve.nom}</strong>
                            </div>
                            <div>
                                <span className="detail-label">Email</span>
                                <strong translate="no">{eleve.email}</strong>
                            </div>
                            <div>
                                <span className="detail-label">
                                    Date de naissance
                                </span>
                                <strong>
                                    {eleve.date_naissance
                                        ? new Date(
                                              eleve.date_naissance,
                                          ).toLocaleDateString()
                                        : "Non renseignée"}
                                </strong>
                            </div>
                            <div>
                                <span className="detail-label">Téléphone</span>
                                <strong translate="no">
                                    {eleve.telephone || "Non renseigné"}
                                </strong>
                            </div>
                            <div>
                                <span className="detail-label">Adresse</span>
                                <strong translate="no">
                                    {eleve.adresse || "Non renseignée"}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h3>Contact Parent / Tuteur</h3>
                        </div>
                        <div className="users-details-grid">
                            <div>
                                <span className="detail-label">
                                    Téléphone Parent
                                </span>
                                <strong translate="no">
                                    {eleve.telephone_parent || "Non renseigné"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="stack">
                    <div className="panel">
                        <div className="panel-header">
                            <h3>Informations Scolaires</h3>
                        </div>
                        <div className="users-details-grid">
                            <div>
                                <span className="detail-label">
                                    Statut du compte
                                </span>
                                <span
                                    className={`badge ${eleve.actif ? "badge-active" : "badge-inactive"}`}
                                >
                                    {eleve.actif ? "Actif" : "Inactif"}
                                </span>
                            </div>
                            <div>
                                <span className="detail-label">
                                    Classe(s) Actuelle(s)
                                </span>
                                {(eleve.classes || eleve.eleve_classes) &&
                                (eleve.classes || eleve.eleve_classes).length >
                                    0 ? (
                                    <div className="stack gap-3 mt-2">
                                        {(
                                            eleve.classes || eleve.eleve_classes
                                        ).map((classe) => (
                                            <div
                                                key={classe.id}
                                                className="panel card-surface p-3 mb-0"
                                            >
                                                <div className="users-details-grid">
                                                    <div>
                                                        <span className="detail-label">
                                                            Niveau
                                                        </span>
                                                        <strong>
                                                            {classe.niveau}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="detail-label">
                                                            Classe
                                                        </span>
                                                        <strong>
                                                            {classe.nom_classe}
                                                        </strong>
                                                    </div>
                                                    <div>
                                                        <span className="detail-label">
                                                            Année Scolaire
                                                        </span>
                                                        <strong>
                                                            {
                                                                classe.annee_scolaire
                                                            }
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <strong className="text-muted d-block mt-1">
                                        Aucune classe affectée
                                    </strong>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h3>Actions Rapides</h3>
                        </div>
                        <div className="actions">
                            {/* On pourrait ajouter des boutons pour modifier, etc. */}
                            <button
                                type="button"
                                className="btn-primary btn-block"
                                onClick={() =>
                                    navigate(`/admin/gestion-admin/eleves`)
                                }
                            >
                                Retour à la liste
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
