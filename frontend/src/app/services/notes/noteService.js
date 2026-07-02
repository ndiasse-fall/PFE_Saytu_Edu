import { apiClient } from "../../core/api/apiClient";

export const getNotes = (params = {}) => {
    return apiClient("/notes", {
        method: "GET",
        params,
    });
};

export const getNoteById = (id) => {
    return apiClient(`/notes/${id}`, {
        method: "GET",
    });
};

export const createNote = async (data) => {
    try {
        return await apiClient("/notes/saisir", {
            method: "POST",
            data,
        });
    } catch (error) {
        if (error?.status === 404 || error?.status === 405) {
            return apiClient("/notes", {
                method: "POST",
                data,
            });
        }

        throw error;
    }
};

export const updateNote = (id, data) => {
    return apiClient(`/notes/${id}`, {
        method: "PUT",
        data,
    });
};

export const deleteNote = (id) => {
    return apiClient(`/notes/${id}`, {
        method: "DELETE",
    });
};

export const getResultatsParClasse = (classeId, params = {}) => {
    return apiClient(`/notes/resultats/classe/${classeId}`, {
        method: "GET",
        params,
    });
};

export const getResultatsParEleve = (eleveId, params = {}) => {
    return apiClient(`/notes/resultats/eleve/${eleveId}`, {
        method: "GET",
        params,
    });
};
