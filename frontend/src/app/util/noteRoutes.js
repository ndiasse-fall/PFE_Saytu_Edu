export function buildClasseResultsPath(classeId) {
  if (!classeId && classeId !== 0) {
    return '/notes/resultats/classe/';
  }

  return `/notes/resultats/classe/${String(classeId)}`;
}
