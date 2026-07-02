import React, { useEffect, useState } from "react";
import { apiClient } from "../../../../../core/api/apiClient";

export default function MesNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await apiClient("/espace-eleve/notes");
      setNotes(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Mes Notes</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Matière</th>
            <th>Note</th>
          </tr>
        </thead>

        <tbody>
          {notes.map((note) => (
            <tr key={note.id}>
              <td>{note.matiere}</td>
              <td>{note.valeur}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}