'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { uploadToSupabaseStorage } from '../../../lib/supabase-media';

interface WebsiteSettings {
  // Basic Information
  siteName: string;
  tagline: string;
  pastorName: string;
  
  // Homepage Content
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;

  // Mission Page
  missionTitle?: string;
  missionFilipinoText?: string;
  missionEnglishText?: string;
  missionKeywordsText?: string;
  logoExplanationTitle?: string;
  logoBambooTitle?: string;
  logoBambooText?: string;
  logoSunTitle?: string;
  logoSunText?: string;
  logoHandsTitle?: string;
  logoHandsText?: string;
  logoConcept?: string;
  logoDesign?: string;
  logoNote?: string;
  logoImageUrl?: string;
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  address: string;
  serviceTimes: string;
  
  // Mass Schedule Section
  massScheduleTitle?: string;
  massSchedulePeriod?: string;
  massScheduleLocation?: string;
  massScheduleAddress?: string;
  massScheduleCityState?: string;
  massScheduleAdditionalInfo?: string;
  
  // Leadership Section
  leadershipTitle?: string;
  chaplainName?: string;
  northShoreCoordinator?: string;
  northShoreAssistantCoordinator?: string;
  northShoreSecretary?: string;
  northShoreFinanceTeam?: string;
  northShoreHeadOfLiturgy?: string;
  northShoreFaithFormation?: string;
  southShoreCoordinator?: string;
  southShoreAssistantCoordinator?: string;
  southShoreSecretary?: string;
  southShoreFinanceTeam?: string;
  southShoreHeadOfLiturgy?: string;
  southShoreFaithFormation?: string;
  financeTreasurers?: string;
  financeAuditor?: string;
  
  // Events Section
  eventsTitle?: string;
  eventsSubtitle?: string;
  
  // Resources Section
  resourcesTitle?: string;
  resourcesSubtitle?: string;
  resourceLinks?: Array<{ title: string; url: string }>;
}

