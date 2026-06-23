import api from '../../core/api'

export const listAffectations = () =>
  api.get('/affectations')

export const affecterMatiereClasse = (
  classeId,
  matiereId
) =>
  api.post('/affectations/matiere-classe', {
    classe_id: classeId,
    matiere_id: matiereId
  })

export const affecterEnseignantMatiere = (
  enseignantId,
  matiereId
) =>
  api.post('/affectations/enseignant-matiere', {
    enseignant_id: enseignantId,
    matiere_id: matiereId
  })