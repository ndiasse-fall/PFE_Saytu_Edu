import React, { useEffect, useState } from "react";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from "../../../../services/notes/noteService";

import axios from "../../../../api/axios";

export default function NoteList() {

    /* =====================================================
       ETATS
    ===================================================== */

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEdit, setShowEdit] = useState(false);

    const [eleves, setEleves] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [classes, setClasses] = useState([]);

    const [showAdd, setShowAdd] = useState(false);
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

    /* =====================================================
       CHARGEMENT INITIAL
    ===================================================== */

    useEffect(() => {
        loadNotes();
        loadEleves();
        loadMatieres();
        loadClasses();
    }, []);

    /* =====================================================
       CHARGEMENT DES NOTES
    ===================================================== */

    const loadNotes = async () => {
        setLoading(true);

        try {

            const response = await getNotes({
                search: search,
                classe: filters.classe,
                matiere: filters.matiere,
                periode: filters.periode
            });

            setNotes(response.data || []);

        } catch (error) {

            console.error("Erreur chargement notes :", error);

        } finally {

            setLoading(false);

        }
    };

    /* =====================================================
       ELEVES
    ===================================================== */

    const loadEleves = async () => {

        try {

            const response = await axios.get("/users", {
                params: {
                    role: "eleve"
                }
            });

            setEleves(response.data.data || []);

        } catch (error) {

            console.error(error);

        }
    };

    /* =====================================================
       MATIERES
    ===================================================== */

    const loadMatieres = async () => {

        try {

            const response = await axios.get("/matieres");

            setMatieres(response.data.data || []);

        } catch (error) {

            console.error(error);

        }
    };

    /* =====================================================
       CLASSES
    ===================================================== */

    const loadClasses = async () => {

        try {

            const response = await axios.get("/classes");

            setClasses(response.data.data || []);

        } catch (error) {

            console.error(error);

        }
    };

    /* =====================================================
       RECHARGEMENT APRES FILTRE
    ===================================================== */

    useEffect(() => {

        loadNotes();

    }, [search, filters]);

        /* =====================================================
       REINITIALISER LE FORMULAIRE
    ===================================================== */

    const resetForm = () => {
        setForm({
            id_eleve: "",
            id_classe: "",
            id_matiere: "",
            type_evaluation: "Devoir 1",
            periode: "Semestre 1",
            valeur: ""
        });
    };

    /* =====================================================
       AJOUTER UNE NOTE
    ===================================================== */

    const handleCreate = async () => {

        try {

            await createNote(form);

            alert("Note ajoutée avec succès.");

            setShowAdd(false);

            resetForm();

            loadNotes();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Erreur lors de l'ajout."
            );

        }

    };

    /* =====================================================
       OUVRIR LA FENETRE DE MODIFICATION
    ===================================================== */

    const openEditModal = (note) => {

        setEditNote(note);

        setEditForm({
            valeur: note.valeur,
            type_evaluation: note.type_evaluation,
            periode: note.periode
        });

    };

    /* =====================================================
       MODIFIER UNE NOTE
    ===================================================== */

    const handleUpdate = async () => {

        try {

            await updateNote(editNote.id, {

                valeur: editForm.valeur,

                type_evaluation: editForm.type_evaluation,

                periode: editForm.periode

            });

            alert("Note modifiée avec succès.");

            setEditNote(null);

            loadNotes();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Erreur lors de la modification."
            );

        }

    };

    /* =====================================================
       SUPPRIMER UNE NOTE
    ===================================================== */

    const handleDelete = async (id) => {

        if (!window.confirm("Voulez-vous vraiment supprimer cette note ?")) {
            return;
        }

        try {

            await deleteNote(id);

            alert("Note supprimée.");

            loadNotes();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Impossible de supprimer cette note."
            );

        }

    };

    /* =====================================================
       FILTRER LES NOTES LOCALEMENT
    ===================================================== */

    const filteredNotes = notes.filter((note) => {

        const texte = search.toLowerCase();

        return (

            (note.eleve?.nom?.toLowerCase().includes(texte) ||

            note.eleve?.prenom?.toLowerCase().includes(texte) ||

            note.matiere?.nom_matiere?.toLowerCase().includes(texte) ||

            note.classe?.nom_classe?.toLowerCase().includes(texte) ||

            note.type_evaluation?.toLowerCase().includes(texte))

        );

    });

        /* =====================================================
       AFFICHAGE
    ===================================================== */

    return (
        <div className="p-6">

            {/* ================= HEADER ================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Gestion des Notes
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Liste des évaluations des élèves
                    </p>
                </div>

                <button
                    onClick={() => setShowAdd(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow"
                >
                    + Ajouter une note
                </button>

            </div>

            {/* ================= RECHERCHE + FILTRES ================= */}

            <div className="bg-white rounded-lg shadow p-4 mb-6">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* Recherche */}

                    <input
                        type="text"
                        placeholder="Rechercher un élève, matière..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-lg px-3 py-2"
                    />

                    {/* Classe */}

                    <select
                        value={filters.classe}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                classe: e.target.value
                            })
                        }
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="">
                            Toutes les classes
                        </option>

                        {classes.map((classe) => (

                            <option
                                key={classe.id}
                                value={classe.id}
                            >
                                {classe.nom_classe}
                            </option>

                        ))}
                    </select>

                    {/* Matière */}

                    <select
                        value={filters.matiere}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                matiere: e.target.value
                            })
                        }
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="">
                            Toutes les matières
                        </option>

                        {matieres.map((matiere) => (

                            <option
                                key={matiere.id}
                                value={matiere.id}
                            >
                                {matiere.nom_matiere}
                            </option>

                        ))}
                    </select>

                    {/* Période */}

                    <select
                        value={filters.periode}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                periode: e.target.value
                            })
                        }
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="">
                            Toutes les périodes
                        </option>

                        <option value="Semestre 1">
                            Semestre 1
                        </option>

                        <option value="Semestre 2">
                            Semestre 2
                        </option>

                        <option value="Annuel">
                            Annuel
                        </option>

                    </select>

                </div>

            </div>

            {/* ================= TABLEAU ================= */}

            <div className="bg-white rounded-lg shadow overflow-x-auto">

                {loading ? (

                    <div className="p-8 text-center text-gray-500">
                        Chargement des notes...
                    </div>

                ) : (                    <table className="min-w-full">

                        <thead className="bg-gray-100 text-gray-700">

                            <tr>

                                <th className="px-4 py-3 text-left">
                                    Élève
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Classe
                                </th>

                                <th className="px-4 py-3 text-left">
                                    Matière
                                </th>

                                <th className="px-4 py-3 text-center">
                                    Type
                                </th>

                                <th className="px-4 py-3 text-center">
                                    Période
                                </th>

                                <th className="px-4 py-3 text-center">
                                    Note
                                </th>

                                <th className="px-4 py-3 text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredNotes.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Aucune note trouvée.
                                    </td>

                                </tr>

                            ) : (

                                filteredNotes.map((note) => (

                                    <tr
                                        key={note.id}
                                        className="border-t hover:bg-gray-50"
                                    >

                                        {/* Élève */}

                                        <td className="px-4 py-3">

                                            <div className="font-medium">

                                                {note.eleve
                                                    ? `${note.eleve.prenom} ${note.eleve.nom}`
                                                    : "-"}

                                            </div>

                                        </td>

                                        {/* Classe */}

                                        <td className="px-4 py-3">

                                            {note.classe?.nom_classe || "-"}

                                        </td>

                                        {/* Matière */}

                                        <td className="px-4 py-3">

                                            {note.matiere?.nom_matiere || "-"}

                                        </td>

                                        {/* Type */}

                                        <td className="px-4 py-3 text-center">

                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                                                {note.type_evaluation}

                                            </span>

                                        </td>

                                        {/* Période */}

                                        <td className="px-4 py-3 text-center">

                                            {note.periode}

                                        </td>

                                        {/* Note */}

                                        <td className="px-4 py-3 text-center">

                                            <span
                                                className={`font-bold ${
                                                    Number(note.valeur) >= 10
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {note.valeur} /20
                                            </span>

                                        </td>

                                        {/* Actions */}

                                        <td className="px-4 py-3">

                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() => openEditModal(note)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                                >
                                                    Modifier
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(note.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                                >
                                                    Supprimer
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>
                                    )}

            </div>

            {/* =====================================================
                MODAL AJOUT
            ===================================================== */}

            {showAdd && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">
                            Ajouter une note
                        </h2>

                        {/* Élève */}

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Élève
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.id_eleve}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        id_eleve: e.target.value
                                    })
                                }
                            >

                                <option value="">
                                    Sélectionner un élève
                                </option>

                                {eleves.map((eleve) => (

                                    <option
                                        key={eleve.id}
                                        value={eleve.id}
                                    >
                                        {eleve.prenom} {eleve.nom}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Classe */}

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Classe
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.id_classe}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        id_classe: e.target.value
                                    })
                                }
                            >

                                <option value="">
                                    Sélectionner une classe
                                </option>

                                {classes.map((classe) => (

                                    <option
                                        key={classe.id}
                                        value={classe.id}
                                    >
                                        {classe.nom_classe}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Matière */}

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Matière
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.id_matiere}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        id_matiere: e.target.value
                                    })
                                }
                            >

                                <option value="">
                                    Sélectionner une matière
                                </option>

                                {matieres.map((matiere) => (

                                    <option
                                        key={matiere.id}
                                        value={matiere.id}
                                    >
                                        {matiere.nom_matiere}
                                    </option>

                                ))}

                            </select>

                        </div>

                        {/* Type */}

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Type d'évaluation
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.type_evaluation}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        type_evaluation: e.target.value
                                    })
                                }
                            >

                                <option value="Devoir 1">Devoir 1</option>
                                <option value="Devoir 2">Devoir 2</option>
                                <option value="Composition">Composition</option>
                                <option value="Examen">Examen</option>

                            </select>

                        </div>

                        {/* Période */}

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Période
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.periode}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        periode: e.target.value
                                    })
                                }
                            >

                                <option value="Semestre 1">Semestre 1</option>
                                <option value="Semestre 2">Semestre 2</option>
                                <option value="Annuel">Annuel</option>

                            </select>

                        </div>

                        {/* Note */}

                        <div className="mb-6">

                            <label className="block mb-2 font-medium">
                                Note (/20)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                className="w-full border rounded-lg p-2"
                                value={form.valeur}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        valeur: e.target.value
                                    })
                                }
                            />

                        </div>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowAdd(false);
                                }}
                                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={handleCreate}
                                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
                            >
                                Enregistrer
                            </button>

                        </div>

                    </div>

                </div>

            )}
            {/* ================= MODAL MODIFICATION ================= */}

            {showEdit && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">

                        <h2 className="text-2xl font-bold mb-6">
                            Modifier une note
                        </h2>

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Élève
                            </label>

                            <input
                                type="text"
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                value={
                                    `${selectedNote?.eleve?.prenom || ""} ${selectedNote?.eleve?.nom || ""}`
                                }
                                disabled
                            />

                        </div>

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Matière
                            </label>

                            <input
                                type="text"
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                value={selectedNote?.matiere?.nom_matiere || ""}
                                disabled
                            />

                        </div>

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Type d'évaluation
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.type_evaluation}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        type_evaluation: e.target.value
                                    })
                                }
                            >
                                <option value="Devoir 1">Devoir 1</option>
                                <option value="Devoir 2">Devoir 2</option>
                                <option value="Composition">Composition</option>
                                <option value="Examen">Examen</option>
                            </select>

                        </div>

                        <div className="mb-4">

                            <label className="block mb-2 font-medium">
                                Période
                            </label>

                            <select
                                className="w-full border rounded-lg p-2"
                                value={form.periode}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        periode: e.target.value
                                    })
                                }
                            >
                                <option value="Semestre 1">Semestre 1</option>
                                <option value="Semestre 2">Semestre 2</option>
                                <option value="Annuel">Annuel</option>
                            </select>

                        </div>

                        <div className="mb-6">

                            <label className="block mb-2 font-medium">
                                Note (/20)
                            </label>

                            <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                className="w-full border rounded-lg p-2"
                                value={form.valeur}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        valeur: e.target.value
                                    })
                                }
                            />

                        </div>

                        <div className="flex justify-end gap-3">

                            <button
                                onClick={() => {
                                    setShowEdit(false);
                                    resetForm();
                                }}
                                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                            >
                                Annuler
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
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


