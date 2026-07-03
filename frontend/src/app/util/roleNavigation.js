const dashboardPaths = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  ENSEIGNANT: '/enseignant/dashboard', 
  ELEVE: '/eleve/dashboard',           
}

export function getDashboardPath(role) {
  return dashboardPaths[role] ?? '/unauthorized'
}