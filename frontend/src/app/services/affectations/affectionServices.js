import { apiClient } from '../../core/api/apiClient';

export const listAffectations = async () => {
  const response = await apiClient('/affectations');
  return Array.isArray(response) ? response : (response?.data || []);
};

export const affecterMatiereClasse = (classeId, matiereId) =>
  apiClient('/affectations/matiere-classe', {
    method: 'POST',
    data: {
      classe_id: classeId,
      matiere_id: matiereId,
    },
  });

export const deleteAffectation = async (compositeId) => {
  if (!compositeId) {
    throw new Error("L'identifiant fourni est vide ou invalide.");
  }

  const idStr = compositeId.toString();

  // Envoi final au backend Laravel
  // Le backend attend l'ID composite complet (ex: "cm-2-5") pour fonctionner.
  // L'ancien code extrayait à tort une partie de l'ID, ce qui causait l'échec
  // de la suppression.
  const response = await apiClient(`/affectations/${idStr}`, {
    method: 'DELETE',
  });
  
  return response;
};

export const affecterEnseignantMatiere = (enseignantId, matiereId) =>
  apiClient('/affectations/enseignant-matiere', {
    method: 'POST',
    data: {
      enseignant_id: enseignantId,
      matiere_id: matiereId
    }
  });