export const menuItems = [
<<<<<<< HEAD
  {
    section: 'MAIN',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    items: [
      { label: 'Tableau de bord', path: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
    ],
  },
 {
  section: 'Administration',
  roles: ['SUPER_ADMIN', 'ADMIN'],
  items: [
    {
      label: 'Utilisateurs',
      path: '/admin/gestion-admin/users',
      icon: 'bi-people-fill'
    },

    {
      label: 'Classes',
      path: '/admin/gestion-admin/classes',
      icon: 'bi-building'
    },

    {
      label: 'Matières',
      path: '/admin/gestion-admin/matieres',
      icon: 'bi-book-fill'
    },

    {
      label: 'Affectations',
      path: '/admin/gestion-admin/affectations',
      icon: 'bi-diagram-3-fill'
    }
  ],
},
  {
    section: 'Espace utilisateur',
    roles: ['ENSEIGNANT', 'ELEVE'],
    items: [
      { label: 'Tableau de bord', path: '/user/dashboard', icon: 'bi-house-door-fill' },
    ],
  },
]
=======
    {
        section: "Menu",
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
                label: "Professeurs",
                path: "/admin/professeurs",
                icon: "bi-person-video3",
            },
            { label: "Classes", path: "/admin/classes", icon: "bi-building" },
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
    {
        section: "Menu",
        roles: ["ENSEIGNANT"],
        items: [
            {
                label: "Utilisateurs",
                path: "/admin/gestion-admin/users",
                icon: "bi-people-fill",
            },
            {
                label: "Élèves",
                path: "/admin/gestion-admin/eleves",
                icon: "bi-mortarboard-fill",
            },
        ],
    },
    {
        section: "Menu",
        roles: ["ELEVE"],
        items: [
            {
                label: "Dashboard",
                path: "/eleve/dashboard",
                icon: "bi-grid-1x2-fill",
            },
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
>>>>>>> 1e46c9208855ad7f7d7779c433d242510331349c
