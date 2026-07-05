import { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';

import { listMonEmploiDuTemps, normalizeApiResponse } from '../../../../../services/emplois-du-temps/emploiDuTempsService';

export function MonEmploiTemps() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listMonEmploiDuTemps();
      const extractedData = normalizeApiResponse(response);
      setSessions(Array.isArray(extractedData) ? extractedData : []);
    } catch (err) {
      console.error("Impossible de charger l'emploi du temps :", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const events = useMemo(() => {
    const joursMap = {
      'dimanche': 0, 'sunday': 0,
      'lundi': 1, 'monday': 1,
      'mardi': 2, 'tuesday': 2,
      'mercredi': 3, 'wednesday': 3,
      'jeudi': 4, 'thursday': 4,
      'vendredi': 5, 'friday': 5,
      'samedi': 6, 'saturday': 6
    };

    return sessions.map(session => {
      const jourNormalise = String(session.jour || '').toLowerCase().trim();
      const dayIndex = joursMap[jourNormalise] !== undefined ? joursMap[jourNormalise] : 1;
      
      // Élimine le doublon "SalleSalle"
      let salleClean = session.salle || 'N/A';
      if (salleClean.toLowerCase().startsWith('salle')) {
        salleClean = salleClean.replace(/^salle\s*/i, '');
      }

      return {
        id: String(session.id),
        title: session.matiere?.nom_matiere || session.nom_matiere || 'Cours',
        daysOfWeek: [dayIndex],
        startTime: session.heure_debut,
        endTime: session.heure_fin,
        extendedProps: {
          salle: salleClean
        }
      };
    });
  }, [sessions]);

  return (
    <div style={{ padding: "24px", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        /* 🎯 1. SUPPRIME LES TEXTES DOUBLÉS (ex: lundilundi, 08:0008:00) */
        .fc .fc-col-header-cell-cushion,
        .fc .fc-timegrid-slot-label-cushion {
          display: inline-block !important;
          padding: 6px 4px !important;
          color: #374151 !important;
          text-decoration: none !important;
          text-transform: capitalize;
        }
        
        .fc .fc-col-header-cell .fc-scrollgrid-sync-inner a + a,
        .fc-timegrid-slot-label-cushion .fc-visually-hidden,
        .fc-col-header-cell-cushion .fc-visually-hidden {
          display: none !important;
        }

        /* 🚀 2. AUGMENTE LA HAUTEUR DES LIGNES PAR HEURE */
        .fc .fc-timegrid-slot,
        .fc .fc-timegrid-slot-lane,
        .fc .fc-timegrid-time-slot {
          height: 140px !important;
        }

        /* ⚡ 3. FORCE LE CONTENEUR INTERNE À S'ADAPTER AU TEXTE */
        .fc .fc-timegrid-event-harness {
          height: max-content !important;
          min-height: 100px !important;
          margin: 2px 4px !important;
        }

        /* 🎨 4. BLOC DE COULEUR ENGLOBANT ENTIÈREMENT LE TEXTE */
        .fc .fc-timegrid-event,
        .fc-v-event {
          background-color: #e0ebff !important;
          border: none !important;
          border-left: 10px solid #2563eb !important; /* Grosse bande bleue à gauche */
          border-radius: 8px !important;
          padding: 14px 12px !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05) !important;
          
          height: 100% !important;
          min-height: max-content !important;
          overflow: visible !important;
          display: block !important;
        }

        .fc .fc-timegrid-event:hover {
          background-color: #dbeafe !important;
        }

        .fc .fc-event-main {
          padding: 0 !important;
          color: #1e40af !important;
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
        }

        .calendar-custom-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fc-event-title {
          font-weight: 700 !important;
          font-size: 1.15rem !important;
          color: #1e3a8a !important;
          white-space: normal !important;
          margin-bottom: 2px;
        }

        .calendar-custom-details {
          font-size: 0.92rem !important;
          color: #4b5563 !important;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-weight: 500;
        }

        .calendar-custom-details span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f3f4f6 !important;
        }

        .fc-col-header-cell {
          background-color: #f9fafb !important;
          padding: 6px 0 !important;
        }
      `}</style>

      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#1e293b", margin: 0 }}>
          Mon emploi du temps
        </h2>
        <p style={{ color: "#64748b", marginTop: "4px" }}>
          Consultez votre planning de cours pour la semaine.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Chargement du calendrier...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Aucun cours programmé pour vous cette semaine.
        </div>
      ) : (
        <div style={{ marginTop: "24px", backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            locale={frLocale}
            headerToolbar={false}
            weekends={false}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
            slotDuration="01:00:00"
            snapDuration="00:30:00"
            contentHeight="auto"
            events={events}
            
            /* ⚡ FORCE L'ÉTIREMENT ET LA HAUTEUR DES LIGNES */
            slotMinHeight={140}
            expandRows={true}
            
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
            dayHeaderFormat={{ weekday: 'long' }}

            eventContent={(eventInfo) => {
              return (
                <div className="calendar-custom-card">
                  <div className="fc-event-title">{eventInfo.event.title}</div>
                  <div className="calendar-custom-details">
                    <span>{eventInfo.timeText || ''}</span>
                    {eventInfo.event.extendedProps.salle && (
                      <span>
                        <i className="bi bi-geo-alt"></i>
                        Salle {eventInfo.event.extendedProps.salle}
                      </span>
                    )}
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

export default MonEmploiTemps;
