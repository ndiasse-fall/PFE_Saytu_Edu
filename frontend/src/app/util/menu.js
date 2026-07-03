export const menuItems = [
    {
        section: "Administration",
        roles: ["SUPER_ADMIN", "ADMIN"],
        items: [<<<<<<<
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
                path: "/admin/users",
                icon: "bi-people-fill",
            },
            {
                label: "Professeurs",
                path: "/admin/professeurs",
                icon: "bi-person-video3",
            },
            {
                label: "Classes",
<<<<<<< HEAD
 HEAD
                path: "/admin/classes",
                icon: "bi-building",
=======
=======
>>>>>>> 6c751166716933cb0bfe9dab3da72fe65c9e4557
                icon: "bi-building",
                isDropdown: true,
                children: [
                    {
                        label: "Liste des classes",
                        path: "/admin/gestion-admin/classes",
                        icon: "bi-building",
                    },
                    {
                        label: "Matières",
                        path: "/admin/gestion-admin/matieres",
                        icon: "bi-book",
                    },
                    {
                        label: "Affectations",
                        path: "/admin/gestion-admin/affectations",
                        icon: "bi-diagram-3",
                    },
                ],
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
    {
        section: "Enseignant",
        roles: ["ENSEIGNANT"],
        items: [
            {
                label: "Gestion des notes",
                path: "/notes",
                icon: "bi-journal-text",
            },
            {
                label: "Emploi du temps",
                path: "/enseignant/emploi-du-temps",
                icon: "bi-calendar-week",
            },
        ],
    },
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
