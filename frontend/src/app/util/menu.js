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
      { label: 'Utilisateurs', path: '/admin/gestion-admin/users', icon: 'bi-people-fill' },
    ],
  },

  {
    section: 'Espace utilisateur',
    roles: ['ENSEIGNANT', 'ELEVE'],
    items: [
      { label: 'Tableau de bord', path: '/user/dashboard', icon: 'bi-house-door-fill' },
    ],
  },

  {
    section: 'Notes & Évaluations',
    roles: ['ENSEIGNANT', 'ADMIN', 'SUPER_ADMIN'],
    items: [
      { label: 'Liste des notes', path: '/notes', icon: 'bi-journal-text' },
      { label: 'Ajouter note', path: '/notes/create', icon: 'bi-plus-circle' },
      { label: 'Résultats classe', path: '/notes/resultats/classe', icon: 'bi-bar-chart' },
      { label: 'Résultats élève', path: '/notes/resultats/eleve', icon: 'bi-person-badge' },
    ],
  },
];