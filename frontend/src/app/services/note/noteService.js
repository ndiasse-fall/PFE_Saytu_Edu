import { apiClient } from '../../core/api/apiClient';

/**
 * LISTE DES NOTES
 */
export const getNotes = (params = {}) => {
  return apiClient('/notes', {
    method: 'GET',
    params,
  });
};

/**
 * UNE NOTE
 */
export const getNoteById = (id) => {
  return apiClient(`/notes/${id}`, {
    method: 'GET',
  });
};

/**
 * AJOUTER
 */
export const createNote = (data) => {
  return apiClient('/notes', {
    method: 'POST',
    data,
  });
};

/**
 * MODIFIER
 */
export const updateNote = (id, data) => {
  return apiClient(`/notes/${id}`, {
    method: 'PUT',
    data,
  });
};

/**
 * SUPPRIMER
 */
export const deleteNote = (id) => {
  return apiClient(`/notes/${id}`, {
    method: 'DELETE',
  });
};

/**
 * RÉSULTATS CLASSE
 */
export const getResultatsClasse = (idClasse) => {
  return apiClient(`/notes/resultats/classe/${idClasse}`, {
    method: 'GET',
  });
};

/**
 * RÉSULTATS ÉLÈVE
 */
export const getResultatsEleve = (idEleve) => {
  return apiClient(`/notes/resultats/eleve/${idEleve}`, {
    method: 'GET',
  });
};