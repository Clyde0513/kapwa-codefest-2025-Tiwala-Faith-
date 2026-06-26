import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { db } from '../../lib/db-utils';

export const dynamic = 'force-dynamic';

type MissionSettings = {
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
};

const defaultMissionSettings: Required<MissionSettings> = {
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
};

function multilineText(value: string) {
  return value.split('\n').map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < value.split('\n').length - 1 && <br />}
    </span>
  ));
}

function parseKeywords(value: string) {
  return value
    .split('\n')
    .map((line) => {
      const [term, translation] = line.split('|').map((part) => part?.trim());
      return { term, translation };
    })
    .filter((keyword) => keyword.term);
}

async function getMissionSettings(): Promise<Required<MissionSettings>> {
  try {
    const settingsRecord = await db.findUniqueSettings({
      where: { key: 'website' },
      select: { value: true },
    });

    if (
      settingsRecord &&
      typeof settingsRecord === 'object' &&
      'value' in settingsRecord &&
      settingsRecord.value
    ) {
      return {
        ...defaultMissionSettings,
        ...(settingsRecord.value as MissionSettings),
      };
    }
  } catch (error) {
    console.error('Error loading mission settings:', error);
  }

  return defaultMissionSettings;
}

export default async function MissionPage() {
  const settings = await getMissionSettings();
  const keywords = parseKeywords(settings.missionKeywordsText);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="py-20 px-4 bg-gradient-to-br from-[#decca6] via-[#c0a154] to-[#decca6]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-poppins text-4xl sm:text-5xl lg:text-5xl font-bold mb-12 leading-tight tracking-wide text-gray-900">
            {multilineText(settings.missionTitle)}
          </h1>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="bg-gradient-to-r from-[#7A0000] to-[#A01010] text-white p-12 rounded-2xl shadow-xl">
              <p className="font-['Georgia'] text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-center italic">
                {multilineText(settings.missionFilipinoText)}
              </p>
            </div>
          </div>

          <div className="mb-16">
            <div className="bg-gray-50 p-12 rounded-2xl shadow-lg">
              <p className="font-poppins text-xl sm:text-2xl lg:text-3xl leading-relaxed text-center text-gray-800">
                {settings.missionEnglishText}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#decca6] via-[#c0a154] to-[#decca6] p-12 rounded-2xl shadow-xl">
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              Key words to reflect on which should lead us to our lines of actions:
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {keywords.map((keyword) => (
                <div key={keyword.term} className="bg-white/80 p-8 rounded-xl shadow-lg">
                  <h3 className="font-poppins text-2xl font-bold text-[#7A0000] mb-4 text-center">
                    {keyword.term}
                  </h3>
                  {keyword.translation && (
                    <p className="font-poppins text-lg text-gray-700 text-center">
                      ({keyword.translation})
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 bg-white p-12 rounded-2xl shadow-xl border-2 border-gray-100">
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
              {settings.logoExplanationTitle}
            </h2>

            <div className="space-y-8">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-xl border-l-4 border-green-500">
                <h3 className="font-poppins text-xl font-bold text-green-800 mb-4">
                  {settings.logoBambooTitle}
                </h3>
                <p className="font-poppins text-lg text-gray-700 leading-relaxed">
                  {settings.logoBambooText}
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-8 rounded-xl border-l-4 border-yellow-500">
                <h3 className="font-poppins text-xl font-bold text-yellow-800 mb-4">
                  {settings.logoSunTitle}
                </h3>
                <p className="font-poppins text-lg text-gray-700 leading-relaxed">
                  {settings.logoSunText}
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-xl border-l-4 border-blue-500">
                <h3 className="font-poppins text-xl font-bold text-blue-800 mb-4">
                  {settings.logoHandsTitle}
                </h3>
                <p className="font-poppins text-lg text-gray-700 leading-relaxed">
                  {settings.logoHandsText}
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-block bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                  <Image
                    src={settings.logoImageUrl || '/images/tiwalaupdated.png'}
                    alt="Filipino Apostolate of Boston Logo"
                    width={300}
                    height={300}
                    className="w-64 h-64 object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Concept:</p>
                  <p>{settings.logoConcept}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-2">Design:</p>
                  <p>{settings.logoDesign}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                  {settings.logoNote}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-12 py-4 rounded-full transition-all text-xl font-poppins border-4 border-white shadow-lg"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
