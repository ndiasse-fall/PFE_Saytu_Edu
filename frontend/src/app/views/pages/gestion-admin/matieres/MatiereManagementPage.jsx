import { useEffect, useState } from "react";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { TextField } from "../../../../shared/components/forms/TextField";
import { PrimaryButton } from "../../../../shared/components/ui/PrimaryButton";
import { listMatieres, createMatiere, updateMatiere, deleteMatiere } from "../../../../services/matieres/matiereService";
import { ActionMenu } from "../../../../shared/components/ui/ActionMenu";

export function MatiereManagementPage() {
  const [matieres, setMatieres] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMatiere, setSelectedMatiere] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    nom_matiere: "",
    coefficient: 1,
    description: "",
  });

  useEffect(() => {
    fetchMatieres();
  }, []);

  const fetchMatieres = async () => {
    setLoading(true);
    try {
      const response = await listMatieres();
      setMatieres(response);
    } catch (err) {
      setError("Erreur lors du chargement des matières");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "coefficient" ? parseInt(value) || 1 : value,
    });
  };

  const openAddForm = () => {
    setSelectedMatiere(null);
    setFormData({
      nom_matiere: "",
      coefficient: 1,
      description: "",
    });
    setSuccess(null);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (matiere) => {
    setSelectedMatiere(matiere);
    setFormData({
      nom_matiere: matiere.nom_matiere,
      coefficient: matiere.coefficient,
      description: matiere.description || "",
    });
    setSuccess(null);
    setError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (selectedMatiere) {
        await updateMatiere(selectedMatiere.id, formData);
        setSuccess("Matière modifiée avec succès");
      } else {
        await createMatiere(formData);
        setSuccess("Matière créée avec succès");
      }
      setIsFormOpen(false);
      fetchMatieres();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette matière ?")) {
      try {
        await deleteMatiere(id);
        setSuccess("Matière supprimée avec succès");
        fetchMatieres();
      } catch (err) {
        setError("Erreur lors de la suppression");
      }
    }
  };

  return (
    <section className="page-section">
      <header className="page-header">
        <h2>Gestion des matières</h2>
        <PrimaryButton onClick={openAddForm}>
          Ajouter une matière
        </PrimaryButton>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="panel mt-4">
        {loading && matieres.length === 0 ? (
          <div className="screen-state">Chargement...</div>
        ) : matieres.length === 0 ? (
          <div className="screen-state">Aucune matière trouvée.</div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nom de la matière</th>
                  <th>Coefficient</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matieres.map((matiere) => (
                  <tr key={matiere.id}>
                    <td><strong>{matiere.nom_matiere}</strong></td>
                    <td>{matiere.coefficient}</td>
                    <td>{matiere.description}</td>
                    <td>
                      <ActionMenu
                        items={[
                          { label: 'Modifier', onClick: () => openEditForm(matiere) },
                          { label: 'Supprimer', onClick: () => handleDelete(matiere.id), danger: true },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DrawerPanel
  open={isFormOpen}
  onClose={() => setIsFormOpen(false)}
  title={selectedMatiere ? "Modifier la matière" : "Ajouter une matière"}
  width={520}
  headerAction={
    <button
      type="button"
      className="ghost-button"
      onClick={() => setIsFormOpen(false)}
    >
      Fermer
    </button>
  }
>
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="Nom de la matière"
            name="nom_matiere"
            value={formData.nom_matiere}
            onChange={handleChange}
            placeholder="Ex: Mathématiques"
            required
          />

          <TextField
            label="Coefficient"
            name="coefficient"
            type="number"
            value={formData.coefficient}
            onChange={handleChange}
            min="1"
            required
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description optionnelle"
          />

          <div className="mt-6">
            <PrimaryButton type="submit" disabled={loading} block>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </PrimaryButton>
          </div>
        </form>
      </DrawerPanel>
    </section>
  );
}