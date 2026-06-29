import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../../../core/api/apiClient";

export default function BulletinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bulletin, setBulletin] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    chargerBulletin();
  }, []);

  const chargerBulletin = async () => {
    try {
      const data = await apiClient(`/bulletins/${id}`, { method: "GET" });
      setBulletin(data);
    } catch (error) {
      setErreur("Impossible de charger le bulletin.");
      console.error(error);
    }
  };

  const getAppreciation = (moyenne) => {
    if (moyenne >= 16) return "Très Bien";
    if (moyenne >= 14) return "Bien";
    if (moyenne >= 12) return "Assez Bien";
    if (moyenne >= 10) return "Passable";
    if (moyenne >= 8) return "Insuffisant";
    return "Faible";
  };

  if (erreur) return <p style={{ color: "red" }}>{erreur}</p>;
  if (!bulletin) return <p>Chargement...</p>;

  const { eleve, classe, moyenne_generale, total_coef, matieres, periode } = bulletin;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "900px", margin: "0 auto", fontSize: "13px" }}>

      <button
        onClick={() => navigate("/admin/bulletins")}
        style={{ marginBottom: "16px", padding: "6px 14px", cursor: "pointer" }}
      >
        ← Retour à la liste
      </button>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <div>
          <div><strong>SAYTU EDU</strong></div>
          <div>Dakar, Sénégal</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div><strong>Année Scolaire : {classe?.annee_scolaire ?? "-"}</strong></div>
          <div>{periode}</div>
        </div>
      </div>

      {/* Titre */}
      <div style={{ textAlign: "center", border: "2px solid black", padding: "6px", marginBottom: "10px" }}>
        <strong style={{ fontSize: "16px" }}>BULLETIN DE NOTES</strong>
      </div>

      {/* Infos élève */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "10px", border: "1px solid black", padding: "8px" }}>
        <div><strong>Prénoms :</strong> {eleve?.prenom ?? "-"}</div>
        <div><strong>Nom :</strong> {eleve?.nom ?? "-"}</div>
        <div><strong>Date de naissance :</strong> {eleve?.date_naissance ?? "-"}</div>
        <div><strong>Classe :</strong> {classe?.niveau ?? "-"} — {classe?.nom ?? "-"}</div>
        <div><strong>Matricule :</strong> {eleve?.matricule ?? "-"}</div>
      </div>

      {/* Tableau des notes */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={th}>DISCIPLINES</th>
            <th style={th}>Devoir</th>
            <th style={th}>Composition</th>
            <th style={th}>Moy /20</th>
            <th style={th}>Coef</th>
            <th style={th}>Moy x Coef</th>
            <th style={th}>Appréciation</th>
          </tr>
        </thead>
        <tbody>
          {matieres?.map((m, index) => (
            <tr key={index}>
              <td style={td}>{m.nom_matiere}</td>
              <td style={{ ...td, textAlign: "center" }}>{m.devoir ? parseFloat(m.devoir).toFixed(2) : "-"}</td>
              <td style={{ ...td, textAlign: "center" }}>{m.examen ? parseFloat(m.examen).toFixed(2) : "-"}</td>
              <td style={{ ...td, textAlign: "center" }}>{m.moyenne ?? "-"}</td>
              <td style={{ ...td, textAlign: "center" }}>{m.coefficient}</td>
              <td style={{ ...td, textAlign: "center" }}>
                {m.moyenne ? (m.moyenne * m.coefficient).toFixed(2) : "-"}
              </td>
              <td style={{ ...td, textAlign: "center" }}>{m.moyenne ? getAppreciation(m.moyenne) : "-"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
            <td style={td}>TOTAL</td>
            <td style={td}></td>
            <td style={td}></td>
            <td style={td}></td>
            <td style={{ ...td, textAlign: "center" }}>{total_coef}</td>
            <td style={td}></td>
            <td style={td}></td>
          </tr>
          <tr style={{ fontWeight: "bold" }}>
            <td style={td}>Moyenne Générale</td>
            <td style={td}></td>
            <td style={td}></td>
            <td style={{ ...td, textAlign: "center" }}>{moyenne_generale} /20</td>
            <td style={td}></td>
            <td style={td}></td>
            <td style={{ ...td, textAlign: "center" }}>{getAppreciation(moyenne_generale)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Appréciations */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", border: "1px solid black", padding: "8px" }}>
        <div>
          <div>☐ Satisfaisant, doit continuer</div>
          <div>☐ Peut Mieux Faire</div>
          <div>☐ Insuffisant</div>
          <div>☐ Risque de Redoubler</div>
          <div>☐ Risque l'exclusion</div>
        </div>
        <div>
          <div>☐ Félicitations</div>
          <div>☐ Encouragement</div>
          <div>☐ Tableau d'honneur</div>
          <div>☐ Avertissement</div>
          <div>☐ Blâme</div>
        </div>
      </div>

    </div>
  );
}

const th = { border: "1px solid black", padding: "6px", textAlign: "center" };
const td = { border: "1px solid black", padding: "5px" };