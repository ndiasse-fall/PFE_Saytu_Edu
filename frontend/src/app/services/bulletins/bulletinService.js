import axios from "axios";

const API_URL = "/api/bulletins";

export const getBulletins = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getBulletinById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const getBulletinByEleve = async (eleveId) => {
  const { data } = await axios.get(
    `${API_URL}/eleve/${eleveId}`
  );
  return data;
};

export const getBulletinByPeriode = async (periodeId) => {
  const { data } = await axios.get(
    `${API_URL}/periode/${periodeId}`
  );
  return data;
};

export const genererBulletin = async (eleveId, periodeId) => {
  const { data } = await axios.post(
    `${API_URL}/generer`,
    {
      eleveId,
      periodeId,
    }
  );

  return data;
};