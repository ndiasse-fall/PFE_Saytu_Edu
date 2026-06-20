export const menuItems = [
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
