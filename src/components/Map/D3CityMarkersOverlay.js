'use client'
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useMap } from 'react-leaflet';

/**
 * A React component that integrates with Leaflet to render and manage
 * custom city markers using D3.js. It draws interactive circles and labels for cities
 * directly onto Leaflet's overlay pane, updating their positions on map zoom/pan.
 * This component provides a dynamic and D3-powered way to display map markers.
 *
 * @param {object} props - The component's props.
 * @param {Array<{id: string, name: string, coordinates: [number, number]}>} props.cities - Array of city objects to display.
 * Each city object should have an `id`, `name`, and `coordinates` ( [latitude, longitude] ).
 * @param {function} props.onCityClick - Callback function triggered when a city marker is clicked.
 * Receives the city data object as an argument.
 * @param {string|null} props.selectedCityId - The ID of the currently selected city. This city's
 * marker will be styled differently to indicate selection.
 * @param {Array<string>} [props.topCities=[]] - An optional array of city names to highlight with distinct colors,
 * typically representing top-ranked cities from a recommendation.
 * @returns {null} This component renders directly into the Leaflet map's overlay pane
 * and does not return any direct JSX elements.
 */

const D3CityMarkersLayer = ({ cities, onCityClick, selectedCityId, topCities = [] }) => {
  const map = useMap();
  const svgLayerRef = useRef(null); // Holds the D3-managed SVG element
  const gRef = useRef(null); // Holds the group element for markers

  useEffect(() => {
    if (!map) return;

    // Initialize SVG overlay if it doesn't exist
    if (!svgLayerRef.current) {
      const svg = d3.select(map.getPanes().overlayPane)
        .append("svg")
        .attr("class", "leaflet-d3-svg-overlay pointer-events-none");
      svgLayerRef.current = svg.node();
      gRef.current = svg.append("g").attr("class", "leaflet-zoom-hide D3-markers-group").node();
    }

    const svg = d3.select(svgLayerRef.current);
    const g = d3.select(gRef.current);

    // Function to update marker positions and appearance
    const update = () => {
      // Adjust SVG size and position to match the map pane
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
      const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

      svg
        .attr("width", bottomRight.x - topLeft.x)
        .attr("height", bottomRight.y - topLeft.y)
        .style("left", topLeft.x + "px")
        .style("top", topLeft.y + "px");

      g.attr("transform", `translate(${-topLeft.x}, ${-topLeft.y})`);

      // D3 Update Pattern for circles
      const cityMarkers = g.selectAll("circle.city-marker")
        .data(cities, d => d.name); // Use city id as key for object constancy

      // Enter selection: new markers
      cityMarkers.enter()
        .append("circle")
        .attr("class", "city-marker cursor-pointer pointer-events-auto") // Enable pointer events on circles
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .on("click", (event, d) => {
          event.stopPropagation(); // Prevent map click if any
          onCityClick(d);
        })
        .on("mouseover", function (event, d) {
          if (d.id !== selectedCityId) {
            d3.select(this).raise() // Bring to front
              .transition().duration(150)
              .attr("r", 11)
              .style("fill-opacity", 0.9);
          }
        })
        .on("mouseout", function (event, d) {
          if (d.id !== selectedCityId) {
            d3.select(this)
              .transition().duration(150)
              .attr("r", d => d.id === selectedCityId ? 12 : 8) // Revert to original/selected size
              .style("fill-opacity", 0.7);
          }
        })
        .merge(cityMarkers) // Merge enter and update selections
        .attr("cx", d => map.latLngToLayerPoint(d.coordinates).x)
        .attr("cy", d => map.latLngToLayerPoint(d.coordinates).y)
        .attr("r", d => d.id === selectedCityId ? 12 : 8)
        .attr("fill", d => {
          if (d.id === selectedCityId) return '#ef4444';

          if (topCities[0] === d.name) return '#facc15';
          if (topCities[1] === d.name) return '#6366f1';
          if (topCities[2] === d.name) return '#10b981';

          return '#D90865';
        })
        .style("fill-opacity", 0.7)

      // Remove old markers if any city is removed (cleanup)
      cityMarkers.exit().remove();

      // === Render text next to the city markers ===
      const cityLabels = g.selectAll("text.city-label")
        .data(cities, d => d.id);

      cityLabels.enter()
        .append("text")
        .attr("class", d =>
          `city-label text-xs pointer-events-none select-none ${d.id === selectedCityId ? 'font-bold' : 'font-medium'}`)
        .attr("font-family", "sans-serif")
        .attr("fill", "#333333")
        .text(d => d.name)
        .merge(cityLabels)
        .text(d => d.name)
        .attr("class", d =>
          `city-label text-xs pointer-events-none select-none ${d.id === selectedCityId ? 'font-bold' : 'font-medium'}`)
        .attr("x", d => map.latLngToLayerPoint(d.coordinates).x + (d.id === selectedCityId ? 16 : 12))
        .attr("y", d => map.latLngToLayerPoint(d.coordinates).y + 4);

      cityLabels.exit().remove();
    };

    // Initial draw
    update();

    // Redraw markers on map move or zoom
    map.on('zoomend moveend viewreset', update);

    // Cleanup function
    return () => {
      map.off('zoomend moveend viewreset', update);
    };
  }, [map, cities, onCityClick, selectedCityId]); // Dependencies for re-running the effect

  return null; // This component renders into Leaflet's overlay pane directly
};

export default D3CityMarkersLayer;