import React, { useEffect, useState } from "react";
import { apiClient } from "../../../../../core/api/apiClient";

export default function MesAbsences() {
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    try {
      const data = await apiClient("/espace-eleve/absences");
      setAbsences(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Mes Absences</h2>

      <ul>
        {absences.map((absence) => (
          <li key={absence.id}>
            {absence.date} - {absence.motif}
          </li>
        ))}
      </ul>
    </div>
  );
}