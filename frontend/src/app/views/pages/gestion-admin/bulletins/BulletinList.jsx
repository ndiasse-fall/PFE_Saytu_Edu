import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getBulletins } from "../../../../services/bulletins/bulletinService";
import { apiClient } from "../../../../core/api/apiClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function BulletinList() {
  const [bulletins, setBulletins] = useState([]);
  const [classes, setClasses] = useState([]);
  const [periodes, setPeriodes] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  
  const [filtreNiveau, setFiltreNiveau] = useState("tous");
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
      const classesRes = await apiClient("/classes");
      const classesData = Array.isArray(classesRes) ? classesRes : classesRes.data || [];
      setClasses(classesData);
      
      const niveauxUniques = [...new Set(classesData.map(c => c.niveau).filter(Boolean))].sort();
      setNiveaux(niveauxUniques);

      const bulletinsRes = await getBulletins();
      const bulletinsData = bulletinsRes.data ?? bulletinsRes ?? [];
      setBulletins(bulletinsData);

      const periodesUniques = [...new Set(bulletinsData.map(b => b.periode).filter(p => p && p !== 'Toutes périodes'))].sort();
      setPeriodes(periodesUniques);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    }
  };

  const normalize = (value) => (value ? String(value).toLowerCase().trim() : "");

  // Filtrer dynamiquement les classes selon le niveau
  const classesFiltrées = useMemo(() => {
    return filtreNiveau === "tous" ? classes : classes.filter(c => c.niveau === filtreNiveau);
  }, [filtreNiveau, classes]);

  // Logique de filtrage des bulletins
  const bulletinsFiltrés = useMemo(() => {
    return bulletins.filter((b) => {
      const classeNom = b.classe?.nom_classe || b.nom_classe || b.classe || "";
      const classeNiveau = b.classe?.niveau || b.niveau || "";
      const periode = b.periode || "";

      const matchNiveau = filtreNiveau === "tous" || normalize(classeNiveau) === normalize(filtreNiveau);
      const matchClasse = filtreClasse === "toutes" || normalize(classeNom) === normalize(filtreClasse);
      const matchPeriode = filtrePeriode === "toutes" || normalize(periode) === normalize(filtrePeriode);
      
      return matchNiveau && matchClasse && matchPeriode;
    });
  }, [bulletins, filtreNiveau, filtreClasse, filtrePeriode]);

  const pagines = useMemo(() => {
    return bulletinsFiltrés.slice((page - 1) * parPage, page * parPage);
  }, [bulletinsFiltrés, page]);

  const total = bulletinsFiltrés.length;
  const pages = Math.ceil(total / parPage);

  const moyenneEcole = bulletins.length
    ? (bulletins.reduce((s, b) => s + parseFloat(b.moyenne || 0), 0) / bulletins.length).toFixed(2)
    : "0.00";
  const sansNotes = bulletins.filter(b => !b.moyenne || b.moyenne === 0).length;

  const getInitiales = (nom) => {
    const parts = nom?.split(" ") ?? [];
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMoyenneColor = (moy) => {
    const m = parseFloat(moy);
    if (m >= 14) return "#28a745";
    if (m >= 10) return "#1a3c8f";
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "22px" }}>Gestion des Bulletins</h2>
          <p style={{ color: "#666", margin: "4px 0 0" }}>Gérez, consultez et téléchargez les résultats académiques.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
        {[
          { label: "BULLETINS GÉNÉRÉS", value: bulletins.length, color: "#1a3c8f", icon: "📄" },
          { label: "EN ATTENTE", value: sansNotes, color: "#ff9800", icon: "⏳" },
          { label: "MOYENNE ÉCOLE", value: `${moyenneEcole}/20`, color: "#28a745", icon: "📈" },
          { label: "SANS NOTES", value: sansNotes, color: "#dc3545", icon: "⚠️" },
        ].map((stat, i) => (
          <div key={i} style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", backgroundColor: "#fff" }}>
            <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>{stat.icon} {stat.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px", marginBottom: "20px", backgroundColor: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#666" }}>NIVEAU</label>
            <select value={filtreNiveau} onChange={e => { setFiltreNiveau(e.target.value); setFiltreClasse("toutes"); setPage(1); }} style={{ width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <option value="tous">Tous les niveaux</option>
              {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#666" }}>CLASSE</label>
            <select value={filtreClasse} onChange={e => { setFiltreClasse(e.target.value); setPage(1); }} style={{ width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <option value="toutes">Toutes les classes</option>
              {classesFiltrées.map(c => <option key={c.id} value={c.nom_classe}>{c.nom_classe}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "#666" }}>PÉRIODE</label>
            <select value={filtrePeriode} onChange={e => { setFiltrePeriode(e.target.value); setPage(1); }} style={{ width: "100%", padding: "6px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <option value="toutes">Toutes les périodes</option>
              {periodes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={() => { setFiltreNiveau("tous"); setFiltreClasse("toutes"); setFiltrePeriode("toutes"); setPage(1); }} style={{ marginTop: "16px", backgroundColor: "#3964d1", color: "white", border: "none", padding: "6px", borderRadius: "4px" }}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ border: "1px solid #e0e0e0", borderRadius: "8px", backgroundColor: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ backgroundColor: "#f5f5f5" }}><th>ÉLÈVE</th><th>CLASSE</th><th>MOYENNE</th><th>PÉRIODE</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {pagines.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px" }}>{item.eleve?.nom || item.nom}</td>
                <td style={{ padding: "12px" }}>{item.classe?.nom_classe || item.classe || "-"}</td>
                <td style={{ padding: "12px", color: getMoyenneColor(item.moyenne), fontWeight: "bold" }}>{item.moyenne || "-"}</td>
                <td style={{ padding: "12px" }}>{item.periode || "-"}</td>
                <td style={{ padding: "12px" }}>
                  <button onClick={() => navigate(`/admin/bulletins/${item.eleve?.id || item.id}`)} title="Voir">👁</button>
                  <button onClick={() => telechargerBulletin(item.eleve?.id || item.id, item.eleve?.nom || item.nom)} title="Télécharger">⬇</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}