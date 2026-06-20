// aucun changement structurel majeur
// seulement amélioration UI maquette

import React, { useEffect, useState } from "react";
import { createNote } from "../../../../services/notes/noteService";
import axios from "../../../../api/axios";
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

  useEffect(() => {
    axios.get("/users?role=ELEVE").then(res => setEleves(res.data.data || res.data));
    axios.get("/matieres").then(res => setMatieres(res.data.data || res.data));
    axios.get("/classes").then(res => setClasses(res.data.data || res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createNote(form);
      navigate("/notes");
    } catch (error) {
      alert("Erreur ajout note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl">

      <h2 className="text-xl font-bold mb-4">Ajouter une note</h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        <select name="id_classe" onChange={(e)=>setForm({...form,id_classe:e.target.value})}>
          <option>Classe</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe}</option>)}
        </select>

        <select name="id_matiere" onChange={(e)=>setForm({...form,id_matiere:e.target.value})}>
          <option>Matière</option>
          {matieres.map(m => <option key={m.id} value={m.id}>{m.nom_matiere}</option>)}
        </select>

        <select name="type_evaluation" onChange={(e)=>setForm({...form,type_evaluation:e.target.value})}>
          <option>Devoir 1</option>
          <option>Devoir 2</option>
          <option>Composition</option>
        </select>

        <input
          type="number"
          placeholder="Note /20"
          onChange={(e)=>setForm({...form,valeur:e.target.value})}
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Enregistrer
        </button>

      </form>

    </div>
  );
}