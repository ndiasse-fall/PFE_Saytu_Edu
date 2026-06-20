import axios from "../../api/axios";

/**
 * =====================================================
 * LISTE DES NOTES
 * =====================================================
 */
export const getNotes = async (params = {}) => {
    const response = await axios.get("/notes", { params });
    return response.data;
};

/**
 * =====================================================
 * UNE NOTE
 * =====================================================
 */
export const getNoteById = async (id) => {
    const response = await axios.get(`/notes/${id}`);
    return response.data;
};

/**
 * =====================================================
 * AJOUTER
 * =====================================================
 */
export const createNote = async (data) => {
    const response = await axios.post("/notes", data);
    return response.data;
};

/**
 * =====================================================
 * MODIFIER
 * =====================================================
 */
export const updateNote = async (id, data) => {
    const response = await axios.put(`/notes/${id}`, data);
    return response.data;
};

/**
 * =====================================================
 * SUPPRIMER
 * =====================================================
 */
export const deleteNote = async (id) => {
    const response = await axios.delete(`/notes/${id}`);
    return response.data;
};

/**
 * =====================================================
 * RÉSULTATS D'UNE CLASSE
 * =====================================================
 */
export const getResultatsClasse = async (idClasse) => {
    const response = await axios.get(`/notes/classe/${idClasse}`);
    return response.data;
};

/**
 * =====================================================
 * RÉSULTATS D'UN ÉLÈVE
 * =====================================================
 */
export const getResultatsEleve = async (idEleve) => {
    const response = await axios.get(`/notes/eleve/${idEleve}`);
    return response.data;
};