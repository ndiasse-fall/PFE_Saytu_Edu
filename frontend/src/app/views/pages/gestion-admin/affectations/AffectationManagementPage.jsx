import { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { SelectField } from "../../../../shared/components/forms/SelectField";
import { PrimaryButton } from "../../../../shared/components/ui/PrimaryButton";
import { listClasses } from "../../../../services/classes/ClasseServices";
import { listMatieres } from "../../../../services/matieres/matiereService";
import { listUsers } from "../../../../services/user/userService";
import {
  affecterMatiereClasse,
  affecterMatiereClasses,
  affecterEnseignantMatiere,
  listAffectations,
  deleteAffectation,
} from "../../../../services/affectations/affectionServices";
import { ActionMenu } from "../../../../shared/components/ui/ActionMenu";

export function AffectationManagementPage() {
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("matiere-classe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [typeFiltre, setTypeFiltre] = useState("");
  const [classeFiltre, setClasseFiltre] = useState("");
  const [enseignantFiltre, setEnseignantFiltre] = useState("");
  const [matiereFiltre, setMatiereFiltre] = useState("");
  const [niveauFiltre, setNiveauFiltre] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    classe_id: "",
    classe_ids: [],
    matiere_id: "",
    enseignant_id: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, matieresRes, enseignantsRes, affectationsRes] = await Promise.all([
        listClasses(),
        listMatieres(),
        listUsers({ role: "ENSEIGNANT", perPage: 100 }),
        listAffectations(),
      ]);

      setClasses(Array.isArray(classesRes) ? classesRes : classesRes?.data || []);
      setMatieres(Array.isArray(matieresRes) ? matieresRes : matieresRes?.data || []);
      setEnseignants(Array.isArray(enseignantsRes) ? enseignantsRes : enseignantsRes?.data || []);
      setAffectations(Array.isArray(affectationsRes) ? affectationsRes : affectationsRes?.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleClasseSelection = (classeId) => {
    setFormData((current) => {
      const selected = current.classe_ids || [];
      const nextSelection = selected.includes(classeId)
        ? selected.filter((id) => id !== classeId)
        : [...selected, classeId];

      return {
        ...current,
        classe_ids: nextSelection,
        classe_id: nextSelection.length === 1 ? nextSelection[0] : "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (type === "matiere-classe") {
        const selectedClasseIds = formData.classe_ids?.length
          ? formData.classe_ids
          : formData.classe_id
            ? [formData.classe_id]
            : [];

        if (selectedClasseIds.length === 0) {
          throw new Error("Veuillez sélectionner au moins une classe.");
        }

        if (selectedClasseIds.length === 1) {
          await affecterMatiereClasse(selectedClasseIds[0], formData.matiere_id);
        } else {
          await affecterMatiereClasses(selectedClasseIds, formData.matiere_id);
        }
      } else {
        await affecterEnseignantMatiere(formData.enseignant_id, formData.matiere_id);
      }

      setSuccess("Affectation réussie !");
      setIsOpen(false);
      await fetchData();
    } catch (err) {
      setError(err.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (affectation) => {
    const segments = affectation.id.toString().split("-");
    const typePrefix = segments[0];
    const targetId = Number(segments[1]);
    const matiereId = Number(segments[2]);

    if (typePrefix === "cm") {
      setType("matiere-classe");
      setFormData({
        classe_id: targetId,
        classe_ids: [targetId],
        matiere_id: matiereId,
        enseignant_id: "",
      });
    } else {
      setType("enseignant-matiere");
      setFormData({
        classe_id: "",
        classe_ids: [],
        matiere_id: matiereId,
        enseignant_id: targetId,
      });
    }

    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous supprimer cette affectation ?")) {
      return;
    }

    try {
      await deleteAffectation(id);
      await fetchData();
      setSuccess("Affectation supprimée avec succès.");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const openForm = (newType) => {
    setType(newType);
    setFormData({ classe_id: "", classe_ids: [], matiere_id: "", enseignant_id: "" });
    setError(null);
    setSuccess(null);
    setIsOpen(true);
  };

  const affectationsFiltrees = affectations.filter((aff) => {
    const matchType = !typeFiltre || aff.type === typeFiltre;
    const matchClasse = !classeFiltre || String(aff.classe_id) === classeFiltre;
    const matchEnseignant = !enseignantFiltre || String(aff.enseignant_id) === enseignantFiltre;
    const matchMatiere = !matiereFiltre || String(aff.matiere_id) === matiereFiltre;

    return matchType && matchClasse && matchEnseignant && matchMatiere;
  });

  const paginatedAffectations = affectationsFiltrees.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage,
  );

  const niveauxDisponibles = [...new Set(classes.map((classe) => classe.niveau).filter(Boolean))];
  const classesFiltrees = niveauFiltre
    ? classes.filter((classe) => classe.niveau === niveauFiltre)
    : classes;

  const handleChangePageClasse = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPageClasse = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderAffectationTarget = (aff) => {
    const targetName = aff.target_name || "Non renseigné";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
        <strong style={{ fontSize: "0.95rem", lineHeight: 1.35, color: "var(--text-strong, #1f2937)", wordBreak: "break-word" }}>
          {targetName}
        </strong>
      </div>
    );
  };

  return (
    <section className="page-section">
      <header
        className="page-header legacy-page-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap" }}
      >
        <h2>Gestion des affectations</h2>
        <div className="header-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
          <PrimaryButton onClick={() => openForm("matiere-classe")}>Affecter Matière à Classe</PrimaryButton>
          <PrimaryButton onClick={() => openForm("enseignant-matiere")}>Affecter Enseignant à Matière</PrimaryButton>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="panel" style={{ marginTop: "20px" }}>
        <div className="panel-header" style={{ marginBottom: "15px", gap: "12px", flexWrap: "wrap" }}>
          <h3 className="panel-title" style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-strong)" }}>
            Liste des affectations
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", width: "100%" }}>
            <select value={typeFiltre} onChange={(e) => { setTypeFiltre(e.target.value); setPage(0); }} style={{ minWidth: "180px", padding: "10px", borderRadius: "10px", border: "1px solid #d1d5db" }}>
              <option value="">Tous les types</option>
              <option value="Matière à Classe">Matière à Classe</option>
              <option value="Enseignant à Matière">Enseignant à Matière</option>
            </select>
            <select value={classeFiltre} onChange={(e) => { setClasseFiltre(e.target.value); setPage(0); }} style={{ minWidth: "180px", padding: "10px", borderRadius: "10px", border: "1px solid #d1d5db" }}>
              <option value="">Toutes les classes</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom_classe} - {classe.niveau}
                </option>
              ))}
            </select>
            <select value={enseignantFiltre} onChange={(e) => { setEnseignantFiltre(e.target.value); setPage(0); }} style={{ minWidth: "220px", padding: "10px", borderRadius: "10px", border: "1px solid #d1d5db" }}>
              <option value="">Tous les enseignants</option>
              {enseignants.map((enseignant) => (
                <option key={enseignant.id} value={enseignant.id}>
                  {enseignant.prenom} {enseignant.nom}
                </option>
              ))}
            </select>
            <select value={matiereFiltre} onChange={(e) => { setMatiereFiltre(e.target.value); setPage(0); }} style={{ minWidth: "220px", padding: "10px", borderRadius: "10px", border: "1px solid #d1d5db" }}>
              <option value="">Toutes les matières</option>
              {matieres.map((matiere) => (
                <option key={matiere.id} value={matiere.id}>
                  {matiere.nom_matiere}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Attribution</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAffectations.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                    Aucune affectation trouvée avec ces filtres
                  </td>
                </tr>
              ) : (
                paginatedAffectations.map((aff) => (
                  <tr key={aff.id}>
                    <td>{renderAffectationTarget(aff)}</td>
                    <td>
                      <span className="badge badge-role">{aff.type}</span>
                    </td>
                    <td>
                      <ActionMenu
                        items={[
                          { label: "Modifier", onClick: () => handleEdit(aff) },
                          { label: "Supprimer", onClick: () => handleDelete(aff.id), danger: true },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <TablePagination
            component="div"
            count={affectationsFiltrees.length}
            page={page}
            onPageChange={handleChangePageClasse}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </div>
      </div>

      <DrawerPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={type === "matiere-classe" ? "Affecter une matière à une classe" : "Affecter un enseignant à une matière"}
        width={750}
        headerAction={
          <button type="button" className="ghost-button" onClick={() => setIsOpen(false)}>
            Fermer
          </button>
        }
      >
        <form onSubmit={handleSubmit} className="auth-form">
          {type === "matiere-classe" ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", textAlign: "left" }}>
                  Filtrer par niveau
                </label>
                <select
                  value={niveauFiltre}
                  onChange={(e) => setNiveauFiltre(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                >
                  <option value="">Tous les niveaux</option>
                  {niveauxDisponibles.map((niveau) => (
                    <option key={niveau} value={niveau}>
                      {niveau}
                    </option>
                  ))}
                </select>
              </div>

              <SelectField
                label="Matière"
                name="matiere_id"
                value={formData.matiere_id}
                onChange={handleChange}
                options={matieres.map((m) => ({ value: m.id, label: m.nom_matiere }))}
                placeholder="Sélectionner une matière"
                required
              />

              <div style={{ marginBottom: "16px", textAlign: "left" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>Classes attribuées</label>
                <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#6b7280" }}>
                  Choisis une ou plusieurs classes. Le professeur pourra gérer les notes uniquement pour celles-ci.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "260px", overflowY: "auto" }}>
                  {classesFiltrees.map((classe) => {
                    const checked = (formData.classe_ids || []).includes(classe.id);

                    return (
                      <label
                        key={classe.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          cursor: "pointer",
                          padding: "10px 12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          background: checked ? "rgba(37, 99, 235, 0.04)" : "#fff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClasseSelection(classe.id)}
                          style={{ width: "18px", height: "18px", marginTop: "3px" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                            {classe.nom_classe}
                          </span>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {classe.niveau || "Niveau non défini"} {classe.annee_scolaire ? `• ${classe.annee_scolaire}` : ""}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <SelectField
                label="Enseignant"
                name="enseignant_id"
                value={formData.enseignant_id}
                onChange={handleChange}
                options={enseignants.map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))}
                placeholder="Sélectionner un enseignant"
                required
              />

              <SelectField
                label="Matière"
                name="matiere_id"
                value={formData.matiere_id}
                onChange={handleChange}
                options={matieres.map((m) => ({ value: m.id, label: m.nom_matiere }))}
                placeholder="Sélectionner une matière"
                required
              />
            </>
          )}

          <div className="mt-6">
            <PrimaryButton type="submit" disabled={loading} block>
              {loading ? "Traitement..." : "Enregistrer l'affectation"}
            </PrimaryButton>
          </div>
        </form>
      </DrawerPanel>
    </section>
  );
}
