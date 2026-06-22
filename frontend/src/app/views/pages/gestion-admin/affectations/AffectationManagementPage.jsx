import { useEffect, useState } from "react";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { SelectField } from "../../../../shared/components/forms/SelectField";
import { PrimaryButton } from "../../../../shared/components/ui/PrimaryButton";
import { listClasses } from "../../../../services/classes/ClasseServices";
import { listMatieres } from "../../../../services/matieres/matiereService";
import { listUsers } from "../../../../services/user/userService";
import { affecterMatiereClasse, affecterEnseignantMatiere, listAffectations } from "../../../../services/affectations/affectionServices";

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

  const [formData, setFormData] = useState({
    classe_id: "",
    matiere_id: "",
    enseignant_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, matieresRes, enseignantsRes, affectationsRes] = await Promise.all([
        listClasses(),
        listMatieres(),
        listUsers({ role: "ENSEIGNANT", perPage: 100 }),
        listAffectations(),
      ]);
      setClasses(classesRes);
      setMatieres(matieresRes);
      setEnseignants(enseignantsRes.data || []);
      setAffectations(affectationsRes);
      console.log("Affectations :", affectationsRes);
    } catch (err) {
  console.error(err);
  setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      fetchData(); // Rafraîchir la liste après affectation
    } catch (err) {
      setError(err.message || "Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  const openForm = (newType) => {
    setType(newType);
    setFormData({ classe_id: "", matiere_id: "", enseignant_id: "" });
    setError(null);
    setSuccess(null);
    setIsOpen(true);
  };

  return (
    <section className="page-section">
      <header className="page-header">
        <h2>Gestion des affectations</h2>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {/* Table 1: Enseignant à Matière */}
        <div className="panel">
          <div className="panel-header" style={{ marginBottom: "15px" }}>
            <h3 className="panel-title" style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--text-strong)" }}>
              Affectations Enseignant à Matière
            </h3>
          </div>
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Matière</th>
                </tr>
              </thead>
              <tbody>
                {affectations.filter((aff) => aff.type === "Enseignant à Matière").length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                      Aucune affectation enseignant-matière
                    </td>
                  </tr>
                ) : (
                  affectations
                    .filter((aff) => aff.type === "Enseignant à Matière")
                    .map((aff) => (
                      <tr key={aff.id}>
                        <td>{aff.target_name}</td>
                        <td>{aff.matiere_nom}</td>
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
            <table className="users-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Matière</th>
                </tr>
              </thead>
              <tbody>
                {affectations.filter((aff) => aff.type === "Matière à Classe").length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                      Aucune affectation matière-classe
                    </td>
                  </tr>
                ) : (
                  affectations
                    .filter((aff) => aff.type === "Matière à Classe")
                    .map((aff) => (
                      <tr key={aff.id}>
                        <td>{aff.target_name}</td>
                        <td>{aff.matiere_nom}</td>
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
  title={
    type === "matiere-classe"
      ? "Affecter une matière à une classe"
      : "Affecter un enseignant à une matière"
  }
  width={750}
  headerAction={
    <button
      type="button"
      className="ghost-button"
      onClick={() => setIsOpen(false)}
    >
      Fermer
    </button>
  }
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