import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function MonEmploiTemps() {
  const events = [
    {
      title: "Mathématiques",
      start: "2026-06-22T08:00:00",
      end: "2026-06-22T10:00:00",
    },
    {
      title: "Physique",
      start: "2026-06-23T10:00:00",
      end: "2026-06-23T12:00:00",
    },
  ];

  return (
    <div>
      <h2>Mon Emploi du Temps</h2>

      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
        ]}
        initialView="timeGridWeek"
        events={events}
      />
    </div>
  );
}