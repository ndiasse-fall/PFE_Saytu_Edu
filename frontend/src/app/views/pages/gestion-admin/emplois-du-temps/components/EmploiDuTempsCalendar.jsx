import React from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

export function EmploiDuTempsCalendar({
  sessions = [],
  filters = {},
  classes = [],
  teachers = [],
  matieres = [],
  niveauxDisponibles = [],
  onFilterChange,
  onClearFilters,
  onShow,
  isAdmin,
  onSelectSlot,
  user
}) {

  // Transformation sécurisée des sessions en événements FullCalendar
  const events = (Array.isArray(sessions) ? sessions : []).map(session => {
    if (!session) return null;
    
    // 🛠️ CORRECTION : Normalisation en minuscules pour correspondre à la bdd
    const jourNormalise = session.jour ? String(session.jour).toLowerCase().trim() : '';
    
    return {
      id: session.id,
      title: session.matiere?.nom_matiere || 'Cours',
      daysOfWeek: [
        jourNormalise === 'dimanche' ? 0 :
        jourNormalise === 'lundi' ? 1 :
        jourNormalise === 'mardi' ? 2 :
        jourNormalise === 'mercredi' ? 3 :
        jourNormalise === 'jeudi' ? 4 :
        jourNormalise === 'vendredi' ? 5 : 6
      ],
      startTime: session.heure_debut,
      endTime: session.heure_fin,
      extendedProps: {
        classe: session.classe?.nom_classe || 'N/A',
        // 🛠️ CORRECTION : Utilisation de prenom et nom à la place de name
        enseignant: session.enseignant ? `${session.enseignant.prenom} ${session.enseignant.nom}` : 'N/A',
        salle: session.salle || 'N/A',
        sessionOriginale: session
      }
    };
  }).filter(Boolean);

  return (
    <div className="calendar-container" style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      
      <style>{`
        /* ✨ CORRECTIF POUR LES EN-TÊTES DOUBLÉS ET MAL FORMATÉS */
        .fc .fc-col-header-cell-cushion {
          display: inline-block !important;
          padding: 4px 2px !important;
          color: #374151 !important;
          text-decoration: none !important;
        }
        
        /* Masquer le texte d'accessibilité dupliqué si présent */
        .fc .fc-col-header-cell .fc-scrollgrid-sync-inner a + a,
        .fc-col-header-cell-cushion .fc-visually-hidden {
          display: none !important;
        }

        /* 🎯 AUGMENTER L'ESPACE DES LIGNES PAR HEURE (8h, 9h...) */
        .fc .fc-timegrid-slot {
          height: 120px !important; /* Modifiez cette valeur (ex: 100px, 140px) pour ajuster l'espace vertical par heure */
        }

        .fc .fc-timegrid-event-harness, 
        .fc-timegrid-event-harness {
          margin: 4px 4px !important;
          max-width: 95% !important;
          z-index: 5 !important;
        }

        /* COULEUR DE FOND ET BANDES */
        .fc .fc-timegrid-event,
        .fc-v-event,
        .fc-timegrid-event {
          background-color: #e0ebff !important;
          border: none !important;
          border-left: 12px solid #2563eb !important;
          border-radius: 8px !important;
          padding: 12px 10px !important; 
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
          
          height: auto !important; 
          min-height: max-content !important; 
          overflow: visible !important;
        }

        .fc .fc-timegrid-event:hover,
        .fc-v-event:hover {
          background-color: #d1e2ff !important;
          transform: translateY(-1px);
        }

        .fc .fc-event-main,
        .fc-event-main {
          padding: 0 !important;
          color: #1e40af !important;
          display: flex !important;
          flex-direction: column !important;
          height: auto !important;
          overflow: visible !important;
        }

        .calendar-custom-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          height: auto;
        }

        .fc-event-title {
          font-weight: 700 !important;
          font-size: 1rem !important;
          margin-bottom: 4px !important;
          color: #1e3a8a !important;
          white-space: normal !important;
        }

        .calendar-custom-details {
          font-size: 0.82rem !important;
          color: #374151 !important;
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-weight: 500;
        }

        .calendar-custom-details span {
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #e5e7eb !important;
        }
        .fc-col-header-cell {
          background-color: #f9fafb !important;
          padding: 8px 0 !important;
        }
      `}</style>

      {/* BARRE DE FILTRES SECURISEE */}
      <div className="filter-toolbar" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        
        {/* FILTRE : NIVEAU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>NIVEAU</label>
          <select name="niveau" value={filters?.niveau || ''} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Tous les niveaux</option>
            {(Array.isArray(niveauxDisponibles) ? niveauxDisponibles : []).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* FILTRE : CLASSE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>CLASSE</label>
          <select name="id_classe" value={filters?.id_classe || ''} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Toutes les classes</option>
            {(Array.isArray(classes) ? classes : []).map(c => (
              <option key={c?.id} value={c?.id}>{c?.nom_classe}</option>
            ))}
          </select>
        </div>

        {/* FILTRE : MATIÈRE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>MATIÈRE</label>
          <select name="id_matiere" value={filters?.id_matiere || ''} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Toutes les matières</option>
            {(Array.isArray(matieres) ? matieres : []).map(m => (
              <option key={m?.id} value={m?.id}>{m?.nom_matiere}</option>
            ))}
          </select>
        </div>

        {/* FILTRE : JOUR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '150px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}>JOUR</label>
          <select name="jour" value={filters?.jour ? String(filters.jour).toLowerCase() : ''} onChange={onFilterChange} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
            <option value="">Tous les jours</option>
            {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'].map(j => (
              <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="button" onClick={onClearFilters} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--primary, #3b82f6)', color: '#ffffff', cursor: 'pointer', height: '38px' }}>
            Réinitialiser
          </button>
        </div>
      </div>

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
        selectable={!!isAdmin}
        
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
        
        dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
        
        eventClick={(info) => {
          if (onShow && info.event.extendedProps.sessionOriginale) {
            onShow(info.event.extendedProps.sessionOriginale);
          }
        }}

        select={(info) => {
          if (!isAdmin || !onSelectSlot) return;
          const joursSemaine = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
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
                <span><i className="bi bi-building" style={{ marginRight: '6px' }}></i>{eventInfo.event.extendedProps.classe}</span>
                <span><i className="bi bi-person" style={{ marginRight: '6px' }}></i>{eventInfo.event.extendedProps.enseignant}</span>
                {eventInfo.event.extendedProps.salle && (
                  <span><i className="bi bi-geo-alt" style={{ marginRight: '6px' }}></i>{eventInfo.event.extendedProps.salle}</span>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}