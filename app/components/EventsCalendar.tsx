"use client";

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatEasternDateTime } from '../../lib/time';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from the API
  const fetchEvents = async () => {
    try {
      const start = new Date();
      start.setMonth(start.getMonth() - 1); // Show events from last month
      const end = new Date();
      end.setMonth(end.getMonth() + 12); // To next year

      const response = await fetch(
        `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();

        // Accept either an array response or an object with `events` array
        const eventsArray = Array.isArray(data) ? data : data?.events;

        if (!Array.isArray(eventsArray)) {
          console.warn('Unexpected events response; expected array but got:', data);
          setEvents([]);
        } else {
          const calendarEvents: CalendarEvent[] = eventsArray.map((event: any) => ({
            id: String(event.id),
            title: event.title ?? 'Untitled Event',
            start: event.startsAt ?? event.start ?? event.starts_at ?? '',
            end: event.endsAt ?? event.end ?? event.ends_at ?? '',
            allDay: Boolean(event.allDay),
          }));
          setEvents(calendarEvents);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle event click
  const handleEventClick = async (info: any) => {
    const eventId = info.event.id;
    
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const eventData = await response.json();
        
        // Display event details
        const details = `
Title: ${eventData.title}
${eventData.description ? `Description: ${eventData.description}\n` : ''}
Start: ${formatEasternDateTime(eventData.startsAt)} ET
End: ${formatEasternDateTime(eventData.endsAt)} ET
${eventData.location ? `Location: ${eventData.location}\n` : ''}
${eventData.url ? `URL: ${eventData.url}\n` : ''}
        `.trim();
        
        alert(details);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      alert(`${info.event.title}\n${info.event.start?.toString()}`);
    }
  };

  // Handle date selection (optional - for creating events)
  const handleDateSelect = async (selection: any) => {
    const title = prompt('Event title:');
    if (title) {
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            startsAt: selection.startStr,
            endsAt: selection.endStr,
            allDay: selection.allDay,
          }),
        });

        if (response.ok) {
          await fetchEvents(); // Refresh events
          alert('Event created successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ 
          left: 'prev,next today', 
          center: 'title', 
          right: 'dayGridMonth,timeGridWeek,timeGridDay' 
        }}
        events={events}
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  );
}
