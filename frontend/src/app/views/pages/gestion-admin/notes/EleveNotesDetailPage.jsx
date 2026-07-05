import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import { DrawerPanel } from "../../../../shared/components/ui/DrawerPanel";
import { getStoredUser } from "../../../../core/storage/authStorage";
import { listMatieres } from "../../../../services/matieres/matiereService";
import { listEmplois } from "../../../../services/emplois-du-temps/emploiDuTempsService";
import { createNote, deleteNote, getNotes, updateNote } from "../../../../services/notes/noteService";

const EMPTY_FORM = {
    id_note: "",
    id_eleve: "",
    id_classe: "",
    id_matiere: "",
    type_evaluation: "Devoir 1",
    periode: "Semestre 1",
    valeur: "",
};

export default function EleveNotesDetailPage() {
    const { eleveId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [notes, setNotes] = useState([]);
    const [enseignantMatiere, setEnseignantMatiere] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);
    const [drawerMode, setDrawerMode] = useState("create");
    const [form, setForm] = useState(EMPTY_FORM);
    const [saveError, setSaveError] = useState("");
    const [effectiveClasseId, setEffectiveClasseId] = useState(location.state?.classeId || "");

    const eleve = location.state?.eleve;
    const classeId = location.state?.classeId || "";

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const loadedMatieres = await loadMatieres();
                await loadNotes();
                const selectedMatiere = await resolveTeacherMatiere(loadedMatieres);
                setEnseignantMatiere(selectedMatiere);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [eleveId, classeId]);

    const loadNotes = async () => {
        try {
            const response = await getNotes({ id_eleve: eleveId, classe: effectiveClasseId || classeId });
            const data = response?.data ?? response ?? [];
            const normalizedNotes = Array.isArray(data) ? data : [];
            setNotes(normalizedNotes);

            const fallbackClasseId = normalizedNotes.find((note) => String(note.id_eleve) === String(eleveId) || String(note.eleve?.id) === String(eleveId))?.id_classe || "";
            if (fallbackClasseId) {
                setEffectiveClasseId(fallbackClasseId);
            }
        } catch (error) {
            console.error("Erreur loadNotes detail :", error);
            setNotes([]);
        }
    };

    const resolveTeacherMatiere = async (availableMatieres = []) => {
        try {
            const response = await listEmplois();
            const sessions = response?.data ?? response ?? [];
            const timetableMatiere = Array.isArray(sessions)
                ? sessions.find((session) => session?.matiere)?.matiere || null
                : null;

            if (timetableMatiere) {
                return timetableMatiere;
            }
        } catch (error) {
            console.warn("Impossible de récupérer la matière depuis l’emploi du temps :", error);
        }

        const user = getStoredUser();
        const specialite = String(user?.specialite || user?.matiere || user?.specialité || "").trim().toLowerCase();
        const normalizedMatieres = Array.isArray(availableMatieres) ? availableMatieres : [];

        if (specialite) {
            const match = normalizedMatieres.find((matiere) => {
                const label = String(matiere?.nom_matiere || matiere?.name || matiere?.label || "").trim().toLowerCase();
                return label && (label === specialite || label.includes(specialite) || specialite.includes(label));
            });

            if (match) {
                return match;
            }
        }

        return normalizedMatieres[0] || null;
    };

    const loadMatieres = async () => {
        try {
            const res = await listMatieres();
            const data = res?.data || res;
            const normalized = Array.isArray(data) ? data : [];
            return normalized;
        } catch (err) {
            console.error("Erreur loadMatieres detail :", err);
            return [];
        }
    };

    const notesBySemester = useMemo(() => {
        const targetMatiereId = enseignantMatiere?.id;

        const filterNotesByTeacherMatiere = (semesterNotes) => {
            if (!targetMatiereId) {
                return semesterNotes;
            }

            return semesterNotes.filter((note) => {
                const noteMatiereId = note?.id_matiere ?? note?.matiere?.id;
                return String(noteMatiereId) === String(targetMatiereId);
            });
        };

        const sem1 = filterNotesByTeacherMatiere(notes.filter((n) => n.periode === "Semestre 1"));
        const sem2 = filterNotesByTeacherMatiere(notes.filter((n) => n.periode === "Semestre 2"));
        return { "Semestre 1": sem1, "Semestre 2": sem2 };
    }, [notes, enseignantMatiere]);

    const closeDrawer = () => {
        setShowDrawer(false);
        setSaveError("");
    };

    const openCreateDrawer = (semester) => {
        setDrawerMode("create");
        setSaveError("");
        setForm({
            ...EMPTY_FORM,
            id_eleve: eleveId || "",
            id_classe: effectiveClasseId || classeId || "",
            id_matiere: enseignantMatiere?.id || "",
            periode: semester,
        });
        setShowDrawer(true);
    };

    const openEditDrawer = (note) => {
        setDrawerMode("edit");
        setSaveError("");
        setForm({
            id_note: note.id || "",
            id_eleve: note.id_eleve || eleveId || "",
            id_classe: note.id_classe || effectiveClasseId || classeId || "",
            id_matiere: note.id_matiere || note.matiere?.id || enseignantMatiere?.id || "",
            type_evaluation: note.type_evaluation || "Devoir 1",
            periode: note.periode || "Semestre 1",
            valeur: note.valeur ?? "",
        });
        setShowDrawer(true);
    };

    const handleSave = async () => {
        const resolvedMatiereId = form.id_matiere || enseignantMatiere?.id || "";
        const resolvedClasseId = form.id_classe || effectiveClasseId || classeId || "";

        if (!resolvedClasseId) {
            setSaveError("La classe de l’élève n’a pas pu être déterminée.");
            return;
        }

        if (!resolvedMatiereId) {
            setSaveError("La matière du professeur n’a pas encore été déterminée.");
            return;
        }

        if (form.valeur === "" || Number.isNaN(Number(form.valeur))) {
            setSaveError("Veuillez saisir une note valide.");
            return;
        }

        try {
            setSaveError("");

            if (drawerMode === "create") {
                await createNote({
                    id_classe: resolvedClasseId,
                    id_matiere: resolvedMatiereId,
                    type_evaluation: form.type_evaluation,
                    periode: form.periode,
                    notes: [{ id_eleve: form.id_eleve, valeur: Number(form.valeur) }],
                });
            } else {
                await updateNote(form.id_note, {
                    valeur: Number(form.valeur),
                    type_evaluation: form.type_evaluation,
                    periode: form.periode,
                    id_matiere: resolvedMatiereId,
                });
            }

            closeDrawer();
            await loadNotes();
        } catch (error) {
            console.error("Erreur sauvegarde note detail :", error);
            const serverMessage = error?.details
                ? Object.values(error.details).flat().join(" ")
                : error?.message;
            setSaveError(serverMessage || "L’enregistrement a échoué. Vérifiez les données saisies.");
        }
    };

    const handleDelete = async (id) => {
        if (!id || !window.confirm("Supprimer cette note ?")) return;
        try {
            await deleteNote(id);
            await loadNotes();
        } catch (error) {
            console.error("Erreur suppression note detail :", error);
        }
    };

    const renderSemesterTable = (semester) => {
        const rows = notesBySemester[semester] || [];
        const orderedTypes = ["Devoir 1", "Devoir 2", "Composition"];
        const rowsByType = orderedTypes.map((type) => ({
            type,
            note: rows.find((row) => row.type_evaluation === type) || null,
        }));

        return (
            
            <div className="bg-white shadow rounded p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">{semester}</h2>
                    <Button variant="contained" size="small" onClick={() => openCreateDrawer(semester)}>
                        Ajouter une note
                    </Button>
                </div>

                <table className="w-full text-left border-collapse mb-8">
                    <thead>
                        <tr className="border-b">
                            <th className="pb-2">Type</th>
                            <th className="pb-2">Matière</th>
                            <th className="pb-2">Note</th>
                            <th className="pb-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowsByType.map(({ type, note }) => (
                            <tr key={type} className="border-b">
                                <td className="py-2">{type}</td>
                                <td className="py-2">{enseignantMatiere?.nom_matiere || note?.matiere?.nom_matiere || note?.nom_matiere || "--"}</td>
                                <td className="py-2">{note?.valeur !== null && note?.valeur !== undefined ? `${note.valeur}/20` : "--"}</td>
                                <td className="py-2 text-right">
                                    {note ? (
                                        <div className="flex justify-center gap-6 px-10">
                                            <Button className="me-2" size="small" variant="outlined" onClick={() => openEditDrawer(note)}>
                                                Modifier
                                            </Button>
                            
                                            <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(note.id)}>
                                                Supprimer
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button size="small" variant="contained" onClick={() => openCreateDrawer(semester)}>
                                            Ajouter
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
        );
    };

    return (
        <div className="p-6">
        
            <div className="flex items-center justify-between mb-6 gap-4 w-full">
             {/* Le ml-auto est ici suffisant avec justify-between sur le parent */}
        <div className="flex-shrink-0">
            <Button
                variant="contained"
                color="primary"
                startIcon={<span aria-hidden="true">←</span>}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 120 }}
            >
                Retour
            </Button>
        </div>
        <div className="flex-1 min-w-0 text-center mb-4 sm:ml-4">
            <h1 className="text-2xl font-bold">
                {eleve?.prenom ? `${eleve.prenom} ${eleve.nom}` : "Notes de l’élève"}
            </h1>
            <p className="text-gray-600">Consultation et gestion des notes par semestre</p>
        </div>
    </div>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <>
                    {renderSemesterTable("Semestre 1")}
                    {renderSemesterTable("Semestre 2")}
                </>
            )}

            <DrawerPanel
                open={showDrawer}
                onClose={closeDrawer}
                title={drawerMode === "create" ? "Ajouter une note" : "Modifier la note"}
                subtitle={eleve ? `${eleve.prenom} ${eleve.nom}` : ""}
                headerAction={
                    <Button size="small" variant="outlined" onClick={closeDrawer}>
                        Fermer
                    </Button>
                }
            >
                <div className="flex flex-col gap-5 pt-4">
                    <div className="rounded border bg-gray-50 p-3">
                        <p className="text-sm font-semibold text-gray-700">Matière assignée</p>
                        <p className="text-sm text-gray-600">
                            {enseignantMatiere?.nom_matiere || "Chargement de la matière…"}
                        </p>
                    </div>

                    <select
                        className="border rounded p-3 mt-2"
                        value={form.type_evaluation}
                        onChange={(e) => setForm({ ...form, type_evaluation: e.target.value })}
                    >
                        <option value="Devoir 1">Devoir 1</option>
                        <option value="Devoir 2">Devoir 2</option>
                        <option value="Composition">Composition</option>
                    </select>

                    <select
                        className="border rounded p-3 mt-2"
                        value={form.periode}
                        onChange={(e) => setForm({ ...form, periode: e.target.value })}
                    >
                        <option value="Semestre 1">Semestre 1</option>
                        <option value="Semestre 2">Semestre 2</option>
                    </select>

                    <input
                        type="number"
                        className="border rounded p-3 mt-1"
                        placeholder="Note /20"
                        value={form.valeur}
                        onChange={(e) => setForm({ ...form, valeur: e.target.value })}
                    />

                    {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}

                    <div className="flex gap-8 pt-2">
                        <Button className="me-2" variant="outlined" onClick={closeDrawer}>
                            Annuler
                        </Button>
                        <Button variant="contained" onClick={handleSave}>
                            Enregistrer
                        </Button>
                    </div>
                </div>
            </DrawerPanel>
        </div>
    );
}
