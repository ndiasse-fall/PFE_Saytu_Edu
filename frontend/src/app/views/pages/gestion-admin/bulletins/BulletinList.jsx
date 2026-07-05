import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TablePagination from "@mui/material/TablePagination";
import { getBulletins } from "../../../../services/bulletins/bulletinService";
import { apiClient } from "../../../../core/api/apiClient";

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function studentName(item) {
  return item.eleve?.nom_complet || item.eleve?.nom || item.nom || "Élève";
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function averageTone(value, scale = 20) {
  const moyenne = Number(value || 0);
  const normalized = scale > 0 ? (moyenne / scale) * 20 : moyenne;
  if (normalized >= 14) return "success";
  if (normalized >= 10) return "primary";
  return "danger";
}

function displayAverage(value, scale = 20) {
  const moyenne = Number(value || 0);
  return `${moyenne.toFixed(2)}/${scale}`;
}

function normalizedAverage(value, scale = 20) {
  const moyenne = Number(value || 0);
  return scale > 0 ? (moyenne / scale) * 20 : moyenne;
}

export default function BulletinList() {
  const navigate = useNavigate();
  const [bulletins, setBulletins] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    niveau: "all",
    classe: "all",
    periode: "all",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [classesResponse, bulletinsResponse] = await Promise.all([
          apiClient("/classes"),
          getBulletins(),
        ]);

        if (!mounted) return;

        setClasses(Array.isArray(classesResponse) ? classesResponse : classesResponse?.data ?? []);
        setBulletins(bulletinsResponse?.data ?? bulletinsResponse ?? []);
      } catch (err) {
        if (mounted) setError(err.message || "Impossible de charger les bulletins.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const niveaux = useMemo(() => [...new Set(classes.map((classe) => classe.niveau).filter(Boolean))].sort(), [classes]);
  const periodes = useMemo(() => [...new Set(bulletins.map((item) => item.periode).filter(Boolean))].sort(), [bulletins]);
  const filteredClasses = filters.niveau === "all"
    ? classes
    : classes.filter((classe) => classe.niveau === filters.niveau);

  const filteredBulletins = useMemo(() => {
    return bulletins.filter((item) => {
      const name = studentName(item);
      const classeName = item.classe?.nom || item.classe?.nom_classe || item.classe || "";
      const classeRecord = classes.find((classe) => classe.nom_classe === classeName);
      const niveau = item.classe?.niveau || item.niveau || classeRecord?.niveau || "";
      const periode = item.periode || "";

      return (
        (!filters.search || normalize(name).includes(normalize(filters.search))) &&
        (filters.niveau === "all" || normalize(niveau) === normalize(filters.niveau)) &&
        (filters.classe === "all" || normalize(classeName) === normalize(filters.classe)) &&
        (filters.periode === "all" || normalize(periode) === normalize(filters.periode))
      );
    });
  }, [bulletins, classes, filters]);

  const paginated = filteredBulletins.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const moyenneEcole = filteredBulletins.length
    ? filteredBulletins.reduce(
      (sum, item) => sum + normalizedAverage(item.moyenne, item.note_scale || 20),
      0,
    ) / filteredBulletins.length
    : 0;
  const admissibles = filteredBulletins.filter(
    (item) => normalizedAverage(item.moyenne, item.note_scale || 20) >= 10,
  ).length;

  function updateFilters(next) {
    setFilters(next);
    setPage(0);
  }

  return (
    <section className="bulletin-list-page">
      <header className="page-header-inline">
        <div>
          <h2>Bulletins scolaires</h2>
          <p>Consultez les résultats, contrôlez les moyennes et préparez les impressions.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="bulletin-kpi-grid">
        <article className="panel bulletin-kpi-card">
          <span>Bulletins</span>
          <strong>{filteredBulletins.length}</strong>
          <small>Résultats visibles selon les filtres</small>
        </article>
        <article className="panel bulletin-kpi-card">
          <span>Moyenne école</span>
          <strong>{moyenneEcole.toFixed(2)}/20</strong>
          <small>Sur les bulletins filtrés</small>
        </article>
        <article className="panel bulletin-kpi-card">
          <span>Admis</span>
          <strong>{admissibles}</strong>
          <small>Moyenne supérieure ou égale à 10</small>
        </article>
        <article className="panel bulletin-kpi-card">
          <span>À surveiller</span>
          <strong>{filteredBulletins.length - admissibles}</strong>
          <small>Besoin d’accompagnement</small>
        </article>
      </div>

      <section className="panel bulletin-filter-panel">
        <label className="field">
          <span className="field-label">Recherche élève</span>
          <input
            className="field-input"
            value={filters.search}
            onChange={(event) => updateFilters({ ...filters, search: event.target.value })}
            placeholder="Nom, prénom ou matricule"
            type="search"
          />
        </label>
        <label className="field">
          <span className="field-label">Niveau</span>
          <select
            className="field-input"
            value={filters.niveau}
            onChange={(event) => updateFilters({ ...filters, niveau: event.target.value, classe: "all" })}
          >
            <option value="all">Tous les niveaux</option>
            {niveaux.map((niveau) => <option key={niveau} value={niveau}>{niveau}</option>)}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Classe</span>
          <select
            className="field-input"
            value={filters.classe}
            onChange={(event) => updateFilters({ ...filters, classe: event.target.value })}
          >
            <option value="all">Toutes les classes</option>
            {filteredClasses.map((classe) => (
              <option key={classe.id} value={classe.nom_classe}>{classe.nom_classe}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Période</span>
          <select
            className="field-input"
            value={filters.periode}
            onChange={(event) => updateFilters({ ...filters, periode: event.target.value })}
          >
            <option value="all">Toutes les périodes</option>
            {periodes.map((periode) => <option key={periode} value={periode}>{periode}</option>)}
          </select>
        </label>
      </section>

      <section className="panel users-table-panel">
        {loading ? (
          <div className="screen-state">Chargement des bulletins...</div>
        ) : filteredBulletins.length === 0 ? (
          <div className="screen-state">Aucun bulletin ne correspond aux filtres.</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="users-table bulletin-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Classe</th>
                    <th>Période</th>
                    <th>Moyenne</th>
                    <th>Rang</th>
                    <th>Appréciation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => {
                    const name = studentName(item);
                    const eleveId = item.eleve?.id || item.id;
                    return (
                      <tr key={`${eleveId}-${item.periode}`}>
                        <td>
                          <div className="bulletin-student-cell">
                            <span className="bulletin-avatar">{getInitials(name)}</span>
                            <div>
                              <strong>{name}</strong>
                              <small>{item.eleve?.matricule || "Matricule non renseigné"}</small>
                            </div>
                          </div>
                        </td>
                        <td>{item.classe?.nom || item.classe?.nom_classe || item.classe || "-"}</td>
                        <td>{item.periode || "-"}</td>
                        <td>
                          <span className={`status-pill ${averageTone(item.moyenne, item.note_scale || 20)}`}>
                            {displayAverage(item.moyenne, item.note_scale || 20)}
                          </span>
                        </td>
                        <td>{item.rang ? `${item.rang}e` : "-"}</td>
                        <td>{item.appreciation || "-"}</td>
                        <td>
                          <div className="table-actions-inline">
                            <button type="button" className="ghost-button" onClick={() => navigate(`/admin/bulletins/${eleveId}`)}>
                              Voir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination
              className="users-table-pagination"
              component="div"
              count={filteredBulletins.length}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 25, 50]}
              onPageChange={(event, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </section>
    </section>
  );
}
