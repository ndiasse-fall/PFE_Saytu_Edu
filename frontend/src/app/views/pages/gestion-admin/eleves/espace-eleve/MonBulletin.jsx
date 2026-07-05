import { useEffect, useState } from "react";
import { getMonBulletin } from "../../../../../services/bulletins/bulletinService";
import { BulletinReport } from "../../bulletins/BulletinReport";

export default function MonBulletin() {
  const [bulletin, setBulletin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBulletin() {
      setLoading(true);
      setError("");

      try {
        const response = await getMonBulletin();
        if (mounted) setBulletin(response?.data ?? response);
      } catch (err) {
        if (mounted) setError("Impossible de charger le bulletin.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadBulletin();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="screen-state">Chargement...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!bulletin) {
    return <div className="screen-state">Aucun bulletin disponible.</div>;
  }

  return <BulletinReport bulletin={bulletin} />;
}
