import { useEffect, useState } from "react";
import TablePagination from "@mui/material/TablePagination";
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
  const [search, setSearch] = useState("");
  const [matiereFilter, setMatiereFilter] = useState("Toutes");
  const [sortBy, setSortBy] = useState("nom");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  
  useEffect(() => {
    setPage(0);
  }, [search, matiereFilter, sortBy]);

  const [formData, setFormData] = useState({
    nom_matiere: "",
    coefficient: 1,
    description: "",
    departement: "",
  });

  const fetchMatieres = async () => {
    setLoading(true);
    try {
      const response = await listMatieres();
      setMatieres(response);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des matières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMatieres();
  }, []);

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
      departement: "",
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
      departement: matiere.departement || "",
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
        console.error(err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  const matiereFilters = [
    "Toutes",
    ...new Set(matieres.map((m) => m.nom_matiere)),
  ];

  const filteredMatieres = matieres
    .filter((matiere) => {
      const recherche =
        matiere.nom_matiere
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (matiere.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const filtreMatiere =
        matiereFilter === "Toutes" ||
        matiere.nom_matiere === matiereFilter;

      return recherche && filtreMatiere;
    })
    .sort((a, b) => {
      if (sortBy === "nom")
        return a.nom_matiere.localeCompare(b.nom_matiere);

      if (sortBy === "coefficient")
        return b.coefficient - a.coefficient;

      return 0;
    });

  const paginatedMatieres = filteredMatieres.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <section className="page-section">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestion des matières</h2>
        <div className="header-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PrimaryButton onClick={openAddForm}>
            Ajouter une matière
          </PrimaryButton>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div
        className="panel"
        style={{
          marginTop: 20,
          marginBottom: 20,
          padding: 25,
          borderRadius: 18,
        }}
      >
        <input
          type="text"
          placeholder="🔍 Rechercher par nom ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 15,
            borderRadius: 14,
            border: "1px solid #ddd",
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {matiereFilters.map((nom) => (
              <button
                key={nom}
                onClick={() => setMatiereFilter(nom)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 30,
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  background: matiereFilter === nom ? "#1d4ed8" : "#fff",
                  color: matiereFilter === nom ? "#fff" : "#333",
                  fontWeight: 600,
                }}
              >
                {nom}
              </button>
            ))}
          </div>

          <div>
            <label style={{ marginRight: 10 }}>
              Trier :
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 10,
              }}
            >
              <option value="nom">Nom (A-Z)</option>
              <option value="coefficient">Coefficient</option>
            </select>
          </div>
        </div>
      </div>

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
                {/* 🚀 CORRECTION ICI : Utilisation de paginatedMatieres à la place de filteredMatieres */}
                {paginatedMatieres.map((matiere) => (
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
            
            {/* Ajout du composant de pagination visuel en bas du tableau */}
            <TablePagination
              component="div"
              count={filteredMatieres.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 15, 25]}
              labelRowsPerPage="Lignes par page:"
            />
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