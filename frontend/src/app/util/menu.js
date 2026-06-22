export const menuItems = [
    /* ================= ADMIN ================= */
    {
        section: "Administration",
        roles: ["SUPER_ADMIN", "ADMIN"],
        items: [
            {
                label: "Dashboard",
                path: "/admin/dashboard",
                icon: "bi-grid-1x2-fill",
            },
            {
                label: "Élèves",
                path: "/admin/eleves",
                icon: "bi-mortarboard-fill",
            },
            {
                label: "Utilisateurs",
                path: "/admin/gestion-admin/users",
                icon: "bi-people-fill",
            },
            {
                label: "Professeurs",
                path: "/admin/professeurs",
                icon: "bi-person-video3",
            },
            {
                label: "Classes",
                path: "/admin/classes",
                icon: "bi-building",
            },
            {
                label: "Emploi du temps",
                path: "/admin/emploi-du-temps",
                icon: "bi-calendar-week",
            },
            {
                label: "Bulletin",
                path: "/admin/bulletins",
                icon: "bi-file-earmark-text",
            },
        ],
    },

    /* ================= NOTES ================= */
    {
        section: "Notes & Évaluations",
        roles: ["ENSEIGNANT", "ADMIN", "SUPER_ADMIN"],
        items: [
            {
                label: "Liste des notes",
                path: "/notes",
                icon: "bi-journal-text",
            },
            {
                label: "Ajouter note",
                path: "/notes/create",
                icon: "bi-plus-circle",
            },
            {
                label: "Résultats classe",
                path: "/notes/resultats/classe",
                icon: "bi-bar-chart",
            },
            {
                label: "Résultats élève",
                path: "/notes/resultats/eleve",
                icon: "bi-person-badge",
            },
        ],
    },

    /* ================= USER ================= */
    {
        section: "Espace utilisateur",
        roles: ["ENSEIGNANT", "ELEVE"],
        items: [
            {
                label: "Dashboard",
                path: "/user/dashboard",
                icon: "bi-house-door-fill",
            },
        ],
    },

    /* ================= ELEVE ================= */
    {
        section: "Élève",
        roles: ["ELEVE"],
        items: [
            {
                label: "Emploi du temps",
                path: "/eleve/emploi-du-temps",
                icon: "bi-calendar-week",
            },
            {
                label: "Bulletin",
                path: "/eleve/bulletin",
                icon: "bi-file-earmark-text",
            },
        ],
    },
];