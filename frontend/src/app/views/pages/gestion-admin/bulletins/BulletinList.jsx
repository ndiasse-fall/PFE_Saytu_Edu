import React, { useEffect, useState } from "react";
import { getBulletins } from "../../../../services/bulletins/bulletinService";

export default function BulletinList() {
  const [bulletins, setBulletins] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getBulletins();
    setBulletins(data);
  };

  return (
    <div className="container">
      <h2>Liste des Bulletins</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Élève</th>
            <th>Période</th>
            <th>Moyenne</th>
          </tr>
        </thead>

        <tbody>
          {bulletins.map((item) => (
            <tr key={item.id}>
              <td>{item.eleve.nom}</td>
              <td>{item.periode.nom}</td>
              <td>{item.moyenne}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}