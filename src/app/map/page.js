'use client'
import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

import { europeanCities } from '@/components/Map/cityCoords';

const EuropeMapLeafletWithNoSSR = dynamic(
  () => import('../../components/Map/Map'),
  {
    ssr: false,
    loading: () => <div 
    style={{ height: '700px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading Map...</div>
  }
);

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityDataDetails, setCityDataDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleCityClick = (city) => {
    console.log('D3 City Marker clicked:', city);
    if (selectedCity?.id === city.id) {
      setSelectedCity(null);
      setCityDataDetails(null);
    } else {
      setSelectedCity(city);
      setIsLoadingDetails(true);
      console.log(`Placeholder: Fetch and process CSV data for ${city.name} using D3 for visualizations.`);
      setTimeout(() => {
        setCityDataDetails({
          name: city.name,
          placeholderData: "Weekday & Weekend Airbnb summary (visualized with D3) will appear here.",
          // D3 will be used to render charts based on actual data here
        });
        setIsLoadingDetails(false);
      }, 1000);
    }
  };

  return (
    <>
      <Head>
        <title>European Airbnb Insights (D3 Implemented)</title>
        <meta name="description" content="Interactive map of Airbnb data in Europe, D3 markers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
        <header className="w-full max-w-6xl mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            European Airbnb Data (D3 Visualization)
          </h1>
          <p className="text-md md:text-lg text-gray-600 mt-2">
            Click a city marker to explore its Airbnb summary.
          </p>
        </header>

        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4">
          <div className="lg:flex-grow bg-white p-1 rounded-xl shadow-2xl overflow-hidden">
            <EuropeMapLeafletWithNoSSR
              cities={europeanCities}
              onCityClick={handleCityClick}
              selectedCityId={selectedCity?.id}
            />
          </div>

          {/* Data Display Panel */}
          <aside className="lg:w-1/3 xl:w-1/4 bg-white p-5 rounded-xl shadow-2xl lg:max-h-[700px] overflow-y-auto">
            {selectedCity ? (
              <>
                <h2 className="text-2xl font-semibold text-blue-700 mb-3 border-b-2 pb-2 border-blue-200 text-center">
                  {`${selectedCity.name}, ${selectedCity.country}`}
                </h2>
                {isLoadingDetails ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-500">Loading details for {selectedCity.name}...</p>
                    <div className="mt-3 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : cityDataDetails ? (
                  <div className="space-y-4 text-sm">
                    <p><strong className="text-gray-700">Info:</strong> {cityDataDetails.placeholderData}</p>
                    {/* This area will be for D3-generated charts/visualizations from CSV data */}
                    <div id="d3-charts-container">
                       {/* D3 will target this div or similar ones to inject visualizations */}
                    </div>
                  </div>
                ) : (
                   <p className="text-gray-500">No details to display.</p>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                 <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No city selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Click a city marker on the map to view its Airbnb data.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}