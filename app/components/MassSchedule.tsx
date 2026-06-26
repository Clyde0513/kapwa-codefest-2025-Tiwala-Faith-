'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Settings {
  massScheduleTitle?: string;
  massSchedulePeriod?: string;
  massScheduleLocation?: string;
  massScheduleAddress?: string;
  massScheduleCityState?: string;
  massScheduleAdditionalInfo?: string;
  massScheduleFooterText?: string;
  massScheduleInstagramUrl?: string;
  massScheduleFacebookUrl?: string;
}

export default function MassSchedule() {
  const [settings, setSettings] = useState<Settings | null>(null);

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

  // Fallback values
  const title = settings?.massScheduleTitle || 'Mass Schedule';
  const period = settings?.massSchedulePeriod || 'October-December 2025';
  const location = settings?.massScheduleLocation || 'The Filipino Apostolate';
  const address = settings?.massScheduleAddress || '790 Salem Street';
  const cityState = settings?.massScheduleCityState || 'Malden, MA 02148';
  const additionalInfo = settings?.massScheduleAdditionalInfo || 'For Additional Info';
  const footerText = settings?.massScheduleFooterText || 'Posted by Filipino Apostolate on 10/05/25 @ 8:00 am';
  const instagramUrl = settings?.massScheduleInstagramUrl || '';
  const facebookUrl = settings?.massScheduleFacebookUrl || '';
  return (
    <section id="mass" className="py-20 px-4" style={{ backgroundColor: '#faecc8' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-poppins font-bold text-gray-900 text-center mb-12">
          {title}
        </h2>
        
        <div className="max-w-3xl mx-auto">
          {/* Mass Schedule Card */}
          <div className="bg-gradient-to-br from-[#A85A52] to-[#8B4540] rounded-2xl shadow-2xl overflow-hidden text-white p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                {period}
              </h3>
              
              <div className="space-y-3">
                <p className="text-xl md:text-2xl font-semibold">
                  {location}
                </p>
                <p className="text-xl md:text-2xl font-semibold">
                  of the Archdiocese of Boston
                </p>
                <p className="text-xl md:text-2xl font-semibold">
                  North Shore Community
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="text-center mb-8">
              <p className="text-2xl md:text-3xl font-bold mb-2">
                {address}
              </p>
              <p className="text-2xl md:text-3xl font-bold">
                {cityState}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-white/50 my-8"></div>

            {/* Additional Info */}
            <div className="text-center mb-8">
              <p className="text-lg md:text-xl font-semibold">
                {additionalInfo}
              </p>
            </div>

            {/* Another Divider */}
            <div className="border-t-2 border-white/50 my-8"></div>

            {/* Footer with Social Icons */}
            <div className="flex items-center justify-between">
              <p className="text-sm md:text-base">
                {footerText}
              </p>
              
              {/* Social Icons */}
              <div className="flex gap-3">
                {instagramUrl && (
                  <a 
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6 text-[#A85A52]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {facebookUrl && (
                  <a 
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6 text-[#A85A52]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
