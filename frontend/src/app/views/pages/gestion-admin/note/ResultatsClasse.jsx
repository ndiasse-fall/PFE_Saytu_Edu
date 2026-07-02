import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getResultatsClasse } from '../../../../services/note/noteService';
import { apiClient } from '../../../../core/api/apiClient';

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return new Intl.NumberFormat('fr-FR').format(Number(value));
}

function getFullName(eleve) {
  if (!eleve) return 'Élève non renseigné';
  return `${eleve.prenom ?? ''} ${eleve.nom ?? ''}`.trim() || 'Élève non renseigné';
}

export default function ResultatsClasse() {
  const [classes, setClasses] = useState([]);
  const [classeId, setClasseId] = useState('');
  const [classeLabel, setClasseLabel] = useState('');
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiClient('/classes');
        const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        setClasses(data);

        if (data.length > 0) {
          const firstClass = data[0];
          const firstId = String(firstClass.id);
          setClasseId(firstId);
          setClasseLabel(firstClass.nom_classe || firstClass.nom || 'Classe');
          void rechercher(firstId, data);
        }
      } catch (err) {
        console.error('ERROR CLASSES =>', err);
        setError('Impossible de charger les classes pour le moment.');
      }
    };

    void fetchClasses();
  }, []);

  const rechercher = async (id, list = classes) => {
    const cid = id || classeId;
    if (!cid) return;

    setLoading(true);
    setError('');

    try {
      const response = await getResultatsClasse(cid);
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : Array.isArray(response?.data?.resultats)
            ? response.data.resultats
            : Array.isArray(response?.resultats)
              ? response.resultats
              : [];

      setResultats(payload);

      const selectedClass = (list || classes).find((item) => String(item.id) === String(cid));
      setClasseLabel(selectedClass?.nom_classe || selectedClass?.nom || 'Classe');
    } catch (err) {
      console.error('ERROR RESULTATS =>', err);
      setResultats([]);
      setError('Les résultats n’ont pas pu être chargés pour cette classe.');
    } finally {
      setLoading(false);
    }
  };

  const handleClasseChange = (event) => {
    const value = event.target.value;
    setClasseId(value);
    const selectedClass = classes.find((item) => String(item.id) === String(value));
    setClasseLabel(selectedClass?.nom_classe || selectedClass?.nom || 'Classe');
    void rechercher(value, classes);
  };

  const average = useMemo(() => {
    if (!resultats.length) return 0;

    const total = resultats.reduce((sum, item) => sum + Number(item?.moyenne ?? item?.moyenne_generale ?? 0), 0);
    return total / resultats.length;
  }, [resultats]);

  const topStudent = resultats[0] ?? null;

  return (
    <section className="dashboard-page dashboard-school-page">
      <header className="page-header-inline">
        <div>
          <h2>Résultats par classe</h2>
          <p>Vue synthétique pour superviser les performances des élèves depuis le tableau de bord superadmin.</p>
        </div>
        <div className="dashboard-header-actions">
          <Link className="dashboard-primary-action" to="/admin/dashboard">
            <i className="bi bi-speedometer2" aria-hidden="true" />
            Retour au tableau de bord
          </Link>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="dashboard-metrics dashboard-school-metrics" aria-busy={loading}>
        <article className="panel dashboard-stat-card dashboard-school-stat-card">
          <span className="dashboard-school-stat-icon" aria-hidden="true">
            <i className="bi bi-buildings" />
          </span>
          <div className="dashboard-school-stat-content">
            <div className="dashboard-stat-value primary">{formatNumber(classes.length)}</div>
            <div className="dashboard-stat-copy">
              <div className="dashboard-stat-label">Classes disponibles</div>
              <span>Nombre de classes gérées</span>
            </div>
          </div>
        </article>

        <article className="panel dashboard-stat-card dashboard-school-stat-card">
          <span className="dashboard-school-stat-icon" aria-hidden="true">
            <i className="bi bi-people-fill" />
          </span>
          <div className="dashboard-school-stat-content">
            <div className="dashboard-stat-value primary">{formatNumber(resultats.length)}</div>
            <div className="dashboard-stat-copy">
              <div className="dashboard-stat-label">Élèves analysés</div>
              <span>Résultats chargés pour la classe</span>
            </div>
          </div>
        </article>

        <article className="panel dashboard-stat-card dashboard-school-stat-card">
          <span className="dashboard-school-stat-icon" aria-hidden="true">
            <i className="bi bi-graph-up-arrow" />
          </span>
          <div className="dashboard-school-stat-content">
            <div className="dashboard-stat-value primary">{average ? `${average.toFixed(2)} / 20` : '—'}</div>
            <div className="dashboard-stat-copy">
              <div className="dashboard-stat-label">Moyenne générale</div>
              <span>Vue instantanée de la classe</span>
            </div>
          </div>
        </article>
      </div>

      <div className="dashboard-insights-grid">
        <section className="panel dashboard-insight-panel">
          <div className="dashboard-panel-title">
            <i className="bi bi-funnel" aria-hidden="true" />
            <div>
              <h2>Filtre de classe</h2>
              <p>Sélectionnez la classe à analyser.</p>
            </div>
          </div>

          <label className="dashboard-stat-label" htmlFor="classe-select">
            Classe active
          </label>
          <select
            id="classe-select"
            className="form-select"
            value={classeId}
            onChange={handleClasseChange}
          >
            <option value="">-- Choisir une classe --</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom_classe || classe.nom || `Classe ${classe.id}`}
              </option>
            ))}
          </select>
        </section>

        <section className="panel dashboard-insight-panel">
          <div className="dashboard-panel-title">
            <i className="bi bi-award" aria-hidden="true" />
            <div>
              <h2>Meilleure performance</h2>
              <p>Le meilleur résultat actuellement visible.</p>
            </div>
          </div>

          <div className="dashboard-status-list">
            <div className="dashboard-status-item">
              <div className="dashboard-status-heading">
                <span className="dashboard-status-icon success"><i className="bi bi-trophy" /></span>
                <div>
                  <span>Classe sélectionnée</span>
                  <strong>{classeLabel || 'Aucune classe'}</strong>
                </div>
                <b>{topStudent ? `${Number(topStudent?.moyenne ?? topStudent?.moyenne_generale ?? 0).toFixed(2)} / 20` : '—'}</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="panel dashboard-table-card">
        <div className="dashboard-section-head">
          <div>
            <h2>Classement des élèves</h2>
            <p>Résultats détaillés de la classe {classeLabel || 'sélectionnée'}.</p>
          </div>
        </div>

        {loading ? (
          <div className="screen-state">Chargement des résultats en cours...</div>
        ) : !classeId ? (
          <div className="screen-state">Sélectionnez une classe pour consulter les résultats.</div>
        ) : resultats.length === 0 ? (
          <div className="screen-state">Aucune note n’a encore été enregistrée pour cette classe.</div>
        ) : (
          <div className="table-wrapper dashboard-teachers-table-wrapper">
            <table className="dashboard-teachers-table">
              <thead>
                <tr>
                  <th scope="col">Élève</th>
                  <th scope="col">Moyenne</th>
                  <th scope="col">Rang</th>
                  <th scope="col">État</th>
                </tr>
              </thead>
              <tbody>
                {resultats.map((resultat, index) => {
                  const moyenne = Number(resultat?.moyenne ?? resultat?.moyenne_generale ?? 0);
                  const status = moyenne >= 10 ? 'Validé' : 'À consolider';

                  return (
                    <tr key={`${resultat?.eleve?.id ?? index}-${index}`}>
                      <td>
                        <span className="teacher-identity">
                          <span className="teacher-avatar" aria-hidden="true">
                            {getFullName(resultat?.eleve).charAt(0).toUpperCase()}
                          </span>
                          <strong>{getFullName(resultat?.eleve)}</strong>
                        </span>
                      </td>
                      <td>
                        <span className="data-tag">{moyenne.toFixed(2)} / 20</span>
                      </td>
                      <td>#{index + 1}</td>
                      <td>
                        <span className={`data-tag ${moyenne >= 10 ? 'success' : 'warning'}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}