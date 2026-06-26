'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { normalizeMediaUrl, uploadToSupabaseStorage } from '../../../../../lib/supabase-media';
import { easternDateInputValue, easternDateTimeLocalValue, easternLocalInputToUtcIso } from '../../../../../lib/time';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
    location: '',
    imageUrl: '',
    allDay: false,
  });
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (response.ok) {
          const event = await response.json();
          
          setFormData({
            title: event.title,
            description: event.description || '',
            startsAt: event.allDay 
              ? easternDateInputValue(event.startsAt)
              : easternDateTimeLocalValue(event.startsAt),
            endsAt: event.allDay
              ? easternDateInputValue(event.endsAt)
              : easternDateTimeLocalValue(event.endsAt),
            location: event.location || '',
            imageUrl: event.imageUrl || '',
            allDay: event.allDay,
          });
        } else {
          alert('Failed to load event');
          router.push('/admin/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        alert('An error occurred while loading the event');
        router.push('/admin/events');
      } finally {
        setFetching(false);
      }
    }

    fetchEvent();
  }, [eventId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      if (!formData.startsAt) {
        alert('Please select a start date and time');
        setLoading(false);
        return;
      }

      // Handle date conversion based on allDay flag
      let startsAt: string;
      let endsAt: string;

      if (formData.allDay) {
        if (Number.isNaN(new Date(`${formData.startsAt}T00:00:00`).getTime())) {
          alert('Invalid start date');
          setLoading(false);
          return;
        }

        startsAt = easternLocalInputToUtcIso(formData.startsAt, 'start');
        endsAt = easternLocalInputToUtcIso(formData.startsAt, 'end');
      } else {
        // For timed events, validate both start and end times
        if (!formData.endsAt) {
          alert('Please select an end date and time');
          setLoading(false);
          return;
        }

        const startDate = new Date(easternLocalInputToUtcIso(formData.startsAt));
        const endDate = new Date(easternLocalInputToUtcIso(formData.endsAt));
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          alert('Invalid date or time');
          setLoading(false);
          return;
        }

        if (endDate <= startDate) {
          alert('End time must be after start time');
          setLoading(false);
          return;
        }
        
        startsAt = startDate.toISOString();
        endsAt = endDate.toISOString();
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startsAt,
          endsAt,
          location: formData.location,
          imageUrl: formData.imageUrl,
          allDay: formData.allDay,
        }),
      });

      if (response.ok) {
        router.push('/admin/events');
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.error || 'Failed to update event. Please try again.');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/events');
        router.refresh();
      } else {
        alert('Failed to delete event. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadToSupabaseStorage(file, 'image');
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
    } catch (error) {
      console.error('Error uploading event image:', error);
      alert('Failed to upload event image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7A0000] to-[#A01010] shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-white/80">
                <Link href="/admin" className="hover:text-white">Admin</Link>
                <span>›</span>
                <Link href="/admin/events" className="hover:text-white">Events</Link>
                <span>›</span>
                <span className="text-white">Edit Event</span>
              </nav>
              <h1 className="text-2xl font-bold text-white mt-2">Edit Event</h1>
            </div>
            <Link
              href="/admin/events"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Event Information</h2>
              <p className="text-gray-600 mt-1">Tell people what your event is about</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sunday Morning Service, Youth Group Meeting, Community Dinner"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what will happen at this event, who should attend, and any important details..."
                />
              </div>

              {/* Event Image */}
              <div>
                <label htmlFor="eventImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Card Image
                </label>
                <input
                  type="file"
                  id="eventImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {imageUploading && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
                {formData.imageUrl && (
                  <div className="mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={normalizeMediaUrl(formData.imageUrl)} alt="Event preview" className="h-40 w-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">When & Where</h2>
              <p className="text-gray-600 mt-1">Set the date, time, and location for your event</p>
            </div>
            <div className="p-6 space-y-6">
              {/* All Day Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allDay"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allDay" className="ml-2 text-sm text-gray-700">
                  All day event
                </label>
              </div>

              {/* Date & Time Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.allDay ? 'Event Date' : 'Start Date & Time'} *
                  </label>
                  <input
                    type={formData.allDay ? 'date' : 'datetime-local'}
                    id="startsAt"
                    name="startsAt"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {!formData.allDay && (
                  <div>
                    <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="endsAt"
                      name="endsAt"
                      value={formData.endsAt}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Main Sanctuary, Community Hall, 123 Church Street"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              Delete Event
            </button>
            <div className="flex space-x-4">
              <Link
                href="/admin/events"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-block"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.startsAt}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