// Default values that will be used if no settings are loaded
const defaultSettings: WebsiteSettings = {
    // Basic Information
    siteName: 'Filipino Apostolate of Boston',
    tagline: 'A Christian Community who guides, takes care, and nourishes the faith life of our young people, and our fellow Filipinos in the Archdiocese of Boston.',
    pastorName: 'Father Peru Dayag, SVD',
    
    // Homepage Content
    heroTitle: 'Welcome to Our Church Family',
    heroSubtitle: 'Join us in faith, fellowship, and community',
    aboutText: 'We are a welcoming community dedicated to serving God and each other. Our mission is to provide spiritual guidance and support to Filipino families in the Boston area.',

    // Mission Page
    missionTitle: 'Mission Statement of the\nFilipino Apostolate\nof the\nArchdiocese of Boston',
    missionFilipinoText: 'Kami ay isang Sambayanang Kristiyano\nna gumagabay,\nkumakalinga,\nat umaaruga\nsa aming mga kabataan at kapwa Pilipino\ndito sa Arkidiosesis ng Boston.',
    missionEnglishText: 'We are a Christian Community who guides, takes care, and nourishes the faith life of our young people, and our fellow Filipinos in the Archdiocese of Boston.',
    missionKeywordsText: 'Sambayanang Kristiyano | Christian Community\ngumagabay | to guide\nkumakalinga | to take care\numaaruga | to nourish',
    logoExplanationTitle: 'Logo Explanation',
    logoBambooTitle: 'The Bamboo Cross',
    logoBambooText: 'Represents our Christian identity as Asians. The bamboo also symbolizes strength, and flexibility even in the midst of trials, sufferings, and other adversities. As one Chinese actor expressed "Notice that the stiffest tree is most easily cracked, while the bamboo survives by bending with the wind". It symbolizes our resiliency as Filipinos.',
    logoSunTitle: 'The Sun with Eight Rays',
    logoSunText: 'Taken from our national flag, it symbolizes our diversity. The rays emanate from the center. Our diversity as Filipinos here in the Archdiocese of Boston draws its source in our Lord Jesus Christ especially in the Holy Eucharist.',
    logoHandsTitle: 'The Hands',
    logoHandsText: 'They are in the action of reaching out to each other. The action is symbolic of our desire to reach out to our kababayan in the Greater Boston Areas through our apostolate as described in the words gumagabay, kumakalinga, at umaaruga. These are the key words from our new vision-mission statement.',
    logoConcept: 'Fr. Alex Castro, AA',
    logoDesign: 'Rochie Panganiban',
    logoNote: '*The logo was adapted from the logo used by the National Assembly of Filipino Priest in the USA (NAFP-USA) for their Triennial Assembly last November 2017',
    logoImageUrl: '/images/tiwalaupdated.png',
    
    // Contact Information
    contactEmail: 'info@church.com',
    contactPhone: '(555) 123-4567',
    address: 'St. Joseph Church\n790 Salem Street\nMalden, MA 02148',
    serviceTimes: 'Sundays at 10:00 AM and 6:00 PM',
    
    // Mass Schedule Section
    massScheduleTitle: 'Mass Schedule',
    massSchedulePeriod: 'October-December 2025',
    massScheduleLocation: 'The Filipino Apostolate',
    massScheduleAddress: '790 Salem Street',
    massScheduleCityState: 'Malden, MA 02148',
    massScheduleAdditionalInfo: 'For Additional Info',
    
    // Leadership Section
    leadershipTitle: 'Leadership',
    chaplainName: 'Father Peru Dayag, SVD',
    northShoreCoordinator: 'Annie Taliad',
    northShoreAssistantCoordinator: 'Jeffrey Pagulong',
    northShoreSecretary: 'Meynard Gutierrez',
    northShoreFinanceTeam: 'Crispina Gutierrez',
    northShoreHeadOfLiturgy: 'Kaye Vito',
    northShoreFaithFormation: 'Pearl Brault, Jun Cruz',
    southShoreCoordinator: 'John Manuel',
    southShoreAssistantCoordinator: 'Loreta Borneo',
    southShoreSecretary: 'Alpha Cattaneo',
    southShoreFinanceTeam: 'Rudy Hermosa',
    southShoreHeadOfLiturgy: 'Ross Mangilog',
    southShoreFaithFormation: 'Lisa Paradela, Salome Afable',
    financeTreasurers: 'Priscilla Cruz, Gracita Chiefe',
    financeAuditor: 'July Afable',
    
    // Events Section
    eventsTitle: 'EVENTS',
    eventsSubtitle: 'Our faith community provides many opportunities to fellowship with each other.\nHere are just a few of our upcoming events!',
    
    // Resources Section
    resourcesTitle: 'Resources for Spiritual Growth',
    resourcesSubtitle: 'Connect with Catholic resources and deepen your faith',
    resourceLinks: [
      { title: 'The Vatican: The Holy See', url: 'https://www.vatican.va/' },
      { title: 'Archdiocese of Boston', url: 'https://www.bostoncatholic.org/' },
      { title: 'Daily Readings', url: 'https://bible.usccb.org/daily-bible-reading' },
      { title: "Cardinal Sean's Blog", url: 'https://www.cardinalseansblog.org/' },
      { title: 'The Good Catholic Life', url: 'https://www.thegoodcatholiclife.com/' },
      { title: 'Catholic Devotions', url: 'https://www.catholicdevotions.org/' }
    ]
};

