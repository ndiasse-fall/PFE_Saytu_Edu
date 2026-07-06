import { apiClient } from '../../core/api/apiClient.js';

export const listAffectations = async () => {
  const response = await apiClient('/affectations');
  return Array.isArray(response) ? response : (response?.data || []);
};

export const buildMatiereClasseAssignments = (classeIds, matiereId) => {
  if (!Array.isArray(classeIds) || classeIds.length === 0) {
    throw new Error('Veuillez sélectionner au moins une classe.');
  }

  return classeIds.map((classeId) => ({
    classe_id: Number(classeId),
    matiere_id: Number(matiereId),
  }));
};

export const affecterMatiereClasse = (classeId, matiereId) =>
  apiClient('/affectations/matiere-classe', {
    method: 'POST',
    data: {
      classe_id: classeId,
      matiere_id: matiereId,
    },
  });

export const affecterMatiereClasses = async (classeIds, matiereId) => {
  const payloads = buildMatiereClasseAssignments(classeIds, matiereId);

  await Promise.all(
    payloads.map((payload) =>
      apiClient('/affectations/matiere-classe', {
        method: 'POST',
        data: payload,
      })
    )
  );
};

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