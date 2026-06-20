import React, { useState, useEffect } from "react";
import { getResultatsEleve } from "../../../../services/notes/noteService";
import axios from "../../../../api/axios";

export default function ResultatsEleve() {
  const [eleves, setEleves] = useState([]);
  const [eleveId, setEleveId] = useState("");
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/users?role=ELEVE").then(res => setEleves(res.data.data || res.data));
  }, []);

  const rechercher = async (id) => {
    const eid = id || eleveId;
    if (!eid) return;

    setLoading(true);
    try {
      const res = await getResultatsEleve(eid);
      setResultats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEleveChange = (e) => {
    setEleveId(e.target.value);
    rechercher(e.target.value);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Résultats par élève</h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label className="block mb-2 font-medium">Sélectionner un élève</label>
        <select 
          className="w-full md:w-1/3 p-2 border rounded"
          value={eleveId}
          onChange={handleEleveChange}
        >
          <option value="">-- Choisir un élève --</option>
          {eleves.map(e => (
            <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : resultats.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Matière</th>
                <th className="p-3">Période</th>
                <th className="p-3">Type</th>
                <th className="p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{r.matiere}</td>
                  <td className="p-3 text-sm">{r.periode}</td>
                  <td className="p-3 text-sm text-gray-600">{r.type}</td>
                  <td className="p-3">
                    <span className={`font-bold ${r.note >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                      {r.note} / 20
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : eleveId ? (
        <p className="text-gray-500 italic">Aucune note trouvée pour cet élève.</p>
      ) : (
        <p className="text-gray-500 italic">Veuillez sélectionner un élève pour voir ses notes.</p>
      )}
    </div>
  );
}
