import React from 'react';

function EmploiDuTemps() {
  // Exemple de données pour l'affichage
  const planning = [
    { id: 1, heure: "08:00 - 10:00", matiere: "Mathématiques", prof: "M. Diop" },
    { id: 2, heure: "10:15 - 12:15", matiere: "Histoire-Géographie", prof: "Mme. Fall" },
    { id: 3, heure: "14:00 - 16:00", matiere: "Informatique", prof: "M. Ndiaye" }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#333' }}>Mon Emploi du Temps</h2>
      <p style={{ color: '#666' }}>Consultez vos cours de la journée.</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>Heure</th>
            <th style={{ padding: '12px' }}>Matière</th>
            <th style={{ padding: '12px' }}>Professeur</th>
          </tr>
        </thead>
        <tbody>
          {/* L'utilisation de p.id ici corrige aussi le Warning sur les clés dupliquées vu sur l'image */}
          {planning.map((cours) => (
            <tr key={cours.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}>{cours.heure}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{cours.matiere}</td>
              <td style={{ padding: '12px' }}>{cours.prof}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ATTENTION : Cette ligne tout en bas est OBLIGATOIRE pour enlever l'erreur "Element type is invalid"
export default EmploiDuTemps;