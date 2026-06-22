import React, { useState, useEffect } from "react";
import { getResultatsClasse } from "../../../../services/notes/noteService";
import { apiClient } from "../../../../core/api/apiClient";

export default function ResultatsClasse() {
  const [classes, setClasses] = useState([]);
  const [classeId, setClasseId] = useState("");
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * =========================================
   * CHARGER LES CLASSES
   * =========================================
   */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await apiClient("/classes");
        setClasses(res.data || res);
      } catch (error) {
        console.log("ERROR CLASSES =>", error);
      }
    };

    fetchClasses();
  }, []);

  /**
   * =========================================
   * RECHERCHE RESULTATS
   * =========================================
   */
  const rechercher = async (id) => {
    const cid = id || classeId;
    if (!cid) return;

    setLoading(true);

    try {
      const res = await getResultatsClasse(cid);

      console.log("RESULTATS =>", res);

      setResultats(res); // ✅ IMPORTANT (pas res.data)
    } catch (error) {
      console.error("ERROR RESULTATS =>", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClasseChange = (e) => {
    const value = e.target.value;
    setClasseId(value);
    rechercher(value);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">
        Résultats par classe
      </h2>

      {/* SELECT CLASSE */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <label className="block mb-2 font-medium">
          Sélectionner une classe
        </label>

        <select
          className="w-full md:w-1/3 p-2 border rounded"
          value={classeId}
          onChange={handleClasseChange}
        >
          <option value="">-- Choisir une classe --</option>

          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom_classe}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && <p>Chargement des résultats...</p>}

      {/* TABLE */}
      {!loading && resultats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3">Élève</th>
                <th className="p-3">Moyenne Générale</th>
                <th className="p-3">Rang</th>
              </tr>
            </thead>

            <tbody>
              {resultats.map((r, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    {r.eleve?.nom} {r.eleve?.prenom}
                  </td>

                  <td className="p-3 text-blue-600 font-bold">
                    {r.moyenne} / 20
                  </td>

                  <td className="p-3 text-gray-500">
                    #{i + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && classeId && resultats.length === 0 && (
        <p className="text-gray-500 italic">
          Aucune note enregistrée pour cette classe.
        </p>
      )}

      {!classeId && (
        <p className="text-gray-500 italic">
          Veuillez sélectionner une classe pour voir les résultats.
        </p>
      )}
    </div>
  );
}