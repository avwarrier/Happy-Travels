import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const CityCenterDistanceDotPlot = ({ userMaxDistance }) => {
  const d3Container = useRef(null);
  const [cityMedianDistances, setCityMedianDistances] = useState([]);
  const [passPercentage, setPassPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];

  // 1. Data Fetching and Processing
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let processedMedianDistances = [];

      try {
        for (const city of cities) {
          const weekdayPath = `/data/${city}_weekdays.csv`;
          const weekendPath = `/data/${city}_weekends.csv`;
          let cityDistances = [];

          try {
            const [weekdayData, weekendData] = await Promise.all([
              d3.csv(weekdayPath),
              d3.csv(weekendPath)
            ]);

            const extractDistances = (data) => {
              if (data) {
                data.forEach(d => {
                  const dist = parseFloat(d.dist_to_center); // Use dist_to_center
                  if (!isNaN(dist)) {
                    cityDistances.push(dist);
                  }
                });
              }
            };
            extractDistances(weekdayData);
            extractDistances(weekendData);

            if (cityDistances.length > 0) {
              const medianDist = d3.median(cityDistances);
              processedMedianDistances.push({ city: city.charAt(0).toUpperCase() + city.slice(1), medianDistance: medianDist });
            } else {
              console.warn(`No dist_to_center data for ${city}`);
              processedMedianDistances.push({ city: city.charAt(0).toUpperCase() + city.slice(1), medianDistance: Infinity });
            }
          } catch (cityError) {
            console.error(`Error fetching dist_to_center data for ${city}:`, cityError);
            processedMedianDistances.push({ city: city.charAt(0).toUpperCase() + city.slice(1), medianDistance: Infinity });
          }
        }

        // Sort by medianDistance for the dot plot order (e.g., ascending)
        processedMedianDistances.sort((a, b) => a.medianDistance - b.medianDistance);
        setCityMedianDistances(processedMedianDistances.filter(c => isFinite(c.medianDistance)));

      } catch (err) {
        console.error('Error processing dist_to_center data:', err);
        setError('Failed to load or process city center distance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Calculate Pass Percentage
  useEffect(() => {
    if (cityMedianDistances.length === 0) {
      setPassPercentage(0);
      return;
    }
    const passingCities = cityMedianDistances.filter(c => c.medianDistance <= userMaxDistance).length;
    setPassPercentage(cityMedianDistances.length > 0 ? Math.round((passingCities / cityMedianDistances.length) * 100) : 0);
  }, [cityMedianDistances, userMaxDistance]);

  // 3. D3.js Visualization
  useEffect(() => {
    if (loading || error || !d3Container.current || cityMedianDistances.length === 0) {
      if(d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      // Optional: Add a message if cityMedianDistances is empty but not loading/error
      if (d3Container.current && !loading && !error && cityMedianDistances.length === 0) {
        const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
        tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No distance data to display.');
      }
      return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 100 }; // Increased left margin for city names
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = d3Container.current.clientHeight;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(d3Container.current)
      .append('svg')
        .attr('width', containerWidth)
        .attr('height', containerHeight)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xMaxDomain = d3.max(cityMedianDistances, d => d.medianDistance);
    const x = d3.scaleLinear()
      .domain([0, Math.max(xMaxDomain || 0, userMaxDistance || 0, 1) * 1.05]) // Ensure domain covers data and user input, with padding
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(cityMedianDistances.map(d => d.city)) // Cities on Y-axis
      .range([0, height])
      .padding(0.3);

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d.toFixed(1)}km`))
      .append('text')
        .attr('x', width / 2)
        .attr('y', margin.bottom - 10)
        .attr('fill', '#000')
        .style('text-anchor', 'middle')
        .text('Median Distance to City Centre (km)');

    // Y-axis (City Names)
    svg.append('g')
      .call(d3.axisLeft(y));

    // Dots
    svg.selectAll('.dot')
      .data(cityMedianDistances)
      .join('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.medianDistance))
        .attr('cy', d => y(d.city) + y.bandwidth() / 2)
        .attr('r', 4)
        .attr('fill', d => {
          if (d.medianDistance <= userMaxDistance) {
            return '#E51D51';
          }
          return '#A9A9A9';
        })
        .attr('stroke', '#191919')
        .attr('stroke-width', 0.5);

    // User Cutoff Line
    if (userMaxDistance !== null && isFinite(userMaxDistance) && x(userMaxDistance) >= 0 && x(userMaxDistance) <= width) {
      svg.append('line')
        .attr('x1', x(userMaxDistance))
        .attr('x2', x(userMaxDistance))
        .attr('y1', height)
        .attr('y2', 0)
        .attr('stroke', '#555555')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      svg.append('text')
        .attr('x', x(userMaxDistance) + 5)
        .attr('y', margin.top - 5) // Position near top of chart
        .attr('fill', '#191919')
        .style('font-size', '10px')
        .text(`Your max: ${userMaxDistance.toFixed(1)}km`);
    }

    // Add x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${d}km`))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#191919');

    // Add y-axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#191919');

  }, [loading, error, cityMedianDistances, userMaxDistance]);

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-8 leading-tight">
        {loading ? 'Calculating...' : error ? 'Error loading data.' :
          (cityMedianDistances.length > 0 ? 
            (passPercentage === 100 ? 
                'All cities lie that close to the centre.' : 
                `Only ${passPercentage}% of cities lie that close to the centre.`
            ) : 
            'Not enough data for insights.'
          )
        }
      </h2>

      {loading && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <div 
          ref={d3Container} 
          className="w-full h-[350px] bg-gray-100 rounded-lg shadow"
          style={{ minHeight: '300px' }} 
        >
          {/* D3 chart will be rendered here */} 
        </div>
      )}
    </div>
  );
};

export default CityCenterDistanceDotPlot; 