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

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  if (erreur) return <p style={{ color: "red" }}>{erreur}</p>;
  if (!bulletin) return <p>Chargement...</p>;

  const { eleve, classe, moyenne_generale, total_coef, matieres, periode } = bulletin;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>

      {/* Boutons action */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button onClick={() => navigate("/admin/bulletins")}
          style={{ backgroundColor: "#1a3c8f", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>
          ← Retour à la liste
        </button>
        <button onClick={() => window.print()}
          style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}>
          🖨️ Imprimer / PDF
        </button>
      </div>

      {/* Bulletin */}
      <div id="bulletin-print" style={{ fontFamily: "Arial, sans-serif", padding: "30px", maxWidth: "960px", margin: "0 auto", fontSize: "12px", color: "#000", background: "#fff" }}>

        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>SAYTU EDU</div>
            <div>Dakar, Sénégal</div>
            <div>contact@saytuedu.sn</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", color: "#1a3c8f", fontWeight: "bold" }}>🎓</div>
            <div style={{ fontWeight: "bold", color: "#1a3c8f" }}>Saytu Edu</div>
            <div style={{ fontSize: "10px" }}>ÉTABLISSEMENT SCOLAIRE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div><strong>Année Scolaire : {classe?.annee_scolaire ?? "-"}</strong></div>
            <div>{periode}</div>
            <div>www.saytuedu.sn</div>
          </div>
        </div>

        {/* Titre */}
        <div style={{ textAlign: "center", backgroundColor: "#1a3c8f", color: "white", padding: "8px", marginBottom: "12px", fontSize: "16px", fontWeight: "bold", letterSpacing: "2px" }}>
          BULLETIN DE NOTES
        </div>

        {/* Infos élève */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", border: "1px solid #ccc", padding: "10px", borderRadius: "4px" }}>
          <div style={{ width: "80px", height: "90px", backgroundColor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", fontSize: "10px", color: "#666" }}>
            Photo
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
              <div><strong>Nom :</strong> {eleve?.nom ?? "-"}</div>
              <div><strong>Classe :</strong> {classe?.niveau ?? "-"}</div>
              <div><strong>Prénoms :</strong> {eleve?.prenom ?? "-"}</div>
              <div><strong>Établissement :</strong> {classe?.nom ?? "-"}</div>
              <div><strong>Date de naissance :</strong> {formatDate(eleve?.date_naissance)}</div>
              <div><strong>Matricule :</strong> {eleve?.matricule ?? "-"}</div>
            </div>
          </div>
        </div>

        {/* Tableau des notes */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a3c8f", color: "white" }}>
              <th style={th}>DISCIPLINES</th>
              <th style={th}>Devoir</th>
              <th style={th}>Compo</th>
              <th style={th}>Moy/20</th>
              <th style={th}>Coef</th>
              <th style={th}>Moy x Coef</th>
              <th style={th}>Rang</th>
              <th style={th}>Appréciations</th>
            </tr>
          </thead>
          <tbody>
            {matieres?.map((m, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                <td style={{ ...td, fontWeight: "bold" }}>{m.nom_matiere}</td>
                <td style={{ ...td, textAlign: "center" }}>{m.devoir ? parseFloat(m.devoir).toFixed(1) : "-"}</td>
                <td style={{ ...td, textAlign: "center" }}>{m.examen ? parseFloat(m.examen).toFixed(1) : "-"}</td>
                <td style={{ ...td, textAlign: "center", fontWeight: "bold", color: m.moyenne >= 10 ? "#1a3c8f" : "red" }}>
                  {m.moyenne ? parseFloat(m.moyenne).toFixed(2) : "-"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>{m.coefficient}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  {m.moyenne ? (m.moyenne * m.coefficient).toFixed(2) : "-"}
                </td>
                <td style={{ ...td, textAlign: "center" }}>-</td>
                <td style={{ ...td, textAlign: "center", fontStyle: "italic" }}>{m.moyenne ? getAppreciation(m.moyenne) : "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#e8e8e8", fontWeight: "bold" }}>
              <td style={td}>TOTAL GÉNÉRAL</td>
              <td style={td}></td>
              <td style={td}></td>
              <td style={td}></td>
              <td style={{ ...td, textAlign: "center" }}>{total_coef}</td>
              <td style={{ ...td, textAlign: "center" }}>
                {matieres?.reduce((sum, m) => sum + (m.moyenne ? m.moyenne * m.coefficient : 0), 0).toFixed(2)}
              </td>
              <td style={td}></td>
              <td style={td}></td>
            </tr>
          </tfoot>
        </table>

        {/* Synthèse et Avis */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div style={{ border: "1px solid #1a3c8f", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ backgroundColor: "#1a3c8f", color: "white", padding: "6px 10px", fontWeight: "bold" }}>
              📊 SYNTHÈSE DES RÉSULTATS
            </div>
            <div style={{ padding: "10px" }}>
              <div style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", color: "#1a3c8f", margin: "8px 0" }}>
                {moyenne_generale} <span style={{ fontSize: "14px" }}>/20</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px" }}>
                <div>Rang dans la classe :</div><div><strong>-</strong></div>
                <div>Disciplines ≥ 10 :</div>
                <div><strong>{matieres?.filter(m => m.moyenne >= 10).length ?? 0}</strong></div>
                <div>Moyenne la plus haute :</div>
                <div><strong>{matieres?.length ? Math.max(...matieres.filter(m => m.moyenne).map(m => m.moyenne)).toFixed(2) : "-"}</strong></div>
                <div>Moyenne la plus basse :</div>
                <div><strong>{matieres?.length ? Math.min(...matieres.filter(m => m.moyenne).map(m => m.moyenne)).toFixed(2) : "-"}</strong></div>
              </div>
              <div style={{ textAlign: "center", marginTop: "8px", backgroundColor: moyenne_generale >= 10 ? "#d4edda" : "#f8d7da", padding: "4px", borderRadius: "4px", fontWeight: "bold", color: moyenne_generale >= 10 ? "#155724" : "#721c24" }}>
                {getAppreciation(moyenne_generale).toUpperCase()}
              </div>
            </div>
          </div>

          <div style={{ border: "1px solid #1a3c8f", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ backgroundColor: "#1a3c8f", color: "white", padding: "6px 10px", fontWeight: "bold" }}>
              📋 AVIS À CONSULTER
            </div>
            <div style={{ padding: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "11px" }}>
              <div>☐ Satisfaisant, doit continuer</div>
              <div>☐ Félicitations</div>
              <div>☐ Peut Mieux Faire</div>
              <div>☐ Encouragement</div>
              <div>☐ Insuffisant</div>
              <div>☐ Tableau d'honneur</div>
              <div>☐ Risque de Redoubler</div>
              <div>☐ Avertissement</div>
              <div>☐ Risque l'exclusion</div>
              <div>☐ Blâme</div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "16px", textAlign: "center", fontSize: "11px" }}>
          <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "4px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "30px" }}>Le Conseil de Classe</div>
            <div style={{ borderTop: "1px solid #ccc", paddingTop: "4px" }}>Date d'édition : {new Date().toLocaleDateString("fr-FR")}</div>
          </div>
          <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "4px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "30px" }}>Chef d'Établissement</div>
            <div style={{ borderTop: "1px solid #ccc", paddingTop: "4px" }}>Signature & Cachet</div>
          </div>
          <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "4px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "30px" }}>Le Proviseur</div>
            <div style={{ borderTop: "1px solid #ccc", paddingTop: "4px" }}>Signature & Cachet</div>
          </div>
        </div>

        {/* Décision */}
        <div style={{ marginTop: "12px", border: "1px solid #1a3c8f", padding: "8px", borderRadius: "4px", textAlign: "center", fontWeight: "bold", color: "#1a3c8f" }}>
          Décision du Conseil : {moyenne_generale >= 10 ? "PASSÉ EN CLASSE SUPÉRIEURE" : "REDOUBLEMENT"}
        </div>

      </div>
    </div>
  );
}

const th = { border: "1px solid #fff", padding: "6px", textAlign: "center", fontWeight: "bold" };
const td = { border: "1px solid #ddd", padding: "5px 6px" };