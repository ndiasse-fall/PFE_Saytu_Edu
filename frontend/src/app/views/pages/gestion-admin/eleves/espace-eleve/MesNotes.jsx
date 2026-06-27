import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MesNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data } = await axios.get(
      "/api/espace-eleve/notes"
    );

    setNotes(data);
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