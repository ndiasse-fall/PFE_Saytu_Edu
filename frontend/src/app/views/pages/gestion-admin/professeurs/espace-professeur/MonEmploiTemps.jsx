import { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';

import { listEmplois, normalizeApiResponse } from '../../../../../services/emplois-du-temps/emploiDuTempsService';

export function MonEmploiTemps() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listEmplois();
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
      return {
        id: String(session.id),
        title: session.matiere?.nom_matiere || session.nom_matiere || 'Cours',
        daysOfWeek: [dayIndex],
        startTime: session.heure_debut,
        endTime: session.heure_fin,
        extendedProps: {
          salle: session.salle || 'N/A'
        }
      };
    });
  }, [sessions]);

  return (
    <div style={{ padding: "24px", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        /* Styles personnalisés pour le calendrier de l'enseignant */
        .fc .fc-col-header-cell-cushion {
          display: inline-block !important;
          padding: 8px 4px !important;
          color: #1e293b !important;
          font-weight: 600 !important;
          text-decoration: none !important;
          font-size: 0.95rem !important;
        }

        .fc .fc-timegrid-event-harness {
          margin: 2px 4px !important;
        }

        .fc .fc-timegrid-event {
          background-color: #eff6ff !important;
          border: none !important;
          border-left: 4px solid #3b82f6 !important;
          border-radius: 8px !important;
          padding: 8px 10px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04) !important;
        }

        .fc .fc-timegrid-event:hover {
          background-color: #e0f2fe !important;
        }

        .fc-event-main {
          color: #1e40af !important;
        }

        .fc-event-title {
          font-weight: 700 !important;
          font-size: 0.85rem !important;
          color: #1e3a8a !important;
          margin-bottom: 4px !important;
        }

        .calendar-custom-details {
          font-size: 0.75rem !important;
          color: #475569 !important;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .calendar-custom-details span {
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #f1f5f9 !important;
        }

        .fc-col-header-cell {
          background-color: #f8fafc !important;
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
          Aucun cours assigné pour cette semaine.
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
            
            // Format des étiquettes d'heures (axe vertical)
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', omitZeroMinute: false, meridiem: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
            
            // Format d'en-tête de jour
            dayHeaderFormat={{ weekday: 'long' }}

            // Rendu de chaque bloc de cours
            eventContent={(eventInfo) => {
              return (
                <div className="calendar-custom-card">
                  <div className="fc-event-title">{eventInfo.event.title}</div>
                  <div className="calendar-custom-details">
                    <span>{eventInfo.timeText || ''}</span>
                    {eventInfo.event.extendedProps.salle && (
                      <span>
                        <i className="bi bi-geo-alt" style={{ marginRight: '5px' }}></i>
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
