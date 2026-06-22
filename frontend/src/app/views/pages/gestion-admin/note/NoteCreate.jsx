import { apiClient } from "../../core/api/apiClient";
    
    /**
     * LISTE DES NOTES
     */
    export const getNotes = (params = {}) => {
        return apiClient("/notes", {
            method: "GET",
            params,
        });
    };
    
    /**
     * UNE NOTE
     */
    export const getNoteById = (id) => {
        return apiClient(`/notes/${id}`, {
            method: "GET",
        });
    };
    
    /**
     * AJOUTER
     */
    export const createNote = (data) => {
        return apiClient("/notes", {
            method: "POST",
            data,
        });
    };
    
    /**
     * MODIFIER
     */
    export const updateNote = (id, data) => {
        return apiClient(`/notes/${id}`, {
            method: "PUT",
            data,
        });
    };
    
    /**
     * SUPPRIMER
     */
    export const deleteNote = (id) => {
        return apiClient(`/notes/${id}`, {
            method: "DELETE",
        });
    };
    
    /**
     * RÉSULTATS CLASSE
     */
    export const getResultatsClasse = (idClasse) => {
        return apiClient(`/notes/resultats/classe/${idClasse}`, {
            method: "GET",
        });
    };

    /**
     * RÉSULTATS ÉLÈVE
     */
    export const getResultatsEleve = (idEleve) => {
        return apiClient(`/notes/resultats/eleve/${idEleve}`, {
            method: "GET",
        });
    };
import React, { useEffect, useState } from "react";
import { createNote } from "../../../../services/notes/noteService";
import { apiClient } from "../../../../core/api/apiClient";
import { useNavigate } from "react-router-dom";

export default function NoteCreate() {
  const navigate = useNavigate();

  const [eleves, setEleves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_eleve: "",
    id_matiere: "",
    id_classe: "",
    valeur: "",
    type_evaluation: "Devoir 1",
    periode: "Trimestre 1",
  });

  /**
   * ==========================================
   * CHARGEMENT DES DONNÉES
   * ==========================================
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const elevesRes = await apiClient("/users?role=ELEVE");
        const matieresRes = await apiClient("/matieres");
        const classesRes = await apiClient("/classes");

        console.log("ELEVES =>", elevesRes);
        console.log("MATIERES =>", matieresRes);
        console.log("CLASSES =>", classesRes);

        setEleves(elevesRes.data || elevesRes);
        setMatieres(matieresRes.data || matieresRes);
        setClasses(classesRes.data || classesRes);
      } catch (error) {
        console.log("ERREUR CHARGEMENT =>", error);
      }
    };

    fetchData();
  }, []);

  /**
   * ==========================================
   * SUBMIT FORM
   * ==========================================
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("FORM DATA =>", form);

    try {
      await createNote(form);
      navigate("/notes");
    } catch (error) {
      console.log("ERREUR CREATE NOTE =>", error);
      alert("Erreur lors de l'ajout de la note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl">

      <h2 className="text-xl font-bold mb-4">
        Ajouter une note
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* CLASSE */}
        <select
          value={form.id_classe}
          onChange={(e) =>
            setForm({ ...form, id_classe: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Sélectionner une classe</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom_classe}
            </option>
          ))}
        </select>

        {/* MATIÈRE */}
        <select
          value={form.id_matiere}
          onChange={(e) =>
            setForm({ ...form, id_matiere: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Sélectionner une matière</option>
          {matieres.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nom_matiere}
            </option>
          ))}
        </select>

        {/* ÉLÈVE */}
        <select
          value={form.id_eleve}
          onChange={(e) =>
            setForm({ ...form, id_eleve: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Sélectionner un élève</option>
          {eleves.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom} {e.prenom}
            </option>
          ))}
        </select>

        {/* TYPE ÉVALUATION */}
        <select
          value={form.type_evaluation}
          onChange={(e) =>
            setForm({ ...form, type_evaluation: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="Devoir 1">Devoir 1</option>
          <option value="Devoir 2">Devoir 2</option>
          <option value="Interrogation">Interrogation</option>
          <option value="Examen">Examen</option>
          </select>

        {/* NOTE */}
        <input
          type="number"
          step="0.01"
          min="0"
          max="20"
          placeholder="Note /20"
          value={form.valeur}
          onChange={(e) =>
            setForm({ ...form, valeur: e.target.value })
          }
          className="w-full border p-2 rounded"
        />

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>

      </form>
    </div>
  );
}