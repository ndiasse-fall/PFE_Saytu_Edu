import { useEffect, useState } from "react";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { TextField } from "../../../../shared/components/forms/TextField";
import { PrimaryButton } from "../../../../shared/components/ui/PrimaryButton";
import { listClasses, createClasse, updateClasse, deleteClasse } from "../../../../services/classes/ClasseServices";
import { ActionMenu } from "../../../../shared/components/ui/ActionMenu";

export function ClasseManagementPage() {
  const [classes, setClasses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
const [search, setSearch] = useState("");
const [niveauFilter, setNiveauFilter] = useState("Tous");
const [sortBy, setSortBy] = useState("nom");
  const [formData, setFormData] = useState({
    nom_classe: "",
    niveau: "",
    annee_scolaire: "",
  });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await listClasses();
      setClasses(response);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openAddForm = () => {
    setSelectedClasse(null);
    setFormData({
      nom_classe: "",
      niveau: "",
      annee_scolaire: "2025-2026",
    });
    setSuccess(null);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (classe) => {
    setSelectedClasse(classe);
    setFormData({
      nom_classe: classe.nom_classe,
      niveau: classe.niveau,
      annee_scolaire: classe.annee_scolaire,
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
      if (selectedClasse) {
        await updateClasse(selectedClasse.id, formData);
        setSuccess("Classe modifiée avec succès");
      } else {
        await createClasse(formData);
        setSuccess("Classe créée avec succès");
      }
      setIsFormOpen(false);
      fetchClasses();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette classe ?")) {
      try {
        await deleteClasse(id);
        setSuccess("Classe supprimée avec succès");
        fetchClasses();
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la suppression");
      }
    }
  };
const niveaux = ["Tous", ...new Set(classes.map((c) => c.niveau))];

const filteredClasses = classes
  .filter((classe) => {
    const recherche =
      classe.nom_classe.toLowerCase().includes(search.toLowerCase()) ||
      classe.niveau.toLowerCase().includes(search.toLowerCase());

    const niveau =
      niveauFilter === "Tous" || classe.niveau === niveauFilter;

    return recherche && niveau;
  })
  .sort((a, b) => {
    if (sortBy === "nom") {
      return a.nom_classe.localeCompare(b.nom_classe);
    }

    if (sortBy === "niveau") {
      return a.niveau.localeCompare(b.niveau);
    }

    if (sortBy === "annee") {
      return b.annee_scolaire.localeCompare(a.annee_scolaire);
    }

    return 0;
  });
  return (
    <section className="page-section">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestion des classes</h2>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButton onClick={openAddForm}>
            Ajouter une classe
          </PrimaryButton>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
<div
  className="panel"
  style={{
    marginTop: "20px",
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "16px",
  }}
>
  {/* Recherche */}
  <input
    type="text"
    placeholder="🔍 Rechercher une classe..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #ddd",
      fontSize: "16px",
      marginBottom: "20px",
    }}
  />

  {/* Filtres */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "15px",
    }}
  >
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {niveaux.map((niveau) => (
        <button
          key={niveau}
          onClick={() => setNiveauFilter(niveau)}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            background:
              niveauFilter === niveau ? "#1d4ed8" : "#f3f4f6",
            color:
              niveauFilter === niveau ? "#fff" : "#333",
          }}
        >
          {niveau}
        </button>
      ))}
    </div>

    <div>
      <label style={{ marginRight: "10px" }}>
        Trier :
      </label>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ddd",
        }}
      >
        <option value="nom">Nom (A-Z)</option>
        <option value="niveau">Niveau</option>
        <option value="annee">Année scolaire</option>
      </select>
    </div>
  </div>
</div>
      <div className="panel mt-4">
        {loading && classes.length === 0 ? (
          <div className="screen-state">Chargement...</div>
        ) : classes.length === 0 ? (
          <div className="screen-state">Aucune classe trouvée.</div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nom de la classe</th>
                  <th>Niveau</th>
                  <th>Année Scolaire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((classe) => (
                  <tr key={classe.id}>
                    <td><strong>{classe.nom_classe}</strong></td>
                    <td>{classe.niveau}</td>
                    <td>{classe.annee_scolaire}</td>
                    <td>
                      <ActionMenu
                        items={[
                          { label: 'Modifier', onClick: () => openEditForm(classe) },
                          { label: 'Supprimer', onClick: () => handleDelete(classe.id), danger: true },
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
  title={selectedClasse ? "Modifier la classe" : "Ajouter une classe"}
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
            label="Nom de la classe"
            name="nom_classe"
            value={formData.nom_classe}
            onChange={handleChange}
            placeholder="Ex: 6ème A"
            required
          />

          <TextField
            label="Niveau"
            name="niveau"
            value={formData.niveau}
            onChange={handleChange}
            placeholder="Ex: Moyen"
            required
          />

          <TextField
            label="Année scolaire"
            name="annee_scolaire"
            value={formData.annee_scolaire}
            onChange={handleChange}
            placeholder="Ex: 2025-2026"
            required
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