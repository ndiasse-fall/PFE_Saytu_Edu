import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

export function EmploiDuTempsCalendar({
  sessions,
  filters,
  classes,
  teachers,
  matieres,
  onFilterChange,
  onClearFilters,
  onShow,
  isAdmin,
  onSelectSlot,
  user
}) {

  // Transformation des sessions de la base de données au format d'événements FullCalendar
  const events = sessions.map(session => {
    return {
      id: session.id,
      title: session.matiere?.nom_matiere || 'Cours',
      daysOfWeek: [
        session.jour === 'Dimanche' ? 0 :
        session.jour === 'Lundi' ? 1 :
        session.jour === 'Mardi' ? 2 :
        session.jour === 'Mercredi' ? 3 :
        session.jour === 'Jeudi' ? 4 :
        session.jour === 'Vendredi' ? 5 : 6
      ],
      startTime: session.heure_debut,
      endTime: session.heure_fin,
      extendedProps: {
        classe: session.classe?.nom_classe || 'N/A',
        enseignant: session.enseignant?.name || 'N/A',
        salle: session.salle || 'N/A',
        sessionOriginale: session
      }
    };
  });

  return (
    <div className="calendar-container" style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      
      {/* 🌟 INJECTION CSS RENFORCÉE POUR ÉCRASER LES STYLES PAR DÉFAUT DE FULLCALENDAR 🌟 */}
      <style>{`
        /* 1. RÉDUIRE LE CADRE (Largeur & Espacement pour stopper les superpositions de la capture 32) */
        .fc .fc-timegrid-event-harness, 
        .fc-timegrid-event-harness {
          margin: 2px 6px !important;
          max-width: 85% !important; /* Force la réduction de la largeur du bloc */
        }

        /* 2. CHANGER LA COULEUR (Fond bleu pastel doux et texte lisible) */
        .fc .fc-timegrid-event,
        .fc-v-event,
        .fc-timegrid-event {
          background-color: #e0ebff !important; /* Bleu très doux */
          border: none !important;
          border-left: 5px solid #2563eb !important; /* Ligne d'accent bleue vive sur le côté gauche */
          border-radius: 6px !important;
          padding: 4px 6px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
        }

        /* Effet au survol */
        .fc .fc-timegrid-event:hover,
        .fc-v-event:hover {
          background-color: #d1e2ff !important;
          transform: translateY(-1px);
        }

        /* 3. AJUSTEMENT DU TEXTE INTERNE */
        .fc .fc-event-main,
        .fc-event-main {
          padding: 0 !important;
          color: #1e40af !important; /* Bleu foncé pour le texte */
        }

        .fc-event-title {
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          margin-bottom: 3px !important;
          color: #1e3a8a !important;
        }

        .calendar-custom-details {
          font-size: 0.75rem !important;
          color: #374151 !important;
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-weight: 500;
        }

        .calendar-custom-details span {
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Harmonisation de la grille de fond */
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #e5e7eb !important;
        }
        .fc-col-header-cell {
          background-color: #f9fafb !important;
          padding: 8px 0 !important;
        }
      `}</style>

      {/* BARRE DE FILTRES (TOOLBAR) */}
      <div className="filter-toolbar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>CLASSE</label>
          <select name="id_classe" value={filters.id_classe} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Toutes les classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom_classe}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>MATIÈRE</label>
          <select name="id_matiere" value={filters.id_matiere} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Toutes les matières</option>
            {matieres.map(m => <option key={m.id} value={m.id}>{m.nom_matiere}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>JOUR</label>
          <select name="jour" value={filters.jour} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Tous les jours</option>
            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" onClick={onClearFilters} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', height: '38px' }}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* LE COMPOSANT CALENDRIER FULLCALENDAR */}
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        headerToolbar={false}
        weekends={true}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        allDaySlot={false}
        slotDuration="01:00:00"
        snapDuration="00:30:00"
        contentHeight="auto"
        events={events}
        selectable={isAdmin}
        
        eventClick={(info) => {
          onShow(info.event.extendedProps.sessionOriginale);
        }}

        select={(info) => {
          if (!isAdmin) return;
          const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
          onSelectSlot({
            jour: joursSemaine[info.start.getDay()],
            heure_debut: info.start.toTimeString().split(' ')[0].substring(0, 5),
            heure_fin: info.end.toTimeString().split(' ')[0].substring(0, 5),
          });
        }}

        eventContent={(eventInfo) => {
          return (
            <div className="calendar-custom-card">
              <div className="fc-event-title">{eventInfo.event.title}</div>
              <div className="calendar-custom-details">
                <span><i className="bi bi-building" style={{ marginRight: '5px' }}></i>{eventInfo.event.extendedProps.classe}</span>
                <span><i className="bi bi-person" style={{ marginRight: '5px' }}></i>{eventInfo.event.extendedProps.enseignant}</span>
                {eventInfo.event.extendedProps.salle && (
                  <span><i className="bi bi-geo-alt" style={{ marginRight: '5px' }}></i>{eventInfo.event.extendedProps.salle}</span>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}