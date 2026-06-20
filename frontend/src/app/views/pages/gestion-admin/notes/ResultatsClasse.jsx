import React, { useState, useEffect } from "react";
import { getResultatsClasse } from "../../../../services/notes/noteService";
import axios from "../../../../api/axios";

export default function ResultatsClasse() {
  const [classes, setClasses] = useState([]);
  const [classeId, setClasseId] = useState("");
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/classes").then(res => setClasses(res.data.data || res.data));
  }, []);

  const rechercher = async (id) => {
    const cid = id || classeId;
    if (!cid) return;
    
    setLoading(true);
    try {
      const res = await getResultatsClasse(cid);
      setResultats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClasseChange = (e) => {
    setClasseId(e.target.value);
    rechercher(e.target.value);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Résultats par classe</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label className="block mb-2 font-medium">Sélectionner une classe</label>
        <select 
          className="w-full md:w-1/3 p-2 border rounded"
          value={classeId}
          onChange={handleClasseChange}
        >
          <option value="">-- Choisir une classe --</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.nom_classe}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Chargement des résultats...</p>
      ) : resultats.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Élève</th>
                <th className="p-3">Moyenne Générale</th>
                <th className="p-3">Rang (Simulé)</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{r.eleve}</td>
                  <td className="p-3 text-blue-600 font-bold">{r.moyenne} / 20</td>
                  <td className="p-3 text-gray-500">#{i + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : classeId ? (
        <p className="text-gray-500 italic">Aucune note enregistrée pour cette classe.</p>
      ) : (
        <p className="text-gray-500 italic">Veuillez sélectionner une classe pour voir les résultats.</p>
      )}
    </div>
  );
}
