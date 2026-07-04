export function EmploiDuTempsDetails({ session, onEdit, onDelete, onClose, isAdmin }) {
  if (!session) return null

  // Format time (remove seconds if present, e.g. "08:00:00" -> "08:00")
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    return parts.slice(0, 2).join(':')
  }

  // Helper cosmétique pour afficher le jour proprement (ex: "mercredi" -> "Mercredi")
  const capitalize = (s) => {
    if (!s) return ''
    const string = String(s).trim()
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  return (
    <div className="session-details-card" style={{ padding: '8px' }}>
      <div className="details-header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <span className="badge badge-info" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', padding: '6px 12px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '20px', display: 'inline-block', marginBottom: '8px' }}>
          {session.classe?.nom_classe || 'Classe inconnue'}
        </span>
        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', color: 'var(--text-strong)', fontWeight: '600' }}>
          {/* 🛠️ CORRECTION : Utilisation de nom_matiere au lieu de nom */}
          {session.matiere?.nom_matiere || session.matiere?.nom || 'Matière inconnue'}
        </h3>
      </div>

      <div className="details-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <i className="bi bi-person-video3" style={{ fontSize: '1.2rem' }}></i>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enseignant</div>
            <strong style={{ color: 'var(--text-strong)' }}>
              {session.enseignant ? `${session.enseignant.prenom} ${session.enseignant.nom}` : 'Non assigné'}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <i className="bi bi-calendar-week" style={{ fontSize: '1.2rem' }}></i>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Jour</div>
            <strong style={{ color: 'var(--text-strong)' }}>{capitalize(session.jour)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <i className="bi bi-clock" style={{ fontSize: '1.2rem' }}></i>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Horaire</div>
            <strong style={{ color: 'var(--text-strong)' }}>
              {formatTime(session.heure_debut)} - {formatTime(session.heure_fin)}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <i className="bi bi-geo-alt" style={{ fontSize: '1.2rem' }}></i>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Salle de classe</div>
            <strong style={{ color: 'var(--text-strong)' }}>{session.salle || 'Non spécifiée'}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
        <button
          type="button"
          className="ghost-button"
          onClick={onClose}
          style={{ flex: 1, padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}
        >
          Fermer
        </button>

        {isAdmin && (
          <>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onEdit(session)}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <i className="bi bi-pencil-square"></i> Modifier
            </button>
            <button
              type="button"
              onClick={() => onDelete(session.id)}
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                backgroundColor: 'var(--danger-soft)',
                color: 'var(--danger)',
                border: '1px solid transparent',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca' }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-soft)' }}
            >
              <i className="bi bi-trash"></i> Supprimer
            </button>
          </>
        )}
      </div>
    </div>
  )
}
