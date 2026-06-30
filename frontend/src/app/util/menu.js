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
                path: "/admin/gestion-admin/eleves",
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
                label: "Gestion des notes",
                path: "/notes",
                icon: "bi-journal-text",
            },

            {
                label: "Bulletin",
                path: "/admin/bulletins",
                icon: "bi-file-earmark-text",
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
    /* ================= ENSEIGNANT ================= */
    {
        section: "Espace utilisateur",
        roles: ["ENSEIGNANT", "ELEVE"],
        items: [
            {
                label: "Gestion des notes",
                path: "/notes",
                icon: "bi-journal-text",
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
