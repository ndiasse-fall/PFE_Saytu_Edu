import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBulletins } from "../../../../services/bulletins/bulletinService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function BulletinList() {
  const [bulletins, setBulletins] = useState([]);
  const [filtreClasse, setFiltreClasse] = useState("toutes");
  const [filtrePeriode, setFiltrePeriode] = useState("toutes");
  const [page, setPage] = useState(1);
  const parPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getBulletins();
      setBulletins(data.data ?? data);
    } catch (error) {
      console.error("Erreur chargement bulletins:", error);
    }
  };

  // Listes uniques pour filtres
  const classes = ["toutes", ...new Set(bulletins.map(b => b.classe ?? "Sans classe"))];
  const periodes = ["toutes", ...new Set(bulletins.map(b => b.periode))];

  // Filtrage
  const filtres = bulletins.filter(b => {
    const okClasse = filtreClasse === "toutes" || b.classe === filtreClasse;
    const okPeriode = filtrePeriode === "toutes" || b.periode === filtrePeriode;
    return okClasse && okPeriode;
  });

  // Pagination
  const total = filtres.length;
  const pages = Math.ceil(total / parPage);
  const pagines = filtres.slice((page - 1) * parPage, page * parPage);

  // Stats
  const moyenneEcole = bulletins.length
    ? (bulletins.reduce((s, b) => s + parseFloat(b.moyenne || 0), 0) / bulletins.length).toFixed(2)
    : "0.00";
  const sansNotes = bulletins.filter(b => !b.moyenne || b.moyenne === 0).length;

  const getInitiales = (nom) => {
    const parts = nom?.split(" ") ?? [];
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMoyenneColor = (moy) => {
    if (moy >= 14) return "#28a745";
    if (moy >= 10) return "#1a3c8f";
    return "#dc3545";
  };
  const telechargerBulletin = async (eleveId, eleveNom) => {
  navigate(`/admin/bulletins/${eleveId}`);
  setTimeout(async () => {
    const element = document.getElementById("bulletin-print");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`bulletin_${eleveNom}.pdf`);
  }, 2000);
};


  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>

      {/* En-tête */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Gestion des Bulletins</h2>
          <p style={{ color: "#666", margin: "4px 0 0" }}>Gérez, consultez et téléchargez les résultats académiques des élèves.</p>
        </div>
        <button style={{ backgroundColor: "#1a3c8f", color: "white", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          📄 Générer les bulletins
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
        {[
          { label: "BULLETINS GÉNÉRÉS", value: bulletins.length, color: "#1a3c8f", icon: "📄" },
          { label: "EN ATTENTE DE VALIDATION", value: sansNotes, color: "#ff9800", icon: "⏳" },
          { label: "MOYENNE GÉNÉRALE ÉCOLE", value: `${moyenneEcole}/20`, color: "#28a745", icon: "📈" },
          { label: "ÉLÈVES SANS NOTES", value: sansNotes, color: "#dc3545", icon: "⚠️" },
        ].map((stat, i) => (
          <div key={i} style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", backgroundColor: "#fff" }}>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", marginBottom: "20px", backgroundColor: "#fff" }}>
        <div style={{ fontWeight: "bold", marginBottom: "12px" }}>🔍 Filtres de recherche</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#666" }}>PÉRIODE</label>
            <select value={filtrePeriode} onChange={e => { setFiltrePeriode(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "4px" }}>
              {periodes.map(p => <option key={p} value={p}>{p === "toutes" ? "Toutes les périodes" : p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#666" }}>CLASSE</label>
            <select value={filtreClasse} onChange={e => { setFiltreClasse(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", marginTop: "4px" }}>
              {classes.map(c => <option key={c} value={c}>{c === "toutes" ? "Toutes les classes" : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#fff", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #e0e0e0" }}>
          <strong>Liste des élèves</strong>
          <span style={{ color: "#666", fontSize: "13px" }}>Affichage de {total} élèves</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", fontSize: "12px", color: "#666" }}>
              <th style={th}>ÉLÈVE</th>
              <th style={th}>MATRICULE</th>
              <th style={th}>CLASSE</th>
              <th style={th}>MOYENNE</th>
              <th style={th}>RANG</th>
              <th style={th}>PÉRIODE</th>
              <th style={th}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pagines.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      backgroundColor: "#1a3c8f", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: "bold", flexShrink: 0
                    }}>
                      {getInitiales(item.eleve?.nom)}
                    </div>
                    <span style={{ fontWeight: "500" }}>{item.eleve?.nom}</span>
                  </div>
                </td>
                <td style={{ ...td, color: "#666", fontSize: "12px" }}>-</td>
                <td style={td}>{item.classe ?? "-"}</td>
                <td style={td}>
                  <span style={{ fontWeight: "bold", color: getMoyenneColor(item.moyenne) }}>
                    {item.moyenne}
                  </span>
                </td>
                <td style={{ ...td, color: "#666" }}>{(page - 1) * parPage + index + 1}</td>
                <td style={td}>{item.periode}</td>
                <td style={td}>
                  <button
                    onClick={() => navigate(`/admin/bulletins/${item.eleve.id}`)}
                    style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#1a3c8f", fontSize: "18px", padding: "2px 6px" }}
                    title="Voir le bulletin"
                  >
                    👁
                  </button>
                  <button
                     onClick={() => telechargerBulletin(item.eleve.id, item.eleve.nom)}
                     style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "#28a745", fontSize: "18px", padding: "2px 6px" }}
                     title="Télécharger le bulletin"
                  >
                     ⬇
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", padding: "14px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: "4px 10px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", backgroundColor: page === 1 ? "#f5f5f5" : "#fff" }}>
              ← Précédent
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: "4px 10px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", backgroundColor: page === p ? "#1a3c8f" : "#fff", color: page === p ? "white" : "#000" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              style={{ padding: "4px 10px", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", backgroundColor: page === pages ? "#f5f5f5" : "#fff" }}>
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left", fontWeight: "600" };
const td = { padding: "12px 14px" };