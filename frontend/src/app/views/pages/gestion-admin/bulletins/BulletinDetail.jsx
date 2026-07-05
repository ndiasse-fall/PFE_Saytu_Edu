import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBulletinById } from "../../../../services/bulletins/bulletinService";
import { BulletinReport } from "./BulletinReport";

export default function BulletinDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bulletin, setBulletin] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBulletin() {
      setLoading(true);
      setError("");

      try {
        const response = await getBulletinById(id);
        if (mounted) setBulletin(response?.data ?? response);
      } catch (err) {
        if (mounted) setError(err.message || "Impossible de charger le bulletin.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadBulletin();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="screen-state">Chargement du bulletin...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!bulletin) {
    return <div className="screen-state">Aucun bulletin disponible.</div>;
  }

  return (
    <BulletinReport
      bulletin={bulletin}
      onBack={() => navigate("/admin/bulletins")}
      backLabel="Retour"
    />
  );
}
