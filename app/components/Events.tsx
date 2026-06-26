'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { normalizeMediaUrl } from '../../lib/supabase-media';
import { formatEasternMonthDay, formatEasternTime, formatEasternWeekdayDate } from '../../lib/time';

interface Settings {
  eventsTitle?: string;
  eventsSubtitle?: string;
}

interface Event {
  id: string | number;
  title: string;
  image: string;
  venue: string;
  address: string;
  cityState: string;
  date: string;
  time: string;
  displayDate: string;
  description: string;
}

interface ApiEvent {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  imageUrl?: string | null;
  allDay?: boolean;
}

const events: Event[] = [
  {
    id: 1,
    title: 'Mass',
    image: '/images/Mass.png',
    venue: 'St JOSEPH CHURCH',
    address: '790 Salem Street',
    cityState: 'Malden, MA, 02148',
    date: 'Sunday, 10/05/25',
    time: '1 PM',
    displayDate: 'October 5th',
    description: 'The Holy Mass is the central act of Catholic worship, where we celebrate the Eucharist - the body and blood of Jesus Christ. During Mass, we gather as a community to hear the Word of God, offer prayers, and receive Holy Communion. The Mass is divided into two main parts: the Liturgy of the Word, where Scripture readings and the Gospel are proclaimed, and the Liturgy of the Eucharist, where bread and wine are consecrated and become the Body and Blood of Christ. Attending Mass on Sundays and Holy Days of Obligation is one of the precepts of the Catholic Church, reflecting our commitment to worship God and strengthen our faith community. Join us as we come together in prayer, worship, and fellowship to encounter Christ in the Eucharist.',
  },
  {
    id: 2,
    title: 'Grief Support Group',
    image: '/images/Grief_Support_Group.png',
    venue: 'St JOSEPH CHURCH',
    address: '790 Salem Street',
    cityState: 'Malden, MA, 02148',
    date: 'Monday, 10/07/25',
    time: '6-7 PM',
    displayDate: 'October 7th',
    description: 'Our Grief Support Group provides a compassionate and faith-filled environment for those who are mourning the loss of a loved one. Rooted in Catholic teachings about eternal life and resurrection, this ministry offers comfort through shared prayer, Scripture reflection, and mutual support. The Church teaches that death is not the end, but a passage to eternal life with God. In these sessions, participants find solace in knowing they are not alone in their journey of grief. We explore Catholic perspectives on suffering, hope, and the Communion of Saints - the spiritual bond between the living and the deceased. Through prayer, testimony, and fellowship, we support one another in healing while trusting in God\'s mercy and the promise of eternal life. All are welcome to join this sacred space of healing and hope.',
  },
  {
    id: 3,
    title: 'Christmas',
    image: '/images/Christmas.png',
    venue: 'St JOSEPH CHURCH',
    address: '790 Salem Street',
    cityState: 'Malden, MA, 02148',
    date: 'Monday, 12/25/25',
    time: '1 PM',
    displayDate: 'December 25th',
    description: 'Christmas celebrates the Nativity of Our Lord Jesus Christ, one of the most sacred and joyful celebrations in the Catholic Church. This holy day commemorates the Incarnation - God becoming human in the person of Jesus Christ, born of the Virgin Mary in Bethlehem. The birth of Jesus fulfills the prophecies of the Old Testament and marks the beginning of our salvation. Christmas is part of the liturgical season that begins with Advent (a time of preparation and anticipation) and continues through the Christmas season, ending with the Baptism of the Lord. During our Christmas Mass, we celebrate the profound mystery that "the Word became flesh and dwelt among us" (John 1:14). We reflect on God\'s infinite love in sending His only Son to redeem humanity. Join us as we celebrate this glorious feast with special music, prayers, and the celebration of the Eucharist, welcoming Christ into our hearts anew.',
  },
  {
    id: 4,
    title: 'Palm Sunday',
    image: '/images/Palm_Sunday.png',
    venue: 'St JOSEPH CHURCH',
    address: '790 Salem Street',
    cityState: 'Malden, MA, 02148',
    date: 'Sunday, 03/29/26',
    time: '1 PM',
    displayDate: 'March 29th',
    description: 'Palm Sunday marks the beginning of Holy Week, the most sacred time in the Catholic liturgical year. This day commemorates Jesus Christ\'s triumphant entry into Jerusalem, where crowds welcomed Him by waving palm branches and laying them on the road, shouting "Hosanna to the Son of David!" (Matthew 21:9). During our Palm Sunday celebration, we bless palm branches and process in remembrance of this event. The liturgy also includes the reading of the Passion narrative, recounting Christ\'s suffering and death, which bridges the joy of His welcome to Jerusalem with the solemnity of His sacrifice. Palm Sunday invites us to reflect on both Christ\'s kingship and His humility - He came as a king, yet rode on a donkey, showing that His kingdom is not of this world. The blessed palms we receive remind us to welcome Christ into our lives and to follow Him faithfully through both triumph and trial. Join us as we begin this holiest week of the year in prayer and devotion.',
  },
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [adminEvents, setAdminEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (response.ok) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?upcoming=true&limit=4');
        const data = await response.json();

        if (!response.ok || !Array.isArray(data.events)) {
          return;
        }

        const mappedEvents = data.events.map((event: ApiEvent) => {
          const startsAt = new Date(event.startsAt);
          const hasValidDate = !Number.isNaN(startsAt.getTime());
          const locationParts = (event.location || 'Location TBD')
            .split('\n')
            .map((part) => part.trim())
            .filter(Boolean);

          return {
            id: event.id,
            title: event.title,
            image: normalizeMediaUrl(event.imageUrl || '/images/Mass.png'),
            venue: locationParts[0] || 'Location TBD',
            address: locationParts[1] || '',
            cityState: locationParts.slice(2).join(', '),
            date: hasValidDate ? formatEasternWeekdayDate(startsAt) : 'Date TBD',
            time: event.allDay || !hasValidDate
              ? 'All Day'
              : formatEasternTime(startsAt),
            displayDate: hasValidDate ? formatEasternMonthDay(startsAt) : 'Upcoming',
            description: event.description || 'More details coming soon.',
          };
        });

        setAdminEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching admin-managed events:', error);
      }
    };

    fetchEvents();
  }, []);

  // Fallback values
  const title = settings?.eventsTitle || 'EVENTS';
  const subtitle = settings?.eventsSubtitle || 'Our faith community provides many opportunities to fellowship with each other.\nHere are just a few of our upcoming events!';
  const displayEvents = adminEvents.length > 0 ? adminEvents : events;

  return (
    <section id="events" className="py-20 px-4" style={{ backgroundColor: '#faecc8' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-poppins font-bold text-gray-900 text-center mb-4">
          {title}
        </h2>
        
        <p className="text-center text-gray-900 text-lg mb-12 max-w-3xl mx-auto font-bold">
          {subtitle.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              {index < subtitle.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {displayEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Event Image */}
              <div className="relative w-full h-64 bg-gray-200">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Event Details */}
              <div className="p-6 bg-white">
                <h3 className="text-2xl font-poppins font-bold text-black mb-4">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-black">
                  <p className="font-semibold text-lg">{event.venue}</p>
                  <p className="text-base">{event.address}</p>
                  <p className="text-base">{event.cityState}</p>
                  
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <p className="font-semibold text-base">
                      {event.date} @ {event.time}
                    </p>
                    <p className="text-lg font-bold text-red-600 mt-2">
                      {event.displayDate}
                    </p>
                  </div>
                </div>
                
                <button className="mt-4 text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  Click to learn more about this event →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className=" top-0 bg-gradient-to-r from-[#7A0000] to-[#A01010] text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-3xl font-poppins font-bold mb-2">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-lg opacity-90">
                    {selectedEvent.displayDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:text-gray-200 text-4xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              {/* Event Image */}
              <div className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Event Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-900">Event Details:</h4>
                <div className="space-y-1 text-gray-800">
                  <p><span className="font-semibold">Location:</span> {selectedEvent.venue}</p>
                  <p><span className="font-semibold">Address:</span> {selectedEvent.address}, {selectedEvent.cityState}</p>
                  <p><span className="font-semibold">Date & Time:</span> {selectedEvent.date} @ {selectedEvent.time}</p>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <h4 className="font-bold text-xl mb-3 text-gray-900">About this Celebration:</h4>
                <p className="text-gray-700 leading-relaxed text-base">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-gradient-to-r from-[#7A0000] to-[#A01010] hover:from-[#8A0000] hover:to-[#B01010] text-white font-bold px-8 py-3 rounded-full transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
