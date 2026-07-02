export function shouldShowMatiereFilter(userRole) {
  return userRole !== 'ENSEIGNANT';
}
