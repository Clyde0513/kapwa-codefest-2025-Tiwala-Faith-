import Link from 'next/link';
import { supabaseDb } from '../../../lib/supabase-db';
import { formatEasternDate, formatEasternTime } from '../../../lib/time';

export default async function EventsPage() {
  let events: any[] = [];
  let total = 0;

  try {
    const result = await supabaseDb.event.findMany({
      take: 50,
      orderBy: { startsAt: 'asc' },
      include: {
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });
    events = result;
    total = await supabaseDb.event.count();
  } catch (error) {
    console.error('Error fetching events:', error);
    // Continue with empty array
  }

  const upcomingEvents = events.filter(e => new Date(e.startsAt) >= new Date());
  const pastEvents = events.filter(e => new Date(e.startsAt) < new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#7A0000] to-[#A01010] shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-white/80">
                <Link href="/admin" className="hover:text-white">Admin</Link>
                <span>›</span>
                <span className="text-white">Events</span>
              </nav>
              <h1 className="text-2xl font-bold text-white mt-2">Manage Events</h1>
              <p className="text-white/90 mt-1">Create and edit your church events</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/admin"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
              >
                Back to Admin
              </Link>
              <Link
                href="/admin/events/new"
                className="bg-white text-red-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                New Event
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Events Overview</h2>
              <p className="text-gray-600">Total events: {total}</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Upcoming: {upcomingEvents.length}
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                Past: {pastEvents.length}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingEvents.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-600 mb-4">Create your first event to get started</p>
                <Link
                  href="/admin/events/new"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create First Event
                </Link>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                        {event.allDay && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            All Day
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {event.description.length > 150 
                            ? `${event.description.substring(0, 150)}...` 
                            : event.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          📅 {formatEasternDate(event.startsAt)} at {event.allDay ? 'All Day' : formatEasternTime(event.startsAt)} ET
                        </span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <span>📍 {event.location}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          Created by {event.createdBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Past Events</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pastEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                        {event.allDay && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            All Day
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {event.description.length > 150 
                            ? `${event.description.substring(0, 150)}...` 
                            : event.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          📅 {formatEasternDate(event.startsAt)} at {event.allDay ? 'All Day' : formatEasternTime(event.startsAt)} ET
                        </span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <span>📍 {event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


