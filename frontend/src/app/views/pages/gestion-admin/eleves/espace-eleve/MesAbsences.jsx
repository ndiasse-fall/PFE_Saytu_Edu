import { useEffect, useState } from "react";
import { listMyAbsences } from "../../../../../services/absences/absenceService";

function normalizeAbsences(response) {
  const data = response?.data ?? response ?? [];
  return Array.isArray(data) ? data : [];
}

export default function MesAbsences() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadAbsences();
  }, []);

  async function loadAbsences() {
    setLoading(true);
    setError("");

    try {
      const response = await listMyAbsences();
      setAbsences(normalizeAbsences(response));
    } catch (err) {
      setError(err.message || "Impossible de charger vos absences.");
      setAbsences([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section users-page absence-page">
      <header className="page-header">
        <div>
          <h2>Mes absences</h2>
          <p>Consultez vos absences et leur statut de justification.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="panel users-table-panel">
        {loading ? (
          <div className="screen-state users-table-state">Chargement des absences...</div>
        ) : absences.length === 0 ? (
          <div className="screen-state users-table-state">Aucune absence enregistrée.</div>
        ) : (
          <div className="table-wrapper users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {absences.map((absence) => (
                  <tr key={absence.id}>
                    <td>{absence.date_absence}</td>
                    <td>{absence.motif || "Non renseigné"}</td>
                    <td>
                      <span className={`badge ${absence.est_justifiee ? "badge-active" : "badge-inactive"}`}>
                        {absence.est_justifiee ? "Justifiée" : "Non justifiée"}
                      </span>
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
