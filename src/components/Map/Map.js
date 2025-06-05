import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import D3CityMarkersLayer from './D3CityMarkersOverlay';
import { useSearchParams } from 'next/navigation';

const EuropeMapLeaflet = ({ cities, onCityClick, selectedCityId }) => {
  const mapPosition = [50, 10];
  const mapZoom = 4;
  const europeBounds = L.latLngBounds(L.latLng(20, -20), L.latLng(70, 30));
  const searchParams = useSearchParams()

  const topCities = useMemo(() => {
    const t1 = searchParams.get('top1')
    const t2 = searchParams.get('top2')
    const t3 = searchParams.get('top3')
    return [t1, t2, t3].filter(Boolean)
  }, [searchParams])

  if (typeof window === 'undefined') {
    return <div style={{ height: '600px', background: '#eee' }} />;
  }

  return (
    <div className="relative w-full h-[600px] md:h-[700px]">
      <MapContainer
        center={mapPosition}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg shadow-md z-0 bg-sky-100"
        maxBounds={europeBounds}
        maxBoundsViscosity={1.0}
        minZoom={3}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <D3CityMarkersLayer
          cities={cities}
          onCityClick={onCityClick}
          selectedCityId={selectedCityId}
          topCities={topCities}
        />
      </MapContainer>

      {/* Legend overlay */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-md shadow-md p-3 text-sm space-y-2 z-[1000]">
        <p className="font-semibold">Top Matches Legend</p>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#facc15' }} />
          <span>1st place - Best match</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6366f1' }} />
          <span>2nd place - Strong match</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
          <span>3rd place - Good match</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
          <span>Other cities</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span>Currently selected</span>
        </div>
      </div>
      
    </div>
  );
};

export default EuropeMapLeaflet;
