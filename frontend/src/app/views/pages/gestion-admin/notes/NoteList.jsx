import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TablePagination from "@mui/material/TablePagination";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getStoredUser } from "../../../../core/storage/authStorage";
import { apiClient } from "../../../../core/api/apiClient";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { getNotes, createNote, updateNote, deleteNote } from "../../../../services/notes/noteService";
import { buildClasseResultsPath } from "../../../../util/noteRoutes";
import { shouldShowMatiereFilter } from "../../../../util/noteFilters";

export default function NoteList() {
    const navigate = useNavigate();

    /* ===================== STATES ===================== */
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [eleves, setEleves] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [classes, setClasses] = useState([]);
   
    const [selectedRow, setSelectedRow] = useState(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ niveau: "", classe: "", matiere: "", periode: "" });
    const [form, setForm] = useState({ id_note: "", id_eleve: "", id_classe: "", id_matiere: "", type_evaluation: "Devoir 1", periode: "Semestre 1", valeur: "" });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItemForMenu, setSelectedItemForMenu] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [currentUser, setCurrentUser] = useState(getStoredUser());

    /* ===================== LOAD DATA ===================== */
    useEffect(() => {
        loadMatieres();
        loadClasses();
        
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!filters.classe) {
                setNotes([]);
                setEleves([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setPage(0);

            try {
                await loadEleves(filters.classe);
                await loadNotes();
            } catch (error) {
                console.error("Erreur globale :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [search, filters.classe, filters.matiere, filters.periode, filters.niveau]);

    const loadNotes = async () => {
        try {
            const response = await getNotes({ search, classe: filters.classe, matiere: filters.matiere, periode: filters.periode, niveau: filters.niveau });
            setNotes(response.data ?? response ?? []);
        } catch (error) {
            console.error("Erreur loadNotes :", error);
            setNotes([]);
        }
    };

    const loadEleves = async (idClasse) => {
        if (!idClasse) { setEleves([]); return; }

        try {
            const res = await apiClient(`/mes-classes/${idClasse}/eleves`);
            const data = res?.data || res;
            setEleves(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur loadEleves :", err);
            setEleves([]);
        }
    };

    const loadMatieres = async () => {
        try {
            const userRole = currentUser?.role;
            const url = userRole === "ENSEIGNANT" ? "/mes-matieres" : "/matieres";
            const res = await apiClient(url);
            setMatieres(Array.isArray(res?.data || res) ? (res?.data || res) : []);
        } catch (err) { setMatieres([]); }
    };

    const loadClasses = async () => {
        try {
            const user = currentUser;
            const url = (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") ? "/classes" : "/mes-classes";
            const res = await apiClient(url);
            setClasses(Array.isArray(res) ? res : []);
        } catch (err) { setClasses([]); }
    };

   // Dans votre composant NoteList, remplacez loadNiveaux par ceci :

const niveaux = React.useMemo(() => {
    const uniqueNiveaux = [];
    const nomsVus = new Set();
    
    classes.forEach(c => {
        // On vérifie si la colonne 'niveau' existe et n'a pas déjà été ajoutée
        if (c.niveau && !nomsVus.has(c.niveau)) {
            nomsVus.add(c.niveau);
            // On crée un objet avec le nom comme ID pour le select
            uniqueNiveaux.push({ id: c.niveau, nom_niveau: c.niveau });
        }
    });
    return uniqueNiveaux;
}, [classes]);
    /* ===================== HANDLERS & HELPERS ===================== */
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

    const openEleveDetails = (eleve) => {
        navigate(`/notes/${eleve.id}`, {
            state: {
                eleve,
                classeId: filters.classe,
            },
        });
    };
    
    const openCreateDrawer = (eleve) => {
        setDrawerMode("create");
        setSelectedRow({ eleve, note: null });
        setForm({ id_note: "", id_eleve: eleve.id || "", id_classe: filters.classe || "", id_matiere: filters.matiere || (matieres[0]?.id || ""), type_evaluation: "Devoir 1", periode: "Semestre 1", valeur: "" });
        setShowDrawer(true);
    };

    const openEditDrawer = (eleve, note) => {
        setDrawerMode("edit");
        setSelectedRow({ eleve, note });
        setForm({ id_note: note.id || "", id_eleve: eleve.id || "", id_classe: note.id_classe || filters.classe || "", id_matiere: note.id_matiere || (note.matiere?.id || ""), type_evaluation: note.type_evaluation || "Devoir 1", periode: note.periode || "Semestre 1", valeur: note.valeur ?? "" });
        setShowDrawer(true);
    };

    const handleSave = async () => {
        try {
            if (drawerMode === "create") await createNote({ id_classe: form.id_classe, id_matiere: form.id_matiere, type_evaluation: form.type_evaluation, periode: form.periode, notes: [{ id_eleve: form.id_eleve, valeur: Number(form.valeur) }] });
            else await updateNote(form.id_note, { valeur: form.valeur, type_evaluation: form.type_evaluation, periode: form.periode, id_matiere: form.id_matiere });
            setShowDrawer(false);
            loadNotes();
        } catch (error) { console.error("Erreur sauvegarde :", error); }
    };

    const handleDeleteAction = async (idNote) => {
        if (!idNote || !window.confirm("Supprimer cette note ?")) return;
        try { await deleteNote(idNote); setShowDrawer(false); loadNotes(); } catch (error) { console.error("Erreur :", error); }
    };

    const filteredRows = eleves.map(eleve => ({ eleve, note: notes.find(n => n.eleve?.id === eleve.id || n.id_eleve === eleve.id) || null }))
        .filter(row => !search || row.eleve.nom?.toLowerCase().includes(search.toLowerCase()) || row.eleve.prenom?.toLowerCase().includes(search.toLowerCase()));

    const displayRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestion des Notes</h1>

            {/* Utilisez 'flex-row' pour forcer l'alignement horizontal */}
<div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", gap: "16px", marginBottom: "24px", flexWrap: "nowrap" }}>

    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1">
            NIVEAU
        </label>

        <select
            className="border rounded p-2 w-80"
            value={filters.niveau}
            onChange={(e) =>
                setFilters({
                    ...filters,
                    niveau: e.target.value,
                    classe: "",
                })
            }
        >
            <option value="">Tous les niveaux</option>
            {niveaux.map((n) => (
                <option key={n.id} value={n.id}>
                    {n.nom_niveau}
                </option>
            ))}
        </select>
    </div>

    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1">
            CLASSE
        </label>

        <select
            className="border rounded p-2 w-80"
            value={filters.classe}
            onChange={(e) =>
                setFilters({
                    ...filters,
                    classe: e.target.value,
                })
            }
        >
            <option value="">Toutes les classes</option>

            {classes
                .filter(
                    (c) =>
                        !filters.niveau ||
                        c.niveau === filters.niveau ||
                        c.id_niveau === filters.niveau
                )
                .map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nom_classe}
                    </option>
                ))}
        </select>
    </div>

    {shouldShowMatiereFilter(currentUser?.role) ? (
        <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1">
                MATIÈRE
            </label>

            <select
                className="border rounded p-2 w-80"
                value={filters.matiere}
                onChange={(e) =>
                    setFilters({
                        ...filters,
                        matiere: e.target.value,
                    })
                }
            >
                <option value="">Toutes les matières</option>
                {matieres.map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                        {matiere.nom_matiere || matiere.nom || `Matière ${matiere.id}`}
                    </option>
                ))}
            </select>
        </div>
    ) : null}

    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <label className="text-xs font-bold text-gray-500 uppercase mb-1">
            PÉRIODE
        </label>

        <select
            className="border rounded p-2 w-80"
            value={filters.periode}
            onChange={(e) =>
                setFilters({
                    ...filters,
                    periode: e.target.value,
                })
            }
        >
            <option value="">Toutes les périodes</option>
            <option value="Semestre 1">Semestre 1</option>
            <option value="Semestre 2">Semestre 2</option>
        </select>
    </div>

    <button
        className="bg-slate-700 hover:bg-slate-800 text-white rounded px-6 h-10"
        disabled={!filters.classe}
        onClick={() => {
            if (!filters.classe) return;
            navigate(buildClasseResultsPath(filters.classe));
        }}
    >
        Résultats classe
    </button>

    <button
        style={{ marginLeft: "auto", alignSelf: "flex-end" }}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-6 h-10"
        onClick={() =>
            setFilters({
                niveau: "",
                classe: "",
                matiere: "",
                periode: "",
            })
        }
    >
        Réinitialiser
    </button>

</div>
            <input className="border p-2 mb-4 w-full md:w-1/3 rounded shadow-xs" placeholder="Rechercher un élève..." value={search} onChange={(e) => setSearch(e.target.value)} />

            <div className="bg-white shadow rounded p-4">
                {loading && filters.classe ? <p>Chargement...</p> : (
                    <>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>{["Prénom", "Nom", "Actions"].map(h => <th key={h} className="pb-2">{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {!filters.classe ? <tr><td colSpan="3" className="text-center py-6">Sélectionnez une classe.</td></tr> : displayRows.map(({ eleve, note }) => (
                                    <tr key={eleve.id} className="border-b">
                                        <td className="py-2">{eleve.prenom}</td>
                                        <td className="py-2">{eleve.nom}</td>
                                        <td className="py-2">
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                                                onClick={() => openEleveDetails(eleve)}
                                            >
                                                Voir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            <DrawerPanel open={showDrawer} onClose={() => setShowDrawer(false)} title={drawerMode === "create" ? "Ajouter une note" : "Modifier la note"}>
                <div className="flex flex-col justify-between h-full pt-4">
                    <div className="space-y-5">
                        <input disabled className="border bg-slate-100 rounded-lg p-3 w-full" value={selectedRow?.eleve ? `${selectedRow.eleve.prenom} ${selectedRow.eleve.nom}` : ""} />
                        <input type="number" className="border rounded-lg p-3 w-full" value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} placeholder="Note" />
                        <select className="border rounded-lg p-3 w-full" value={form.type_evaluation} onChange={(e) => setForm({ ...form, type_evaluation: e.target.value })}>
                            <option value="Devoir 1">Devoir 1</option><option value="Devoir 2">Devoir 2</option><option value="Composition">Composition</option>
                        </select>
                    </div>
                    <button onClick={handleSave} className="bg-blue-600 text-white py-3 rounded-lg mt-4">Enregistrer</button>
                </div>
            </DrawerPanel>
        </div>
    );
}
