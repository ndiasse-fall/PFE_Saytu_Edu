import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getStoredUser } from "../../../../core/storage/authStorage";
import React, { useEffect, useState } from "react";
import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from "../../../../services/notes/noteService";
import { apiClient } from "../../../../core/api/apiClient";
import TablePagination from "@mui/material/TablePagination";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";

export default function NoteList() {

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
    const [filters, setFilters] = useState({
        classe: "",
        matiere: "",
        periode: ""
    });
    const [form, setForm] = useState({
        id_note: "",
        id_eleve: "",
        id_classe: "",
        id_matiere: "",
        type_evaluation: "Devoir 1",
        periode: "Semestre 1",
        valeur: ""
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItemForMenu, setSelectedItemForMenu] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    /* ===================== LOAD DATA ===================== */

    useEffect(() => {
        loadMatieres();
        loadClasses();
    }, []);

    // Chargement des élèves dès que la classe change
    useEffect(() => {
        if (filters.classe) {
            setLoading(true);
            loadEleves(filters.classe).finally(() => setLoading(false));
            setPage(0);
        } else {
            setEleves([]);
            setNotes([]);
        }
    }, [filters.classe]);

    // Chargement des notes dès que les paramètres de filtrage changent
    useEffect(() => {
        if (filters.classe) {
            loadNotes();
        }
    }, [filters.classe, filters.matiere, filters.periode, search]);

    const loadNotes = async () => {
        try {
            const response = await getNotes({
                search,
                classe: filters.classe,
                matiere: filters.matiere,
                periode: filters.periode
            });
            setNotes(response.data ?? response ?? []);
        } catch (error) {
            console.error("Erreur notes :", error);
            setNotes([]);
        }
    };

    const loadEleves = async (idClasse) => {
        try {
            const res = await apiClient(`/mes-classes/${idClasse}/eleves`);
            const data = res?.data || res;
            setEleves(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("ELEVES ERROR :", err);
            setEleves([]);
        }
    };

    const loadMatieres = async () => {
        try {
            const res = await apiClient("/matieres");
            const data = res?.data || res;
            setMatieres(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("MATIERES ERROR :", err);
            setMatieres([]);
        }
    };

    const loadClasses = async () => {
        try {
            const user = getStoredUser();
            const url = (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") ? "/classes" : "/mes-classes";
            const res = await apiClient(url);
            setClasses(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error("Erreur lors du chargement des classes :", err);
            setClasses([]);
        }
    };

    /* ===================== PAGINATION & DRAWER ===================== */
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const openCreateDrawer = (eleve) => {
        setDrawerMode("create");
        setSelectedRow({ eleve, note: null });
        setForm({
            id_note: "",
            id_eleve: eleve.id || "",
            id_classe: filters.classe || "",
            id_matiere: filters.matiere || (matieres[0]?.id || ""),
            type_evaluation: "Devoir 1",
            periode: "Semestre 1",
            valeur: ""
        });
        setShowDrawer(true);
    };

    const openEditDrawer = (eleve, note) => {
        setDrawerMode("edit");
        setSelectedRow({ eleve, note });
        setForm({
            id_note: note.id || "",
            id_eleve: eleve.id || "",
            id_classe: note.id_classe || filters.classe || "",
            id_matiere: note.id_matiere || (note.matiere?.id || ""),
            type_evaluation: note.type_evaluation || "Devoir 1",
            periode: note.periode || "Semestre 1",
            valeur: note.valeur ?? ""
        });
        setShowDrawer(true);
    };

    const handleSave = async () => {
        try {
            if (drawerMode === "create") {
                await createNote({
                    id_classe: form.id_classe,
                    id_matiere: form.id_matiere,
                    type_evaluation: form.type_evaluation,
                    periode: form.periode,
                    notes: [{ id_eleve: form.id_eleve, valeur: Number(form.valeur) }]
                });
            } else {
                await updateNote(form.id_note, {
                    valeur: form.valeur,
                    type_evaluation: form.type_evaluation,
                    periode: form.periode,
                    id_matiere: form.id_matiere
                });
            }
            setShowDrawer(false);
            loadNotes();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        }
    };

    const handleDeleteAction = async (idNote) => {
        if (!idNote || !window.confirm("Supprimer définitivement cette note ?")) return;
        try {
            await deleteNote(idNote);
            setShowDrawer(false);
            loadNotes();
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    const handleOpenMenu = (event, item) => { setAnchorEl(event.currentTarget); setSelectedItemForMenu(item); };
    const handleCloseMenu = () => { setAnchorEl(null); setSelectedItemForMenu(null); };

    /* ===================== RENDER HELPERS ===================== */
    const filteredRows = eleves.map(eleve => ({
        eleve,
        note: notes.find(n => n.eleve?.id === eleve.id || n.id_eleve === eleve.id) || null
    })).filter(row => {
        if (!search) return true;
        const t = search.toLowerCase();
        return (row.eleve.nom?.toLowerCase().includes(t) || row.eleve.prenom?.toLowerCase().includes(t));
    });

    const displayRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestion des Notes</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <select className="border p-2 rounded bg-white shadow-xs outline-hidden min-w-[240px]" value={filters.classe} onChange={(e) => setFilters({ ...filters, classe: e.target.value })}>
                    <option value="">Sélectionner une classe</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.nom_classe}</option>)}
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 px-4 transition-colors shadow-xs" onClick={() => setFilters({ classe: "", matiere: "", periode: "" })}>Réinitialiser</button>
            </div>
            
            <input className="border p-2 mb-4 w-full md:w-1/3 rounded shadow-xs outline-hidden" placeholder="Rechercher un élève..." value={search} onChange={(e) => setSearch(e.target.value)} />

            <div className="bg-white shadow rounded p-4">
                {loading ? <p>Chargement...</p> : (
                    <>
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-xs">
                                    <tr>
                                        <th className="pb-2">Élève</th>
                                        <th className="pb-2">Type</th>
                                        <th className="pb-2">Période</th>
                                        <th className="pb-2">Note</th>
                                        <th className="pb-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!filters.classe ? (
                                        <tr><td colSpan="5" className="text-center py-6 text-gray-500 font-medium">Veuillez sélectionner une classe.</td></tr>
                                    ) : displayRows.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-gray-500">Aucun élève trouvé.</td></tr>
                                    ) : (
                                        displayRows.map(({ eleve, note }) => (
                                            <tr key={eleve.id} className="border-b hover:bg-slate-50 transition-colors">
                                                <td className="py-2">{eleve.prenom} {eleve.nom}</td>
                                                <td className="py-2">{note ? note.type_evaluation : "--"}</td>
                                                <td className="py-2">{note ? note.periode : "--"}</td>
                                                <td className="py-2 font-medium text-slate-700">{note ? `${note.valeur} /20` : <span className="text-gray-400 italic font-normal">Pas de note</span>}</td>
                                                <td className="py-2">
                                                    <IconButton onClick={(e) => handleOpenMenu(e, { eleve, note })}><MoreVertIcon /></IconButton>
                                                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedItemForMenu?.eleve?.id === eleve.id} onClose={handleCloseMenu}>
                                                        {!selectedItemForMenu?.note ? (
                                                            <MenuItem onClick={() => { openCreateDrawer(selectedItemForMenu.eleve); handleCloseMenu(); }} className="text-blue-600 font-medium">Ajouter une note</MenuItem>
                                                        ) : [
                                                            <MenuItem key="edit" onClick={() => { openEditDrawer(selectedItemForMenu.eleve, selectedItemForMenu.note); handleCloseMenu(); }}>Modifier</MenuItem>,
                                                            <MenuItem key="delete" onClick={() => { handleDeleteAction(selectedItemForMenu.note.id); handleCloseMenu(); }} className="text-red-600 font-medium">Supprimer</MenuItem>
                                                        ]}
                                                    </Menu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filters.classe && filteredRows.length > 0 && (
                            <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 15, 25]} />
                        )}
                    </>
                )}
            </div>

            <DrawerPanel open={showDrawer} onClose={() => setShowDrawer(false)} title={drawerMode === "create" ? "Ajouter une note" : "Modifier la note"}>
                <div className="flex flex-col justify-between h-full pt-4">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Élève</label>
                            <input type="text" disabled className="border border-gray-200 bg-slate-100 rounded-lg p-3 w-full text-slate-500 cursor-not-allowed" value={selectedRow?.eleve ? `${selectedRow.eleve.prenom} ${selectedRow.eleve.nom}` : ""} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Note (sur 20)</label>
                            <input type="number" min="0" max="20" step="0.25" className="border border-gray-300 rounded-lg p-3 w-full" value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} placeholder="Ex: 15.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type d'évaluation</label>
                            <select className="border border-gray-300 rounded-lg p-3 w-full bg-white" value={form.type_evaluation} onChange={(e) => setForm({ ...form, type_evaluation: e.target.value })}>
                                <option value="Devoir 1">Devoir 1</option>
                                <option value="Devoir 2">Devoir 2</option>
                                <option value="Composition">Composition</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Période</label>
                            <select className="border border-gray-300 rounded-lg p-3 w-full bg-white" value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })}>
                                <option value="Semestre 1">Semestre 1</option>
                                <option value="Semestre 2">Semestre 2</option>
                                <option value="Annuel">Annuel</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 border-t pt-4 mt-8">
                        <button onClick={handleSave} className={`flex-1 text-white font-medium py-3 rounded-lg ${drawerMode === "create" ? "bg-green-600" : "bg-blue-600"}`}>
                            {drawerMode === "create" ? "Ajouter la note" : "Enregistrer"}
                        </button>
                        <button onClick={() => setShowDrawer(false)} className="flex-1 bg-gray-100 text-slate-700 py-3 rounded-lg">Annuler</button>
                    </div>
                </div>
            </DrawerPanel>
        </div>
    );
}