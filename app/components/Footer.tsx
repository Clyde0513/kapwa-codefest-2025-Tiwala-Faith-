'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { normalizeMediaUrl } from '../../lib/supabase-media';

interface Settings {
  siteName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  footerLogoUrl?: string;
  footerInstagramUrl?: string;
  footerFacebookUrl?: string;
  footerYoutubeUrl?: string;
  footerCopyrightText?: string;
  footerCommunityText?: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
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

  const siteName = settings?.siteName || 'Filipino Apostolate of Boston';
  const address = settings?.address || 'St. Joseph Church\n790 Salem Street\nMalden, MA 02148';
  const phone = settings?.contactPhone || '';
  const email = settings?.contactEmail || '';
  const footerLogoUrl = normalizeMediaUrl(settings?.footerLogoUrl || '/images/tiwalaupdated.png');
  const instagramUrl = settings?.footerInstagramUrl || '';
  const facebookUrl = settings?.footerFacebookUrl || '';
  const youtubeUrl = settings?.footerYoutubeUrl || '';
  const copyrightText = (settings?.footerCopyrightText || `© {year} ${siteName}. All rights reserved.`)
    .replace('{year}', String(currentYear));
  const communityText = settings?.footerCommunityText || 'North Shore and South Shore Communities';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#7A0000] to-[#A01010] text-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Top Section with Logo and Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Name */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-32 h-32 relative mb-4">
              <Image
                src={footerLogoUrl}
                alt={`${siteName} Logo`}
                width={128}
                height={128}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h3 className="font-poppins font-bold text-xl text-center md:text-left">
              {siteName}
            </h3>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-poppins font-bold text-lg mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link 
                href="/#events" 
                onClick={(e) => handleNavClick(e, 'events')}
                className="block hover:text-gray-300 transition-colors cursor-pointer"
              >
                Events
              </Link>
              <Link 
                href="/#mass" 
                onClick={(e) => handleNavClick(e, 'mass')}
                className="block hover:text-gray-300 transition-colors cursor-pointer"
              >
                Mass Schedule
              </Link>
              <Link 
                href="/#leadership" 
                onClick={(e) => handleNavClick(e, 'leadership')}
                className="block hover:text-gray-300 transition-colors cursor-pointer"
              >
                Leadership
              </Link>
              <Link 
                href="/#galleries" 
                onClick={(e) => handleNavClick(e, 'galleries')}
                className="block hover:text-gray-300 transition-colors cursor-pointer"
              >
                Galleries
              </Link>
              <Link 
                href="/#resources" 
                onClick={(e) => handleNavClick(e, 'resources')}
                className="block hover:text-gray-300 transition-colors cursor-pointer"
              >
                Resources
              </Link>
            </nav>
          </div>

          {/* Contact & Social */}
          <div className="text-center md:text-left">
            <h4 className="font-poppins font-bold text-lg mb-4">Connect With Us</h4>
            <div className="space-y-3">
              <div className="text-white/90">
                <span className="font-semibold">Location:</span><br />
                {address.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < address.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              {phone && (
                <div className="text-white/90 mt-2">
                  <span className="font-semibold">Phone:</span> {phone}
                </div>
              )}
              {email && (
                <div className="text-white/90 mt-2">
                  <span className="font-semibold">Email:</span> {email}
                </div>
              )}
              
              {/* Social Media Icons */}
              <div className="flex gap-4 justify-center md:justify-start pt-4">
                {instagramUrl && (
                  <a 
                    href={instagramUrl}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6 text-[#7A0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {facebookUrl && (
                  <a 
                    href={facebookUrl}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6 text-[#7A0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {youtubeUrl && (
                  <a 
                    href={youtubeUrl}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    aria-label="YouTube"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6 text-[#7A0000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Bottom Section - Copyright */}
        <div className="text-center text-white/80">
          <p className="text-sm md:text-base">
            {copyrightText}
          </p>
          <p className="text-sm mt-2">
            {communityText}
          </p>
        </div>
      </div>
    </footer>
  );
}
