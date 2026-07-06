import { apiClient } from "../../core/api/apiClient";

export const getBulletins = async () => {
  return await apiClient("/bulletins", { method: "GET" });
};

export const getBulletinById = async (id) => {
  return await apiClient(`/bulletins/${id}`, { method: "GET" });
};

export const getMonBulletin = async () => {
  return await apiClient("/mon-bulletin", { method: "GET" });
};

export const getBulletinByEleve = async (eleveId) => {
  return await apiClient(`/bulletins/eleve/${eleveId}`, { method: "GET" });
};

export const getBulletinByPeriode = async (periodeId) => {
  return await apiClient(`/bulletins/periode/${periodeId}`, { method: "GET" });
};

export const genererBulletin = async (eleveId, periodeId) => {
  return await apiClient("/bulletins/generer", {
    method: "POST",
    data: { eleveId, periodeId },
  });
};
