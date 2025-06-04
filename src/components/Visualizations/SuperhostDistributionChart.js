import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const SuperhostDistributionChart = ({ userSuperhostPreference }) => {
  const d3Container = useRef(null);
  const [citySuperhostData, setCitySuperhostData] = useState([]);
  const [overallAverage, setOverallAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let processedCityData = [];
      let totalSuperhostListings = 0;
      let totalListingsConsidered = 0;

      try {
        for (const city of cities) {
          const weekdayPath = `/data/${city}_weekdays.csv`;
          const weekendPath = `/data/${city}_weekends.csv`;
          
          try {
            const [weekdayData, weekendData] = await Promise.all([
              d3.csv(weekdayPath),
              d3.csv(weekendPath)
            ]);
            const combinedData = [...(weekdayData || []), ...(weekendData || [])];
            
            let superhostCount = 0;
            let cityTotalListings = 0;

            combinedData.forEach(d => {
              const isSuperhostField = String(d.host_is_superhost).toLowerCase();
              // Considering various TRUE representations for host_is_superhost
              if (isSuperhostField === 't' || isSuperhostField === 'true' || isSuperhostField === '1') {
                superhostCount++;
              }
              cityTotalListings++; // Count all listings processed for the city
            });

            if (cityTotalListings > 0) {
              processedCityData.push({
                city: city.charAt(0).toUpperCase() + city.slice(1),
                superhostPercent: (superhostCount / cityTotalListings) * 100,
              });
              totalSuperhostListings += superhostCount;
              totalListingsConsidered += cityTotalListings;
            } else {
              // Push city with 0% if no listings, or handle as per desired logic
              processedCityData.push({
                city: city.charAt(0).toUpperCase() + city.slice(1),
                superhostPercent: 0,
              });
            }

          } catch (cityError) {
            console.error(`Error processing Superhost data for ${city}:`, cityError);
            processedCityData.push({ city: city.charAt(0).toUpperCase() + city.slice(1), superhostPercent: 0 });
          }
        }
        
        processedCityData.sort((a,b) => b.superhostPercent - a.superhostPercent);
        setCitySuperhostData(processedCityData);

        if (totalListingsConsidered > 0) {
            setOverallAverage((totalSuperhostListings / totalListingsConsidered) * 100);
        } else {
            setOverallAverage(0);
        }

      } catch (err) {
        console.error('Error fetching or processing Superhost data:', err);
        setError('Failed to load Superhost data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // D3 Visualization: Dot Plot
  useEffect(() => {
    if (loading || error || !d3Container.current || citySuperhostData.length === 0) {
      if(d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      if (d3Container.current && !loading && !error && citySuperhostData.length === 0) {
        const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
        tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No Superhost data to display.');
      }
      return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 50, left: 100 }; 
    const containerWidth = d3Container.current.clientWidth;
    
    const dotPlotRowHeight = 25; 
    const chartHeight = citySuperhostData.length * dotPlotRowHeight;
    const svgHeight = chartHeight + margin.top + margin.bottom;
    const width = containerWidth - margin.left - margin.right;

    const svg = d3.select(d3Container.current)
      .append('svg')
        .attr('width', containerWidth)
        .attr('height', svgHeight)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, 100]) // Percentage
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(citySuperhostData.map(d => d.city))
      .range([0, chartHeight])
      .padding(0.4); 

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .append('text')
        .attr('x', width / 2).attr('y', margin.bottom - 10)
        .attr('fill', '#191919').style('text-anchor', 'middle')
        .text('Percentage of Superhost Listings');
        
    // Y-axis (City Names)
    svg.append('g').call(d3.axisLeft(y));

    // Overall Average Line
    svg.append('line')
      .attr('x1', x(overallAverage))
      .attr('y1', 0)
      .attr('x2', x(overallAverage))
      .attr('y2', chartHeight)
      .attr('stroke', '#555555')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');
    svg.append('text')
        .attr('x', x(overallAverage) + 4)
        .attr('y', -5)
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .text(`Avg: ${overallAverage.toFixed(0)}%`);

    // Dots
    svg.selectAll('.dot')
      .data(citySuperhostData)
      .join('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.superhostPercent))
        .attr('cy', d => y(d.city) + y.bandwidth() / 2)
        .attr('r', 6)
        .attr('fill', d => {
          const percent = d.superhostPercent;
          if (percent <= 33) return '#FF8DA0'; // Lightest Airbnb red/pink
          if (percent <= 66) return '#E51D51'; // Primary Airbnb red
          return '#D90865'; // Darker Airbnb red
        });

    // Value Labels for Dots
    svg.selectAll('.dot-label')
      .data(citySuperhostData)
      .join('text')
        .attr('class', 'dot-label')
        .attr('x', d => x(d.superhostPercent) + 10) 
        .attr('y', d => y(d.city) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .text(d => `${d.superhostPercent.toFixed(0)}%`);

  }, [loading, error, citySuperhostData, overallAverage]);

  const getInsightText = () => {
    if (loading) return 'Calculating...';
    if (error) return 'Error loading data.';
    if (citySuperhostData.length === 0) return 'Not enough data for insights.';

    if (userSuperhostPreference === 'superhost_only') {
      return `You prefer Superhosts! On average, ${overallAverage.toFixed(0)}% of listings in these cities are by Superhosts. Cities with higher concentrations are shown.`;
    } else {
      return `Superhosts make up an average of ${overallAverage.toFixed(0)}% of listings across these cities. See how each city compares below.`;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-8 leading-tight">{getInsightText()}</h2>

      {loading && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <div 
          ref={d3Container} 
          className="w-full bg-gray-100 rounded-lg shadow" 
          style={{ minHeight: '300px' }} 
        >
          {/* D3 chart will be rendered here */} 
        </div>
      )}
    </div>
  );
};

export default SuperhostDistributionChart; 