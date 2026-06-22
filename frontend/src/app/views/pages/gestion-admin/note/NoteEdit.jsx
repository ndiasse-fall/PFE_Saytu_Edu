import React, { useEffect, useState } from "react";
import { updateNote, getNoteById } from "../../../../services/notes/noteService";
import axios from "../../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function NoteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eleves, setEleves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id_eleve: "",
    id_matiere: "",
    id_classe: "",
    valeur: "",
    type_evaluation: "",
    periode: ""
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Charger les données nécessaires pour les sélecteurs
      const [resEleves, resMatieres, resClasses, resNote] = await Promise.all([
        axios.get("/users?role=ELEVE"),
        axios.get("/matieres"),
        axios.get("/classes"),
        getNoteById(id)
      ]);

      setEleves(resEleves.data.data || resEleves.data);
      setMatieres(resMatieres.data.data || resMatieres.data);
      setClasses(resClasses.data.data || resClasses.data);

      if (resNote.data.success || resNote.data) {
        const noteData = resNote.data.data || resNote.data;
        setForm({
          id_eleve: noteData.id_eleve,
          id_matiere: noteData.id_matiere,
          id_classe: noteData.id_classe,
          valeur: noteData.valeur,
          type_evaluation: noteData.type_evaluation,
          periode: noteData.periode
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
      alert("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateNote(id, form);
      alert("Note modifiée avec succès !");
      navigate("/notes");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification : " + (error.response?.data?.message || "Erreur inconnue"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Modifier la note</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* CLASSE */}
          <div>
            <label className="block text-sm font-medium mb-1">Classe</label>
            <select name="id_classe" onChange={handleChange} value={form.id_classe} className="w-full p-2 border rounded" required>
              <option value="">-- Sélectionner une classe --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nom_classe}</option>
              ))}
            </select>
          </div>

          {/* MATIERE */}
          <div>
            <label className="block text-sm font-medium mb-1">Matière</label>
            <select name="id_matiere" onChange={handleChange} value={form.id_matiere} className="w-full p-2 border rounded" required>
              <option value="">-- Sélectionner une matière --</option>
              {matieres.map(m => (
                <option key={m.id} value={m.id}>{m.nom_matiere}</option>
              ))}
            </select>
          </div>

          {/* ELEVE */}
          <div>
            <label className="block text-sm font-medium mb-1">Élève</label>
            <select name="id_eleve" onChange={handleChange} value={form.id_eleve} className="w-full p-2 border rounded" required>
              <option value="">-- Sélectionner un élève --</option>
              {eleves.map(e => (
                <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
              ))}
            </select>
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-sm font-medium mb-1">Type d'évaluation</label>
            <select name="type_evaluation" onChange={handleChange} value={form.type_evaluation} className="w-full p-2 border rounded" required>
              <option value="Devoir">Devoir</option>
              <option value="Examen">Examen</option>
              <option value="Interrogation">Interrogation</option>
            </select>
          </div>

          {/* PERIODE */}
          <div>
            <label className="block text-sm font-medium mb-1">Période</label>
            <select name="periode" onChange={handleChange} value={form.periode} className="w-full p-2 border rounded" required>
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
              <option value="Semestre 1">Semestre 1</option>
              <option value="Semestre 2">Semestre 2</option>
            </select>
          </div>

          {/* NOTE */}
          <div>
            <label className="block text-sm font-medium mb-1">Note (sur 20)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="20"
              name="valeur"
              value={form.valeur}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium disabled:bg-blue-300"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/notes")}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-medium"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}