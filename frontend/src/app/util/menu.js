export const menuItems = [
  {
    section: 'Menu',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-grid-1x2-fill' },
      { label: 'Élèves', path: '/admin/eleves', icon: 'bi-mortarboard-fill' },
      { label: 'Professeurs', path: '/admin/professeurs', icon: 'bi-person-video3' },
      { label: 'Classes', path: '/admin/classes', icon: 'bi-building' },
      { label: 'Emploi du temps', path: '/admin/emploi-du-temps', icon: 'bi-calendar-week' },
      { label: 'Bulletin', path: '/admin/bulletins', icon: 'bi-file-earmark-text' },
    ],
  },
  {
    section: 'Menu',
    roles: ['ENSEIGNANT'],
    items: [
      { label: 'Dashboard', path: '/enseignant/dashboard', icon: 'bi-grid-1x2-fill' },
      { label: 'Élèves', path: '/enseignant/eleves', icon: 'bi-mortarboard-fill' },
      { label: 'Classes', path: '/enseignant/classes', icon: 'bi-building' },
      { label: 'Emploi du temps', path: '/enseignant/emploi-du-temps', icon: 'bi-calendar-week' },
      { label: 'Bulletin', path: '/enseignant/bulletins', icon: 'bi-file-earmark-text' },
    ],
  },
  {
    section: 'Menu',
    roles: ['ELEVE'],
    items: [
      { label: 'Dashboard', path: '/eleve/dashboard', icon: 'bi-grid-1x2-fill' },
      { label: 'Emploi du temps', path: '/eleve/emploi-du-temps', icon: 'bi-calendar-week' },
      { label: 'Bulletin', path: '/eleve/bulletin', icon: 'bi-file-earmark-text' },
    ],
  },
]
