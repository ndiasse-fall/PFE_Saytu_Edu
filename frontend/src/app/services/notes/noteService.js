import { apiClient } from "../../core/api/apiClient";
    
    /**
     * LISTE DES NOTES
     */
    export const getNotes = (params = {}) => {
        return apiClient("/notes", {
            method: "GET",
            params,
        });
    };
    
    /**
     * UNE NOTE
     */
    export const getNoteById = (id) => {
        return apiClient(`/notes/${id}`, {
            method: "GET",
        });
    };
    
    /**
     * AJOUTER
     */
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
    
    /**
     * MODIFIER
     */
    export const updateNote = (id, data) => {
        return apiClient(`/notes/${id}`, {
            method: "PUT",
            data,
        });
    };
    
    /**
     * SUPPRIMER
     */
    export const deleteNote = (id) => {
        return apiClient(`/notes/${id}`, {
            method: "DELETE",
        });
    };
    
   

    