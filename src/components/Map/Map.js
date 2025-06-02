import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import D3CityMarkersLayer from './D3CityMarkersOverlay';

/*
Using Leaflet for the base map rendering (countries, tiles, zoom/pan functionality, and map bounds), but D3 
will be responsible for creating and managing the city markers (as circles) and all subsequent data visualizations.
*/
const EuropeMapLeaflet = ({ cities, onCityClick, selectedCityId }) => {
  const mapPosition = [50, 10];
  const mapZoom = 4;
  const europeBounds = L.latLngBounds(L.latLng(20, -20), L.latLng(70, 30));

  if (typeof window === 'undefined') {
    return <div style={{ height: '600px', background: '#eee' }} />;
  }
  return (
    <MapContainer
      center={mapPosition}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="w-full h-[600px] md:h-[700px] rounded-lg shadow-md z-0 bg-sky-100"
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
      />
    </MapContainer>
  );
};

export default EuropeMapLeaflet;