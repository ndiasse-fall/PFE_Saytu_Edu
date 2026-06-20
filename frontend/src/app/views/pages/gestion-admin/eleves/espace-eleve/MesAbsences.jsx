import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MesAbsences() {
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    loadAbsences();
  }, []);

  const loadAbsences = async () => {
    const { data } = await axios.get(
      "/api/espace-eleve/absences"
    );

    setAbsences(data);
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