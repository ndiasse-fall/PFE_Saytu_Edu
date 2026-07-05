function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(date));
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "-";
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "-";
  return parsed.toFixed(digits);
}

function appreciation(moyenne) {
  const value = Number(moyenne || 0);
  if (value >= 16) return "Très Bien";
  if (value >= 14) return "Bien";
  if (value >= 12) return "Assez Bien";
  if (value >= 10) return "Passable";
  if (value >= 8) return "Insuffisant";
  return "Faible";
}

function normalizeScore(score, scale = 20) {
  const value = Number(score || 0);
  if (scale <= 0) return value;
  return (value / scale) * 20;
}

function avisPaliers(moyenne) {
  const value = Number(moyenne || 0);

  return [
    [value >= 14, "Satisfaisant, doit continuer"],
    [value >= 16, "Félicitations"],
    [value >= 10 && value < 12, "Peut Mieux Faire"],
    [value >= 12 && value < 14, "Encouragement"],
    [value < 10 && value >= 8, "Insuffisant"],
    [value >= 18, "Tableau d'honneur"],
    [value < 8 && value >= 6, "Risque de Redoubler"],
    [value < 6 && value >= 4, "Avertissement"],
    [value < 4 && value >= 2, "Risque l'exclusion"],
    [value < 2, "Blâme"],
  ];
}

function getMaxMoyenne(matieres) {
  const values = (matieres || []).map((matiere) => Number(matiere.moyenne)).filter((value) => !Number.isNaN(value));
  return values.length ? Math.max(...values).toFixed(2) : "-";
}

function getMinMoyenne(matieres) {
  const values = (matieres || []).map((matiere) => Number(matiere.moyenne)).filter((value) => !Number.isNaN(value));
  return values.length ? Math.min(...values).toFixed(2) : "-";
}

