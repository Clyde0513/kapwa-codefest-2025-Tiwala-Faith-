'use client';

import { useState, useEffect } from 'react';
import { easternDateTimeLocalValue, easternLocalInputToUtcIso, formatEasternDateTime } from '../../lib/time';

interface Event {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location?: string;
  url?: string;
  createdById?: string;
  createdBy?: {
    id: string;
    name?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location: string;
  url: string;
}

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
    allDay: false,
    location: '',
    url: '',
  });

  // Fetch events from the database
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch events for the next 6 months
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 6);
      
      const response = await fetch(
        `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
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

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Start editing an event
  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setIsCreating(false);
    setFormData({
      title: event.title,
      description: event.description || '',
      startsAt: easternDateTimeLocalValue(event.startsAt),
      endsAt: easternDateTimeLocalValue(event.endsAt),
      allDay: event.allDay,
      location: event.location || '',
      url: event.url || '',
    });
  };

  // Start creating a new event
  const startCreate = () => {
    setIsCreating(true);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
      allDay: false,
      location: '',
      url: '',
    });
  };

  // Cancel editing/creating
  const cancelEdit = () => {
    setEditingEvent(null);
    setIsCreating(false);
    setFormData({
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
      allDay: false,
      location: '',
      url: '',
    });
  };

  // Save event (create or update)
  const saveEvent = async () => {
    try {
      if (isCreating) {
        // Create new event
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            startsAt: easternLocalInputToUtcIso(formData.startsAt),
            endsAt: easternLocalInputToUtcIso(formData.endsAt),
          }),
        });

        if (response.ok) {
          await fetchEvents();
          cancelEdit();
          alert('Event created successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } else if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            startsAt: easternLocalInputToUtcIso(formData.startsAt),
            endsAt: easternLocalInputToUtcIso(formData.endsAt),
          }),
        });

        if (response.ok) {
          await fetchEvents();
          cancelEdit();
          alert('Event updated successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('An error occurred while saving the event');
    }
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEvents();
        alert('Event deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('An error occurred while deleting the event');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <button
          onClick={startCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          + Create Event
        </button>
      </div>

      {/* Event Form Modal */}
      {(editingEvent || isCreating) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {isCreating ? 'Create New Event' : 'Edit Event'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="endsAt"
                    value={formData.endsAt}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allDay"
                    checked={formData.allDay}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-semibold">All Day Event</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., St. Joseph Church, 790 Salem Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">URL</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEvent}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  {isCreating ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events found. Create your first event!
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                    )}
                    <div className="mt-2 space-y-1 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold">Start:</span>{' '}
                        {formatEasternDateTime(event.startsAt)} ET
                      </p>
                      <p>
                        <span className="font-semibold">End:</span>{' '}
                        {formatEasternDateTime(event.endsAt)} ET
                      </p>
                      {event.location && (
                        <p>
                          <span className="font-semibold">Location:</span> {event.location}
                        </p>
                      )}
                      {event.allDay && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          All Day
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEdit(event)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
