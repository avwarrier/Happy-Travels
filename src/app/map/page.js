'use client'
import Head from 'next/head';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProgressBar from '@/components/ProgressBar'

import { europeanCities } from '@/components/Map/cityCoords';
import { DataExaminedBarChart } from '@/components/Map/D3DataExaminedBarChart';
import { MetricGaugeChart } from '@/components/Map/D3MetricGaugeChart';
import { AverageCost } from '@/components/Map/AverageCost';
import { AverageCapacity } from '@/components/Map/AvgCapacity';
import { AverageBedrooms } from '@/components/Map/AvgBedrooms';
import { AvgDistFromMetro } from '@/components/Map/DistFromMetro';
import { AvgDistFromCityCenter } from '@/components/Map/DistFromCityCenter';
import { RoomTypeDonutChart } from '@/components/Map/D3RoomType';

const EuropeMapLeafletWithNoSSR = dynamic(
  () => import('../../components/Map/Map'),
  {
    ssr: false,
    loading: () => <div 
    style={{ height: '600px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading Map...</div>
  }
);

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityDataDetails, setCityDataDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const gradient = "bg-gradient-to-r from-[#E51D51] to-[#D90865]"

  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ?? '';

const handleCityClick = async (city) => {
  console.log('D3 City Marker clicked:', city);
  if (selectedCity?.id === city.id) {
    setSelectedCity(null);
    setCityDataDetails(null);
  } else {
    setSelectedCity(city);
    setIsLoadingDetails(true);
    setCityDataDetails(null); // Clear previous details while loading new ones

    try {
      // Fetch data from API route
      const response = await fetch(`/api/airbnb-data/${city.id}`);
      
      if (!response.ok) {
        // Ask for error message from API response if available
        let errorMsg = `API request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) { /* ignore if response isn't json */ }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('Data received from API:', data);
      setCityDataDetails(data); // Store the aggregated data from your API

    } catch (error) {
      console.error("Failed to fetch city data:", error);
      setCityDataDetails({ error: error.message }); // Display error information
    } finally {
      setIsLoadingDetails(false);
    }
  }
};

  return (
    <>
      <Head>
        <title>European Airbnb Insights (D3 Implemented)</title>
        <meta name="description" content="Interactive map of Airbnb data in Europe, D3 markers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ProgressBar progress={21/21}/>
      <main className="min-h-screen bg-white flex flex-col items-center mt-4 p-4">
        <header className="w-full max-w-7xl mb-8 text-center flex justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl text-start text-[5vh] text-gray-800">
              European Airbnb Data (D3 Visualization)
            </h1>

            <p className="text-md md:text-lg text-start text-[#E51D51]">
              Click a city marker to explore its Airbnb summary.
            </p>
          </div>

          <div className='flex justify-end gap-8'>
            <Link href={`/results?${queryString}`}>
              <button className={`h-[5vh] w-[15vh] hover:opacity-90 transition-all duration-500 ease-in-out cursor-pointer`}>
                <p className='text-black text-[2vh]'>back to results</p>
              </button>
            </Link>

            <Link href={"/"}>
                <button className={`h-[5vh] w-[15vh] hover:opacity-90 transition-all duration-500 ease-in-out ${gradient} cursor-pointer rounded-full shadow-md`}>
                    <p className='text-white text-[2vh]'>Start Over</p>
                </button>
            </Link>
          </div>
        </header>


        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 h-[600px]">
          <div className="lg:flex-grow bg-white p-1 rounded-xl overflow-hidden">
            <EuropeMapLeafletWithNoSSR
              cities={europeanCities}
              onCityClick={handleCityClick}
              selectedCityId={selectedCity?.id}
            />
          </div>

          {/* Data Display Panel */}
          <aside className="lg:w-1/3 xl:w-1/4 bg-white p-5 rounded-xl border border-gray-100 lg:max-h-[700px] overflow-y-auto text-gray-900">
            {selectedCity ? (
              <>
                <h2 className="text-xl font-semibold mb-5">
                  {`${selectedCity.name}, ${selectedCity.country}`}
                </h2>
                {isLoadingDetails ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-500">Loading details for {selectedCity.name}...</p>
                    <div className="mt-3 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : cityDataDetails ? (
                  <div className=" text-sm">

                    <DataExaminedBarChart weekdayRows={parseInt(cityDataDetails.weekdayRows)} weekendRows={parseInt(cityDataDetails.weekendRows)} totalListings={cityDataDetails.weekendRows + cityDataDetails.weekdayRows}/>

                    <div className='border border-gray-200 my-4'/>

                    <div>
                      <h2 className="text-gray-500 font-semibold text-lg mb-2">Average Metrics</h2>
                      <div className='flex w-full justify-evenly sm:justify-between items-center'>
                        <AverageCost avgCost={cityDataDetails.avgCost.avgTotalCityCost} weekdayAvgCost={cityDataDetails.avgCost.avgWeekdayCost} weekendAvgCost={cityDataDetails.avgCost.avgWeekendCost}/>
                        <MetricGaugeChart value={cityDataDetails.avgCleanliness.combined?.toFixed(2)} label={"Cleanliness"}/>
                      </div>

                      <div className='flex w-full justify-evenly sm:justify-between items-center my-4'>
                        <MetricGaugeChart value={cityDataDetails.guestSatisfaction.toFixed(2)} label={"Guest Satisfaction"} maxValue={100} displayMode='percentage' color='#2196f3' />
                        <div className='flex flex-col gap-4'>
                          <AverageCapacity avgCapacity={cityDataDetails.personCapacity}/>
                          <AverageBedrooms avgRooms={cityDataDetails.bedroomCapacity}/>
                        </div>
                      </div>
                    </div>

                    <div className='border border-gray-200 my-4'/>
                    <h2 className="text-gray-500 font-semibold text-lg mb-2">Average Distance From</h2>
                    <div className='flex justify-evenly sm:justify-between'>
                      <AvgDistFromMetro distance={cityDataDetails.metroDist}/>
                      <AvgDistFromCityCenter distance={cityDataDetails.cityCenterDist}/>
                    </div> 

                    <div className='border border-gray-200 my-4'/>
                    <h2 className="text-gray-500 font-semibold text-lg mb-2">Room Type Distribution</h2>
                    <RoomTypeDonutChart data={cityDataDetails.roomTypeDistribution} title="Airbnb Room Types" />

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