export function BulletinReport({ bulletin, onBack, backLabel = "Retour" }) {
  const {
    etablissement,
    eleve,
    classe,
    matieres = [],
    moyenne_generale,
    total_coef,
    total_points,
    rang,
    appreciation: appreciationGenerale,
    decision,
    absences,
    periode,
    note_scale: noteScale = 20,
  } = bulletin;

  const moyenne = Number(moyenne_generale || 0);
  const normalizedMoyenne = normalizeScore(moyenne, noteScale);
  const totalGeneral = Number(total_points || 0);
  const totalDiscipline = matieres.filter((matiere) => normalizeScore(matiere.moyenne, noteScale) >= 10).length;

  return (
    <section className="bulletin-paper-page">
      {onBack ? (
        <div className="bulletin-paper-toolbar no-print">
          <button type="button" className="ghost-button" onClick={onBack}>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            {backLabel}
          </button>
          <button type="button" className="btn-primary" onClick={() => window.print()}>
            <i className="bi bi-printer" aria-hidden="true" />
            Imprimer / PDF
          </button>
        </div>
      ) : null}

      <article id="bulletin-print" className="school-report legacy-school-report">
        <header className="legacy-report-header">
          <div className="legacy-report-left">
            <strong>SAYTU EDU</strong>
            <span>Dakar, Sénégal</span>
            <span>contact@saytuedu.sn</span>
          </div>
          <div className="legacy-report-center">
            <div className="legacy-report-icon">🎓</div>
            <strong>Saytu Edu</strong>
            <span>ÉTABLISSEMENT SCOLAIRE</span>
          </div>
          <div className="legacy-report-right">
            <strong>Année Scolaire : {classe?.annee_scolaire ?? etablissement?.annee_scolaire ?? "-"}</strong>
            <span>{periode || "Toutes les périodes"}</span>
            <span>www.saytuedu.sn</span>
          </div>
        </header>

        <div className="legacy-report-title">BULLETIN DE NOTES</div>

        <section className="legacy-report-identity">
          <div>
            <strong>Nom :</strong> {eleve?.nom ?? "-"}
          </div>
          <div>
            <strong>Classe :</strong> {classe?.nom ?? classe?.nom_classe ?? "-"}
          </div>
          <div>
            <strong>Prénoms :</strong> {eleve?.prenom ?? "-"}
          </div>
          <div>
            <strong>Établissement :</strong> {etablissement?.nom ?? "Saytu Edu"}
          </div>
          <div>
            <strong>Date de naissance :</strong> {formatDate(eleve?.date_naissance)}
          </div>
          <div>
            <strong>Matricule :</strong> {eleve?.matricule ?? "-"}
          </div>
        </section>

        <table className="legacy-report-table">
          <thead>
            <tr>
              <th>DISCIPLINES</th>
              <th>Devoir</th>
              <th>Compo</th>
                <th>Moy/{noteScale}</th>
              <th>Coef</th>
              <th>Moy x Coef</th>
              <th>Rang</th>
              <th>Appréciations</th>
            </tr>
          </thead>
          <tbody>
            {matieres.map((matiere, index) => (
              <tr key={matiere.id_matiere || matiere.nom_matiere || index}>
                <td className="legacy-report-subject">
                  <strong>{matiere.nom_matiere}</strong>
                </td>
                <td>{formatNumber(matiere.devoir, 1)}</td>
                <td>{formatNumber(matiere.composition ?? matiere.examen, 1)}</td>
                <td className={normalizeScore(matiere.moyenne, noteScale) >= 10 ? "report-positive" : "report-danger"}>
                  {formatNumber(matiere.moyenne)}
                </td>
                <td>{matiere.coefficient}</td>
                <td>{formatNumber(matiere.points ?? (Number(matiere.moyenne || 0) * Number(matiere.coefficient || 0)))}</td>
                <td>-</td>
                <td>{matiere.appreciation || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="legacy-report-total">
              <td>TOTAL GÉNÉRAL</td>
              <td />
              <td />
              <td>{formatNumber(moyenne)}</td>
              <td>{total_coef ?? "-"}</td>
              <td>{formatNumber(totalGeneral)}</td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>

        <section className="legacy-report-panels">
          <article className="legacy-report-box">
            <div className="legacy-report-box-title">📊 SYNTHÈSE DES RÉSULTATS</div>
            <div className="legacy-report-box-body">
              <div className="legacy-report-score">
                {formatNumber(moyenne)} <span>/{noteScale}</span>
              </div>
              <div className="legacy-report-stats">
                <span>Rang dans la classe :</span><strong>{rang ? `${rang}` : "-"}</strong>
                <span>Disciplines &gt; 10 :</span><strong>{totalDiscipline}</strong>
                <span>Moyenne la plus haute :</span><strong>{getMaxMoyenne(matieres)}</strong>
                <span>Moyenne la plus basse :</span><strong>{getMinMoyenne(matieres)}</strong>
              </div>
              <div className={`legacy-report-mention ${normalizedMoyenne >= 10 ? "is-pass" : "is-fail"}`}>
                {(appreciationGenerale || appreciation(normalizedMoyenne)).toUpperCase()}
              </div>
            </div>
          </article>

          <article className="legacy-report-box">
            <div className="legacy-report-box-title">📋 AVIS À CONSULTER</div>
            <div className="legacy-report-box-body legacy-report-avis">
              {avisPaliers(normalizedMoyenne).map(([checked, label]) => (
                <div key={label}>
                  {checked ? "☑" : "☐"} {label}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="legacy-report-signatures">
          <div className="legacy-signature-card">
            <strong>Le Conseil de Classe</strong>
            <span>Date d'édition : {new Intl.DateTimeFormat("fr-FR").format(new Date())}</span>
          </div>
          <div className="legacy-signature-card">
            <strong>Chef d'Établissement</strong>
            <span>Signature & Cachet</span>
          </div>
          <div className="legacy-signature-card">
            <strong>Le Proviseur</strong>
            <span>Signature & Cachet</span>
          </div>
        </section>

        <div className="legacy-report-decision">
          Décision du Conseil : {decision || (moyenne >= 10 ? "PASSÉ EN CLASSE SUPÉRIEURE" : "REDOUBLEMENT")}
        </div>
      </article>
    </section>
  );
}
