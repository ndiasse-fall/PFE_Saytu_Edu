const dashboardPaths = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  ENSEIGNANT: '/enseignant/emploi-du-temps',
  ELEVE: '/eleve/emploi-du-temps',
}

export function getDashboardPath(role) {
  return dashboardPaths[role] ?? '/unauthorized'
}
