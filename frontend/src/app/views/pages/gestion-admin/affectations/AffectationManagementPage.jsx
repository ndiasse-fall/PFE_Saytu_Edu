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
  const [searchClasse, setSearchClasse] = useState("");
  const [searchEnseignant, setSearchEnseignant] = useState("");
  const [niveauFiltre, setNiveauFiltre] = useState("");
  const [pageClasse, setPageClasse] = useState(0);
  const [rowsPerPageClasse, setRowsPerPageClasse] = useState(10);
  const [pageEnseignant, setPageEnseignant] = useState(0);
  const [rowsPerPageEnseignant, setRowsPerPageEnseignant] = useState(10);
  const [formData, setFormData] = useState({
    classe_id: "",
    classe_ids: [],
    matiere_id: "",
    enseignant_id: "",
  });

  useEffect(() => {
    setPageClasse(0);
  }, [searchClasse]);

  useEffect(() => {
    setPageEnseignant(0);
  }, [searchEnseignant]);

  useEffect(() => {
    setPageClasse(0);
  }, [niveauFiltre]);

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

  const affectationsClasseFiltrees = affectations
    .filter((aff) => aff.type === "Matière à Classe")
    .filter(
      (aff) =>
        aff.target_name.toLowerCase().includes(searchClasse.toLowerCase()) ||
        aff.matiere_nom.toLowerCase().includes(searchClasse.toLowerCase()),
    );

  const affectationsEnseignantFiltrees = affectations
    .filter((aff) => aff.type === "Enseignant à Matière")
    .filter(
      (aff) =>
        aff.target_name.toLowerCase().includes(searchEnseignant.toLowerCase()) ||
        aff.matiere_nom.toLowerCase().includes(searchEnseignant.toLowerCase()),
    );

  const paginatedAffectationsEnseignant = affectationsEnseignantFiltrees.slice(
    pageEnseignant * rowsPerPageEnseignant,
    (pageEnseignant + 1) * rowsPerPageEnseignant,
  );

  const paginatedAffectationsClasse = affectationsClasseFiltrees.slice(
    pageClasse * rowsPerPageClasse,
    (pageClasse + 1) * rowsPerPageClasse,
  );

  const niveauxDisponibles = [...new Set(classes.map((classe) => classe.niveau).filter(Boolean))];
  const classesFiltrees = niveauFiltre
    ? classes.filter((classe) => classe.niveau === niveauFiltre)
    : classes;

  const handleChangePageClasse = (_event, newPage) => {
    setPageClasse(newPage);
  };

  const handleChangeRowsPerPageClasse = (event) => {
    setRowsPerPageClasse(parseInt(event.target.value, 10));
    setPageClasse(0);
  };

  const handleChangePageEnseignant = (_event, newPage) => {
    setPageEnseignant(newPage);
  };

  const handleChangeRowsPerPageEnseignant = (event) => {
    setRowsPerPageEnseignant(parseInt(event.target.value, 10));
    setPageEnseignant(0);
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

      <div
        className="legacy-split-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: "20px", marginTop: "20px" }}
      >
        <div className="panel">
          <div className="panel-header" style={{ marginBottom: "15px" }}>
            <h3 className="panel-title" style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-strong)" }}>
              Affectations Enseignant à Matière
            </h3>
          </div>
          <div className="table-wrapper">
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="🔍 Rechercher un enseignant ou une matière..."
                value={searchEnseignant}
                onChange={(e) => setSearchEnseignant(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "10px", fontSize: "15px" }}
              />
            </div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Matière</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAffectationsEnseignant.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                      Aucune affectation enseignant-matière
                    </td>
                  </tr>
                ) : (
                  paginatedAffectationsEnseignant.map((aff) => (
                    <tr key={aff.id}>
                      <td>{aff.target_name}</td>
                      <td>{aff.matiere_nom}</td>
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
              count={affectationsEnseignantFiltrees.length}
              page={pageEnseignant}
              onPageChange={handleChangePageEnseignant}
              rowsPerPage={rowsPerPageEnseignant}
              onRowsPerPageChange={handleChangeRowsPerPageEnseignant}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header" style={{ marginBottom: "15px" }}>
            <h3 className="panel-title" style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-strong)" }}>
              Affectations Matière à Classe
            </h3>
          </div>
          <div className="table-wrapper">
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="🔍 Rechercher une classe ou une matière..."
                value={searchClasse}
                onChange={(e) => setSearchClasse(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "10px", fontSize: "15px" }}
              />
            </div>

            <table className="users-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Matière</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAffectationsClasse.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                      Aucune affectation matière-classe
                    </td>
                  </tr>
                ) : (
                  paginatedAffectationsClasse.map((aff) => (
                    <tr key={aff.id}>
                      <td>{aff.target_name}</td>
                      <td>{aff.matiere_nom}</td>
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
              count={affectationsClasseFiltrees.length}
              page={pageClasse}
              onPageChange={handleChangePageClasse}
              rowsPerPage={rowsPerPageClasse}
              onRowsPerPageChange={handleChangeRowsPerPageClasse}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </div>
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
                <label style={{ display: "block", fontWeight: 600, marginBottom: "8px" }}>Classes</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "260px", overflowY: "auto" }}>
                  {classesFiltrees.map((classe) => {
                    const checked = (formData.classe_ids || []).includes(classe.id);

                    return (
                      <label
                        key={classe.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          cursor: "pointer",
                          padding: "8px 0",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClasseSelection(classe.id)}
                          style={{ width: "18px", height: "18px" }}
                        />
                        <span style={{ fontSize: "14px", color: "#333" }}>
                          {classe.nom_classe} ({classe.niveau || "Niveau non défini"})
                        </span>
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
