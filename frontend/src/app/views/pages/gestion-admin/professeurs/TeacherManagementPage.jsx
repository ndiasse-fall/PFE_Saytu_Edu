import { useState, useEffect } from "react";
import { CrudManagementPage } from "../../../../shared/components/crud";
import {
    createTeacher,
    deleteTeacher,
    listTeachers,
    showTeacher,
    toggleTeacherActive,
    updateTeacher,
    listMatieres,
} from "../../../../services/professeurs/teacherService";
import { listClasses } from "../../../../services/classes/ClasseServices";
import { AssignClassesDrawer } from "./AssignClassesDrawer";

const service = {
    list: listTeachers,
    show: showTeacher,
    create: createTeacher,
    update: updateTeacher,
    remove: deleteTeacher,
    toggle: toggleTeacherActive,
    listMatieres: listMatieres,
};

export function TeacherManagementPage() {
    const [assignTeacher, setAssignTeacher] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [classesOptions, setClassesOptions] = useState([]);

    // 1. Création d'un état pour stocker la liste des matières formatées
    const [matieresOptions, setMatieresOptions] = useState([]);

    // 2. Chargement asynchrone des matières au chargement du composant
    useEffect(() => {
        async function fetchOptions() {
            try {
                const [matieresResponse, classesResponse] = await Promise.all([
                    listMatieres(),
                    listClasses(),
                ]);
                const data = matieresResponse?.data ?? matieresResponse ?? [];
                const classesData = classesResponse?.data ?? classesResponse ?? [];

                const formatted = data.map((matiere) => ({
                    value: matiere.nom_matiere,
                    label: matiere.nom_matiere,
                }));

                setMatieresOptions(formatted);
                setClassesOptions(
                    classesData.map((classe) => ({
                        value: classe.id,
                        label: `${classe.nom_classe} - ${classe.niveau}`,
                    })),
                );
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération des matières :",
                    error,
                );
            }
        }
        fetchOptions();
    }, []);

    const config = {
        title: "Gestion des professeurs",
        singularLabel: "Professeur",
        pluralLabel: "Liste des professeurs",
        initialFilters: {
            search: "",
            actif: "",
            page: 1,
            per_page: 15,
        },
        filterFields: [
            {
                name: "search",
                label: "Recherche",
                placeholder: "Nom, prénom, email ou téléphone...",
            },
            {
                name: "actif",
                label: "Statut",
                type: "select",
                options: [
                    { value: "", label: "Tous" },
                    { value: "1", label: "Actifs" },
                    { value: "0", label: "Inactifs" },
                ],
            },
        ],
            fields: [
                { name: "nom", label: "Nom", required: true },
                { name: "prenom", label: "Prénom", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                {
                    name: "specialite",
                    label: "Spécialité",
                    required: true,
                    type: "select",
                    placeholder: "Sélectionnez une spécialité...",
                    options: matieresOptions, // 3. On utilise ici l'état local dynamique
                },
                {
                    name: "classe_ids",
                    label: "Classes attribuées",
                    type: "multiselect",
                    options: classesOptions,
                    required: true,
                    defaultValue: [],
                    fromItem: (item) => (item.enseignantClasses ?? item.classes ?? []).map((classe) => String(classe.id)),
                },
                {
                    name: "matiere_ids",
                    label: "Matières enseignées",
                    type: "multiselect",
                    options: matieresOptions,
                    defaultValue: [],
                    fromItem: (item) => (item.matieres ?? []).map((matiere) => String(matiere.id)),
                },
                {
                    name: "date_embauche",
                    label: "Date embauche",
                type: "date",
                required: true,
            },
            { name: "telephone", label: "Téléphone" },
            {
                name: "adresse",
                label: "Adresse",
                type: "textarea",
                fullWidth: true,
            },
            {
                name: "actif",
                label: "Actif",
                type: "checkbox",
                defaultValue: true,
            },
        ],
        columns: [
            { key: "matricule_enseignant", label: "Matricule" },
            { key: "prenom", label: "Prénom" },
            { key: "nom", label: "Nom" },
                { key: "email", label: "Email" },
                { key: "specialite", label: "Spécialité" },
                {
                    key: "enseignantClasses",
                    label: "Classes",
                    render: (value) => (value?.length ? value.map((classe) => classe.nom_classe).join(", ") : "Aucune"),
                },
                {
                    key: "matieres",
                    label: "Matières",
                    render: (value) => (value?.length ? value.map((matiere) => matiere.nom_matiere).join(", ") : "Aucune"),
                },
                {
                    key: "actif",
                    label: "Statut",
                render: (value) => (value ? "Actif" : "Inactif"),
            },
        ],
        extraActions: (item) => [
            {
                label: "Attribuer classes",
                onClick: () => setAssignTeacher(item),
            },
        ],
    };

    return (
        <>
            <CrudManagementPage
                key={refreshKey}
                config={config}
                service={service}
                permissions={{
                    create: true,
                    show: true,
                    edit: true,
                    delete: true,
                }}
            />

            <AssignClassesDrawer
                teacher={assignTeacher}
                open={Boolean(assignTeacher)}
                onClose={() => setAssignTeacher(null)}
                onSuccess={() => setRefreshKey((key) => key + 1)}
            />
        </>
    );
}

export default TeacherManagementPage;
