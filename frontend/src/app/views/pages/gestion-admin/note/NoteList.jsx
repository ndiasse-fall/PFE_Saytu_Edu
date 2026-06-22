import React, { useEffect, useState } from "react";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from "../../../../services/notes/noteService";

import axios from "../../../../api/axios";

export default function NoteList() {

    /* ===================== STATES ===================== */

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);

    const [eleves, setEleves] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [classes, setClasses] = useState([]);

    const [editNote, setEditNote] = useState(null);

    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        classe: "",
        matiere: "",
        periode: ""
    });

    const [form, setForm] = useState({
        id_eleve: "",
        id_classe: "",
        id_matiere: "",
        type_evaluation: "Devoir 1",
        periode: "Semestre 1",
        valeur: ""
    });

    const [editForm, setEditForm] = useState({
        valeur: "",
        type_evaluation: "",
        periode: ""
    });

    /* ===================== LOAD DATA ===================== */

    useEffect(() => {
        loadNotes();
        loadEleves();
        loadMatieres();
        loadClasses();
    }, []);

    useEffect(() => {
        loadNotes();
    }, [search, filters]);

    const loadNotes = async () => {
        setLoading(true);

        try {
            const response = await getNotes({
                search,
                classe: filters.classe,
                matiere: filters.matiere,
                periode: filters.periode
            });

            console.log("NOTES API =>", response);

            setNotes(response.data ?? response ?? []);

        } catch (error) {
            console.error("Erreur notes :", error);
        } finally {
            setLoading(false);
        }
    };

    const loadEleves = async () => {
        try {
            const res = await axios.get("/users", {
                params: { role: "ELEVE" }
            });

            setEleves(res.data.data ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMatieres = async () => {
        try {
            const res = await axios.get("/matieres");
            setMatieres(res.data.data ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadClasses = async () => {
        try {
            const res = await axios.get("/classes");
            setClasses(res.data.data ?? []);
        } catch (err) {
            console.error(err);
        }
    };

    /* ===================== CREATE ===================== */

    const handleCreate = async () => {
        try {
            await createNote(form);
            setForm({
                id_eleve: "",
                id_classe: "",
                id_matiere: "",
                type_evaluation: "Devoir 1",
                periode: "Semestre 1",
                valeur: ""
            });

            loadNotes();
        } catch (error) {
            console.error(error);
        }
    };

    /* ===================== EDIT ===================== */

    const openEditModal = (note) => {
        console.log("CLICK MODIFIER =>", note);

        if (!note) return;

        setEditNote(note);

        setEditForm({
            valeur: note.valeur ?? "",
            type_evaluation: note.type_evaluation ?? "",
            periode: note.periode ?? ""
        });

        setShowEdit(true);
    };

    const handleUpdate = async () => {
        if (!editNote) return;

        try {
            await updateNote(editNote.id, editForm);

            setShowEdit(false);
            setEditNote(null);

            loadNotes();
        } catch (error) {
            console.error(error);
        }
    };

    /* ===================== DELETE ===================== */

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette note ?")) return;

        try {
            await deleteNote(id);
            loadNotes();
        } catch (error) {
            console.error(error);
        }
    };

    /* ===================== FILTER FRONT ===================== */

    const filteredNotes = Array.isArray(notes)
        ? notes.filter((note) => {
            const t = search.toLowerCase();

            return (
                note.eleve?.nom?.toLowerCase().includes(t) ||
                note.eleve?.prenom?.toLowerCase().includes(t) ||
                note.matiere?.nom_matiere?.toLowerCase().includes(t) ||
                note.classe?.nom_classe?.toLowerCase().includes(t) ||
                note.type_evaluation?.toLowerCase().includes(t)
            );
        })
        : [];

    /* ===================== RENDER ===================== */

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-4">
                Gestion des Notes
            </h1>

            {/* SEARCH BAR */}
            <input
                className="border p-2 mb-4 w-full md:w-1/3"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* TABLE */}
            <div className="bg-white shadow rounded p-4">

                {loading ? (
                    <p>Chargement...</p>
                ) : (
                    <table className="w-full">

                        <thead>
                            <tr>
                                <th>Élève</th>
                                <th>Classe</th>
                                <th>Matière</th>
                                <th>Type</th>
                                <th>Période</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredNotes.map((note) => (
                                <tr key={note.id}>

                                    <td>{note.eleve?.prenom} {note.eleve?.nom}</td>
                                    <td>{note.classe?.nom_classe}</td>
                                    <td>{note.matiere?.nom_matiere}</td>
                                    <td>{note.type_evaluation}</td>
                                    <td>{note.periode}</td>
                                    <td>{note.valeur} /20</td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(note)}
                                            className="bg-blue-500 text-white px-2 py-1 mr-2"
                                        >
                                            Modifier
                                        </button>

                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="bg-red-500 text-white px-2 py-1"
                                        >
                                            Supprimer
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}

            </div>

            {/* ================= MODAL EDIT ================= */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

                    <div className="bg-white p-6 rounded w-[400px]">

                        <h2 className="text-xl font-bold mb-4">
                            Modifier note
                        </h2>

                        <input
                            className="border p-2 w-full mb-2"
                            value={editForm.valeur}
                            onChange={(e) =>
                                setEditForm({ ...editForm, valeur: e.target.value })
                            }
                            placeholder="Note"
                        />

                        <select
                            className="border p-2 w-full mb-2"
                            value={editForm.type_evaluation}
                            onChange={(e) =>
                                setEditForm({ ...editForm, type_evaluation: e.target.value })
                            }
                        >
                            <option>Devoir 1</option>
                            <option>Devoir 2</option>
                            <option>Composition</option>
                            <option>Examen</option>
                        </select>

                        <select
                            className="border p-2 w-full mb-2"
                            value={editForm.periode}
                            onChange={(e) =>
                                setEditForm({ ...editForm, periode: e.target.value })
                            }
                        >
                            <option>Semestre 1</option>
                            <option>Semestre 2</option>
                            <option>Annuel</option>
                        </select>

                        <div className="flex justify-end gap-2">

                            <button
                                onClick={() => setShowEdit(false)}
                                className="px-3 py-1 bg-gray-400 text-white"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="px-3 py-1 bg-green-600 text-white"
                            >
                                Modifier
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}