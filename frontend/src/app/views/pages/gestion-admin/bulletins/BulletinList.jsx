import React, { useEffect, useState } from "react";
import { getBulletins } from "../../../../services/bulletins/bulletinService";

export default function BulletinList() {
  const [bulletinsParClasse, setBulletinsParClasse] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getBulletins();
      const bulletins = data.data ?? data;

      // Grouper par classe
      const groupes = {};
      bulletins.forEach((b) => {
        const classe = b.classe ?? "Sans classe";
        if (!groupes[classe]) groupes[classe] = [];
        groupes[classe].push(b);
      });

      setBulletinsParClasse(groupes);
    } catch (error) {
      console.error("Erreur chargement bulletins:", error);
    }
  };

  return (
    <div className="container">
      <h2>Liste des Bulletins</h2>

      {Object.entries(bulletinsParClasse).map(([classe, bulletins]) => (
        <div key={classe} style={{ marginBottom: "30px" }}>
          <h3 style={{
            backgroundColor: "#1a3c8f",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            marginBottom: "8px"
          }}>
            {classe}
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Élève</th>
                <th>Période</th>
                <th>Moyenne</th>
              </tr>
            </thead>
            <tbody>
              {bulletins.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.eleve.nom}</td>
                  <td>{item.periode}</td>
                  <td>{item.moyenne}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}