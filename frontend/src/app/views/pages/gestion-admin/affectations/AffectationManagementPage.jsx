import { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { SelectField } from "../../../../shared/components/forms/SelectField";
import { PrimaryButton } from "../../../../shared/components/ui/PrimaryButton";
import { listClasses } from "../../../../services/classes/ClasseServices";
import { listMatieres } from "../../../../services/matieres/matiereService";
import { listUsers } from "../../../../services/user/userService";
import { affecterMatiereClasse, affecterEnseignantMatiere, listAffectations ,
  deleteAffectation,} from "../../../../services/affectations/affectionServices";
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
  const [pageClasse, setPageClasse] = useState(0);
  const [rowsPerPageClasse, setRowsPerPageClasse] = useState(10);
  const [pageEnseignant, setPageEnseignant] = useState(0);
  const [rowsPerPageEnseignant, setRowsPerPageEnseignant] = useState(10);

  useEffect(() => {
    setPageClasse(0);
  }, [searchClasse]);

  useEffect(() => {
    setPageEnseignant(0);
  }, [searchEnseignant]);

  const [formData, setFormData] = useState({
    classe_id: "",
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
      setClasses(Array.isArray(classesRes) ? classesRes : (classesRes?.data || []));
      setMatieres(Array.isArray(matieresRes) ? matieresRes : (matieresRes?.data || []));
      setEnseignants(Array.isArray(enseignantsRes) ? enseignantsRes : (enseignantsRes?.data || []));
      setAffectations(Array.isArray(affectationsRes) ? affectationsRes : (affectationsRes?.data || []));
      console.log("Affectations :", affectationsRes);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(formData); 
    setError(null);
    setSuccess(null);
    try {
      if (type === "matiere-classe") {
        await affecterMatiereClasse(formData.classe_id, formData.matiere_id);
      } else {
        await affecterEnseignantMatiere(formData.enseignant_id, formData.matiere_id);
      }
      setSuccess("Affectation réussie !");
      setIsOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (affectation) => {
    console.log(affectation);

    const segments = affectation.id.toString().split("-");
    const typePrefix = segments[0]; // "cm" ou "em"
    const targetId = Number(segments[1]); // ID classe ou enseignant
    const matiereId = Number(segments[2]); // ID matière

    if (typePrefix === "cm") {
      setType("matiere-classe");
      setFormData({
        classe_id: targetId,
        matiere_id: matiereId,
        enseignant_id: "",
      });
    } else {
      setType("enseignant-matiere");
      setFormData({
        classe_id: "",
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
      // On transmet l'ID composite complet (ex: "em-11-4") que le backend sait analyser
      await deleteAffectation(id);

      fetchData();
      setSuccess("Affectation supprimée avec succès.");
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const openForm = (newType) => {
    setType(newType);
    setFormData({ classe_id: "", matiere_id: "", enseignant_id: "" });
    setError(null);
    setSuccess(null);
    setIsOpen(true);
  };

  const affectationsClasseFiltrees = affectations
    .filter((aff) => aff.type === "Matière à Classe")
    .filter((aff) =>
      aff.target_name.toLowerCase().includes(searchClasse.toLowerCase()) ||
      aff.matiere_nom.toLowerCase().includes(searchClasse.toLowerCase())
    );

  const affectationsEnseignantFiltrees = affectations
    .filter((aff) => aff.type === "Enseignant à Matière")
    .filter((aff) =>
      aff.target_name.toLowerCase().includes(searchEnseignant.toLowerCase()) ||
      aff.matiere_nom.toLowerCase().includes(searchEnseignant.toLowerCase())
    );

  const paginatedAffectationsEnseignant = affectationsEnseignantFiltrees.slice(
    pageEnseignant * rowsPerPageEnseignant,
    (pageEnseignant + 1) * rowsPerPageEnseignant
  );

  const paginatedAffectationsClasse = affectationsClasseFiltrees.slice(
    pageClasse * rowsPerPageClasse,
    (pageClasse + 1) * rowsPerPageClasse
  );

  return (
    <section className="page-section">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestion des affectations</h2>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <PrimaryButton onClick={() => openForm("matiere-classe")}>
            Affecter Matière à Classe
          </PrimaryButton>
          <PrimaryButton onClick={() => openForm("enseignant-matiere")}>
            Affecter Enseignant à Matière
          </PrimaryButton>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="responsive-panel-grid">
        
        {/* Table 1: Enseignant à Matière */}
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
                {affectationsEnseignantFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                      Aucune affectation enseignant-matière
                    </td>
                  </tr>
                ) : (
                  affectationsEnseignantFiltrees.map((aff) => (
                    <tr key={aff.id}>
                      <td>{aff.target_name}</td>
                      <td>{aff.matiere_nom}</td>
                      <td>
                        <ActionMenu
                          items={[
                            // FIX: Changement de openEditForm à handleEdit
                            { label: 'Modifier', onClick: () => handleEdit(aff) },
                            { label: 'Supprimer', onClick: () => handleDelete(aff.id), danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Matière à Classe */}
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
                {affectationsClasseFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                      Aucune affectation matière-classe
                    </td>
                  </tr>
                ) : (
                  affectationsClasseFiltrees.map((aff) => (
                    <tr key={aff.id}>
                      <td>{aff.target_name}</td>
                      <td>{aff.matiere_nom}</td>
                      <td>
                        <ActionMenu
                          items={[
                            // FIX: Changement de openEditForm à handleEdit
                            { label: 'Modifier', onClick: () => handleEdit(aff) },
                            { label: 'Supprimer', onClick: () => handleDelete(aff.id), danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DrawerPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={type === "matiere-classe" ? "Affecter une matière à une classe" : "Affecter un enseignant à une matière"}
        width={750}
        headerAction={<button type="button" className="ghost-button" onClick={() => setIsOpen(false)}>Fermer</button>}
      >
        <form onSubmit={handleSubmit} className="auth-form">
          {type === "matiere-classe" ? (
            <SelectField
              label="Classe"
              name="classe_id"
              value={formData.classe_id}
              onChange={handleChange}
              options={classes.map(c => ({ value: c.id, label: c.nom_classe }))}
              placeholder="Sélectionner une classe"
              required
            />
          ) : (
            <SelectField
              label="Enseignant"
              name="enseignant_id"
              value={formData.enseignant_id}
              onChange={handleChange}
              options={enseignants.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))}
              placeholder="Sélectionner un enseignant"
              required
            />
          )}

          <SelectField
            label="Matière"
            name="matiere_id"
            value={formData.matiere_id}
            onChange={handleChange}
            options={matieres.map(m => ({ value: m.id, label: m.nom_matiere }))}
            placeholder="Sélectionner une matière"
            required
          />

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
