import { useEffect, useState } from "react";
import { getMesNotes } from "../../../../../services/notes/noteService";

export default function MesNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    void fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const data = await getMesNotes();
      setNotes(data || []);
    } catch (err) {
      console.error(err);
    }
  }

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