export default function WebsiteSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<WebsiteSettings>(defaultSettings);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        alert(`Failed to save settings: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResourceLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    setSettings(prev => ({
      ...prev,
      resourceLinks: prev.resourceLinks?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ) || []
    }));
  };

  const addResourceLink = () => {
    setSettings(prev => ({
      ...prev,
      resourceLinks: [...(prev.resourceLinks || []), { title: '', url: '' }]
    }));
  };

  const removeResourceLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      resourceLinks: prev.resourceLinks?.filter((_, i) => i !== index) || []
    }));
  };

  const handleLogoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadToSupabaseStorage(file, 'image');
      setSettings(prev => ({ ...prev, logoImageUrl: result.url }));
    } catch (error) {
      console.error('Error uploading logo image:', error);
      alert('Failed to upload logo image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          // Merge loaded settings with defaults to ensure all fields are populated
          const mergedSettings = {
            ...defaultSettings,
            ...data.settings,
            // Ensure resourceLinks array is properly merged
            resourceLinks: data.settings.resourceLinks || defaultSettings.resourceLinks
          };
          setSettings(mergedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // If loading fails, keep the default settings
        setSettings(defaultSettings);
      }
    };
    loadSettings();
  }, []);

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
                <span className="text-white">Website Settings</span>
              </nav>
              <h1 className="text-2xl font-bold text-white mt-2">Website Settings</h1>
              <p className="text-white/90 mt-1">Update your church&apos;s website information</p>
            </div>
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
            >
              Preview Website
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-gray-600 mt-1">Your church&apos;s name and basic details</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                  Church Name *
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Statement
                </label>
                <textarea
                  id="tagline"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your church's mission and purpose..."
                />
              </div>

              <div>
                <label htmlFor="pastorName" className="block text-sm font-medium text-gray-700 mb-2">
                  Pastor/Priest Name
                </label>
                <input
                  type="text"
                  id="pastorName"
                  name="pastorName"
                  value={settings.pastorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Homepage Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Homepage Content</h2>
              <p className="text-gray-600 mt-1">What visitors see when they first visit your website</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Title *
                </label>
                <input
                  type="text"
                  id="heroTitle"
                  name="heroTitle"
                  value={settings.heroTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Welcome to Our Church Family"
                />
              </div>

              <div>
                <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Welcome Subtitle
                </label>
                <input
                  type="text"
                  id="heroSubtitle"
                  name="heroSubtitle"
                  value={settings.heroSubtitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Join us in faith, fellowship, and community"
                />
              </div>

              <div>
                <label htmlFor="aboutText" className="block text-sm font-medium text-gray-700 mb-2">
                  About Section
                </label>
                <textarea
                  id="aboutText"
                  name="aboutText"
                  value={settings.aboutText}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell visitors about your church community, history, and what makes you special..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {/* Mission Page */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Mission Page</h2>
              <p className="text-gray-600 mt-1">Edit mission page statements, reflection keywords, and logo explanation</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="missionTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Page Title
                </label>
                <textarea
                  id="missionTitle"
                  name="missionTitle"
                  value={settings.missionTitle || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mission Statement of the\nFilipino Apostolate\nof the\nArchdiocese of Boston"
                />
              </div>

              <div>
                <label htmlFor="missionFilipinoText" className="block text-sm font-medium text-gray-700 mb-2">
                  Filipino Mission Text
                </label>
                <textarea
                  id="missionFilipinoText"
                  name="missionFilipinoText"
                  value={settings.missionFilipinoText || ''}
                  onChange={handleInputChange}
                  rows={7}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="missionEnglishText" className="block text-sm font-medium text-gray-700 mb-2">
                  English Mission Text
                </label>
                <textarea
                  id="missionEnglishText"
                  name="missionEnglishText"
                  value={settings.missionEnglishText || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="missionKeywordsText" className="block text-sm font-medium text-gray-700 mb-2">
                  Reflection Keywords
                </label>
                <textarea
                  id="missionKeywordsText"
                  name="missionKeywordsText"
                  value={settings.missionKeywordsText || ''}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="One per line, like: Sambayanang Kristiyano | Christian Community"
                />
              </div>

              <div>
                <label htmlFor="logoExplanationTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Explanation Title
                </label>
                <input
                  type="text"
                  id="logoExplanationTitle"
                  name="logoExplanationTitle"
                  value={settings.logoExplanationTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="logoImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Mission Logo Image
                </label>
                <input
                  type="file"
                  id="logoImage"
                  accept="image/*"
                  onChange={handleLogoImageUpload}
                  disabled={imageUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {imageUploading && <p className="text-sm text-gray-500 mt-2">Uploading image...</p>}
                {settings.logoImageUrl && (
                  <div className="mt-4 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.logoImageUrl} alt="Mission logo preview" className="h-40 w-40 object-contain rounded-lg border bg-white" />
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, logoImageUrl: '' }))}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label htmlFor="logoBambooTitle" className="block text-sm font-medium text-gray-700">
                    Bamboo Section Title
                  </label>
                  <input
                    type="text"
                    id="logoBambooTitle"
                    name="logoBambooTitle"
                    value={settings.logoBambooTitle || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    name="logoBambooText"
                    value={settings.logoBambooText || ''}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="logoSunTitle" className="block text-sm font-medium text-gray-700">
                    Sun Section Title
                  </label>
                  <input
                    type="text"
                    id="logoSunTitle"
                    name="logoSunTitle"
                    value={settings.logoSunTitle || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    name="logoSunText"
                    value={settings.logoSunText || ''}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="logoHandsTitle" className="block text-sm font-medium text-gray-700">
                    Hands Section Title
                  </label>
                  <input
                    type="text"
                    id="logoHandsTitle"
                    name="logoHandsTitle"
                    value={settings.logoHandsTitle || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    name="logoHandsText"
                    value={settings.logoHandsText || ''}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="logoConcept" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Concept Credit
                  </label>
                  <input
                    type="text"
                    id="logoConcept"
                    name="logoConcept"
                    value={settings.logoConcept || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="logoDesign" className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Design Credit
                  </label>
                  <input
                    type="text"
                    id="logoDesign"
                    name="logoDesign"
                    value={settings.logoDesign || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="logoNote" className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Note
                </label>
                <textarea
                  id="logoNote"
                  name="logoNote"
                  value={settings.logoNote || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              <p className="text-gray-600 mt-1">How people can reach your church</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Church Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street address, city, state, zip code"
                />
              </div>

              <div>
                <label htmlFor="serviceTimes" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Times
                </label>
                <input
                  type="text"
                  id="serviceTimes"
                  name="serviceTimes"
                  value={settings.serviceTimes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sundays at 10:00 AM and 6:00 PM, Wednesdays at 7:00 PM"
                />
              </div>
            </div>
          </div>

          {/* Mass Schedule Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Mass Schedule Section</h2>
              <p className="text-gray-600 mt-1">Content displayed in the Mass Schedule section</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="massScheduleTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    id="massScheduleTitle"
                    name="massScheduleTitle"
                    value={settings.massScheduleTitle || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mass Schedule"
                  />
                </div>

                <div>
                  <label htmlFor="massSchedulePeriod" className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Period
                  </label>
                  <input
                    type="text"
                    id="massSchedulePeriod"
                    name="massSchedulePeriod"
                    value={settings.massSchedulePeriod || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="October-December 2025"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="massScheduleLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  id="massScheduleLocation"
                  name="massScheduleLocation"
                  value={settings.massScheduleLocation || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="The Filipino Apostolate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="massScheduleAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="massScheduleAddress"
                    name="massScheduleAddress"
                    value={settings.massScheduleAddress || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="790 Salem Street"
                  />
                </div>

                <div>
                  <label htmlFor="massScheduleCityState" className="block text-sm font-medium text-gray-700 mb-2">
                    City, State
                  </label>
                  <input
                    type="text"
                    id="massScheduleCityState"
                    name="massScheduleCityState"
                    value={settings.massScheduleCityState || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Malden, MA 02148"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="massScheduleAdditionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Information
                </label>
                <input
                  type="text"
                  id="massScheduleAdditionalInfo"
                  name="massScheduleAdditionalInfo"
                  value={settings.massScheduleAdditionalInfo || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="For Additional Info"
                />
              </div>
            </div>
          </div>

          {/* Leadership Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Leadership Section</h2>
              <p className="text-gray-600 mt-1">Leadership information displayed on the website</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="leadershipTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  id="leadershipTitle"
                  name="leadershipTitle"
                  value={settings.leadershipTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leadership"
                />
              </div>

              <div>
                <label htmlFor="chaplainName" className="block text-sm font-medium text-gray-700 mb-2">
                  Chaplain Name
                </label>
                <input
                  type="text"
                  id="chaplainName"
                  name="chaplainName"
                  value={settings.chaplainName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Father Peru Dayag, SVD"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4">North Shore Leadership</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="northShoreCoordinator" className="block text-sm font-medium text-gray-700 mb-1">
                        Coordinator
                      </label>
                      <input
                        type="text"
                        id="northShoreCoordinator"
                        name="northShoreCoordinator"
                        value={settings.northShoreCoordinator || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Annie Taliad"
                      />
                    </div>
                    <div>
                      <label htmlFor="northShoreAssistantCoordinator" className="block text-sm font-medium text-gray-700 mb-1">
                        Assistant Coordinator
                      </label>
                      <input
                        type="text"
                        id="northShoreAssistantCoordinator"
                        name="northShoreAssistantCoordinator"
                        value={settings.northShoreAssistantCoordinator || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Jeffrey Pagulong"
                      />
                    </div>
                    <div>
                      <label htmlFor="northShoreSecretary" className="block text-sm font-medium text-gray-700 mb-1">
                        Secretary
                      </label>
                      <input
                        type="text"
                        id="northShoreSecretary"
                        name="northShoreSecretary"
                        value={settings.northShoreSecretary || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Meynard Gutierrez"
                      />
                    </div>
                    <div>
                      <label htmlFor="northShoreFinanceTeam" className="block text-sm font-medium text-gray-700 mb-1">
                        Finance Team
                      </label>
                      <input
                        type="text"
                        id="northShoreFinanceTeam"
                        name="northShoreFinanceTeam"
                        value={settings.northShoreFinanceTeam || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Crispina Gutierrez"
                      />
                    </div>
                    <div>
                      <label htmlFor="northShoreHeadOfLiturgy" className="block text-sm font-medium text-gray-700 mb-1">
                        Head of Liturgy
                      </label>
                      <input
                        type="text"
                        id="northShoreHeadOfLiturgy"
                        name="northShoreHeadOfLiturgy"
                        value={settings.northShoreHeadOfLiturgy || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Kaye Vito"
                      />
                    </div>
                    <div>
                      <label htmlFor="northShoreFaithFormation" className="block text-sm font-medium text-gray-700 mb-1">
                        Faith Formation Outreach
                      </label>
                      <input
                        type="text"
                        id="northShoreFaithFormation"
                        name="northShoreFaithFormation"
                        value={settings.northShoreFaithFormation || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pearl Brault, Jun Cruz"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-4">South Shore Leadership</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="southShoreCoordinator" className="block text-sm font-medium text-gray-700 mb-1">
                        Coordinator
                      </label>
                      <input
                        type="text"
                        id="southShoreCoordinator"
                        name="southShoreCoordinator"
                        value={settings.southShoreCoordinator || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Manuel"
                      />
                    </div>
                    <div>
                      <label htmlFor="southShoreAssistantCoordinator" className="block text-sm font-medium text-gray-700 mb-1">
                        Assistant Coordinator
                      </label>
                      <input
                        type="text"
                        id="southShoreAssistantCoordinator"
                        name="southShoreAssistantCoordinator"
                        value={settings.southShoreAssistantCoordinator || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Loreta Borneo"
                      />
                    </div>
                    <div>
                      <label htmlFor="southShoreSecretary" className="block text-sm font-medium text-gray-700 mb-1">
                        Secretary
                      </label>
                      <input
                        type="text"
                        id="southShoreSecretary"
                        name="southShoreSecretary"
                        value={settings.southShoreSecretary || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Alpha Cattaneo"
                      />
                    </div>
                    <div>
                      <label htmlFor="southShoreFinanceTeam" className="block text-sm font-medium text-gray-700 mb-1">
                        Finance Team
                      </label>
                      <input
                        type="text"
                        id="southShoreFinanceTeam"
                        name="southShoreFinanceTeam"
                        value={settings.southShoreFinanceTeam || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Rudy Hermosa"
                      />
                    </div>
                    <div>
                      <label htmlFor="southShoreHeadOfLiturgy" className="block text-sm font-medium text-gray-700 mb-1">
                        Head of Liturgy
                      </label>
                      <input
                        type="text"
                        id="southShoreHeadOfLiturgy"
                        name="southShoreHeadOfLiturgy"
                        value={settings.southShoreHeadOfLiturgy || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ross Mangilog"
                      />
                    </div>
                    <div>
                      <label htmlFor="southShoreFaithFormation" className="block text-sm font-medium text-gray-700 mb-1">
                        Faith Formation Outreach
                      </label>
                      <input
                        type="text"
                        id="southShoreFaithFormation"
                        name="southShoreFaithFormation"
                        value={settings.southShoreFaithFormation || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Lisa Paradela, Salome Afable"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="financeTreasurers" className="block text-sm font-medium text-gray-700 mb-2">
                    Finance Treasurers
                  </label>
                  <input
                    type="text"
                    id="financeTreasurers"
                    name="financeTreasurers"
                    value={settings.financeTreasurers || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Priscilla Cruz, Gracita Chiefe"
                  />
                </div>
                <div>
                  <label htmlFor="financeAuditor" className="block text-sm font-medium text-gray-700 mb-2">
                    Finance Auditor
                  </label>
                  <input
                    type="text"
                    id="financeAuditor"
                    name="financeAuditor"
                    value={settings.financeAuditor || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="July Afable"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Events Section</h2>
              <p className="text-gray-600 mt-1">Content displayed in the Events section</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="eventsTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  id="eventsTitle"
                  name="eventsTitle"
                  value={settings.eventsTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="EVENTS"
                />
              </div>

              <div>
                <label htmlFor="eventsSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Subtitle
                </label>
                <textarea
                  id="eventsSubtitle"
                  name="eventsSubtitle"
                  value={settings.eventsSubtitle || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Our faith community provides many opportunities to fellowship with each other. Here are just a few of our upcoming events!"
                />
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Resources Section</h2>
              <p className="text-gray-600 mt-1">Resource links displayed on the website</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="resourcesTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  id="resourcesTitle"
                  name="resourcesTitle"
                  value={settings.resourcesTitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Resources for Spiritual Growth"
                />
              </div>

              <div>
                <label htmlFor="resourcesSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  id="resourcesSubtitle"
                  name="resourcesSubtitle"
                  value={settings.resourcesSubtitle || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Connect with Catholic resources and deepen your faith"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-gray-800">Resource Links</h3>
                  <button
                    type="button"
                    onClick={addResourceLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Add Resource Link
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(settings.resourceLinks || []).map((link, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleResourceLinkChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Resource title"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                        </label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleResourceLinkChange(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResourceLink(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* Save Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Changes will be visible on your website immediately after saving
            </div>
            <div className="flex items-center space-x-4">
              {saved && (
                <div className="flex items-center text-green-600 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Settings saved successfully!
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
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
