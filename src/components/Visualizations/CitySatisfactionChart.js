import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const CitySatisfactionChart = ({ userMinSatisfaction }) => {
  const d3Container = useRef(null);
  const [cityData, setCityData] = useState([]); // Stores {city, averageSatisfaction}
  const [passPercentage, setPassPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];

  // 1. Initial Data Fetching for Average Satisfaction
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      let processedData = [];
      try {
        for (const city of cities) {
          const weekdayPath = `/data/${city}_weekdays.csv`;
          const weekendPath = `/data/${city}_weekends.csv`;
          let cityScores = [];
          try {
            const [weekdayData, weekendData] = await Promise.all([
              d3.csv(weekdayPath),
              d3.csv(weekendPath)
            ]);
            const extractScores = (data) => {
              if (data) {
                data.forEach(d => {
                  const score = parseFloat(d.guest_satisfaction_overall);
                  if (!isNaN(score)) cityScores.push(score);
                });
              }
            };
            extractScores(weekdayData);
            extractScores(weekendData);
            if (cityScores.length > 0) {
              const avgScore = d3.mean(cityScores);
              processedData.push({ city: city.charAt(0).toUpperCase() + city.slice(1), averageSatisfaction: avgScore });
            } else {
              console.warn(`No guest_satisfaction_overall data for ${city}`);
            }
          } catch (cityError) {
            console.error(`Error fetching guest_satisfaction_overall for ${city}:`, cityError);
          }
        }
        // Sort cities by average satisfaction in ascending order (lowest to highest)
        processedData.sort((a, b) => a.averageSatisfaction - b.averageSatisfaction);
        setCityData(processedData);
      } catch (err) {
        console.error('Error processing base guest_satisfaction_overall data:', err);
        setError('Failed to load or process satisfaction data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []); // Runs once on mount

  // 2. Calculate Pass Percentage
  useEffect(() => {
    if (cityData.length === 0) {
      setPassPercentage(0);
      return;
    }
    const passingCitiesCount = cityData.filter(c => c.averageSatisfaction >= userMinSatisfaction).length;
    const totalCitiesWithData = cityData.length;
    setPassPercentage(totalCitiesWithData > 0 ? Math.round((passingCitiesCount / totalCitiesWithData) * 100) : 0);
  }, [cityData, userMinSatisfaction]);

  // 3. D3.js Visualization (Horizontal Bar Chart)
  useEffect(() => {
    if (loading || error || !d3Container.current || cityData.length === 0) {
      if(d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      if (d3Container.current && !loading && !error && cityData.length === 0) {
        const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
        tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle')
                 .text('No satisfaction data available to display.');
      }
      return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 60, bottom: 50, left: 100 }; // right margin for bar labels
    const containerWidth = d3Container.current.clientWidth;
    
    const barHeight = 20; // Height of each bar
    const barPadding = 5; // Padding between bars
    const calculatedChartHeight = cityData.length * (barHeight + barPadding) - barPadding; // Total height for bars
    const chartHeight = Math.max(200, calculatedChartHeight); // Min height for the chart area

    const svgHeight = chartHeight + margin.top + margin.bottom;
    const width = containerWidth - margin.left - margin.right;

    const svg = d3.select(d3Container.current)
      .append('svg')
        .attr('width', containerWidth)
        .attr('height', svgHeight)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const allScores = cityData.map(d => d.averageSatisfaction);
    const dataMinScore = d3.min(allScores) ?? 0;
    const dataMaxScore = d3.max(allScores) ?? 100;

    // Dynamic X-axis domain
    let xDomainMin = Math.min(dataMinScore, userMinSatisfaction);
    let xDomainMax = Math.max(dataMaxScore, userMinSatisfaction);
    const domainBuffer = (xDomainMax - xDomainMin) * 0.1; // 10% buffer or a fixed value
    xDomainMin = Math.max(0, xDomainMin - (domainBuffer > 0 ? domainBuffer : 2)); // Ensure some buffer, min 0
    xDomainMax = Math.min(100, xDomainMax + (domainBuffer > 0 ? domainBuffer : 2)); // Ensure some buffer, max 100
    if (xDomainMin >= xDomainMax) { // Handle edge case where min might exceed max after buffer adjustment
        xDomainMin = Math.max(0, xDomainMax - 5); 
    }
    if (xDomainMin === xDomainMax) { // if all values are identical
      xDomainMin = Math.max(0, xDomainMin - 5);
      xDomainMax = Math.min(100, xDomainMax + 5);
    }

    const x = d3.scaleLinear()
      .domain([xDomainMin, xDomainMax])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(cityData.map(d => d.city))
      .range([0, chartHeight])
      .paddingInner(barPadding / (barHeight + barPadding)) // Calculate padding based on desired px
      .paddingOuter(0.1);

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d.toFixed(0)}`))
      .append('text')
        .attr('x', width / 2)
        .attr('y', margin.bottom - 10)
        .attr('fill', '#000')
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .text('Average Guest Satisfaction Score');
        
    // Y-axis (City Names)
    svg.append('g').call(d3.axisLeft(y));

    // Bars
    svg.selectAll('.bar')
      .data(cityData)
      .join('rect')
        .attr('class', 'bar')
        .attr('x', x(xDomainMin > 0 ? xDomainMin: 0))
        .attr('y', d => y(d.city))
        .attr('width', d => x(d.averageSatisfaction) - x(xDomainMin > 0 ? xDomainMin: 0))
        .attr('height', y.bandwidth())
        .attr('fill', (d, i) => {
          if (d.averageSatisfaction >= userMinSatisfaction) {
            // Create gradient effect based on position in the sorted array
            const gradientColors = ['#FF8DA0', '#FF6B85', '#E51D51', '#E51D51', '#D90865'];
            const index = cityData.findIndex(city => city.city === d.city);
            const normalizedIndex = index / (cityData.length - 1); // 0 to 1
            const colorIndex = Math.floor(normalizedIndex * (gradientColors.length - 1));
            return gradientColors[colorIndex];
          }
          return '#A9A9A9'; // Grey for scores below minimum
        })
        .attr('stroke', '#191919')
        .attr('stroke-width', 0.5);

    // Value Labels on Bars
    svg.selectAll('.bar-label')
      .data(cityData)
      .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.averageSatisfaction) + 5) 
        .attr('y', d => y(d.city) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .text(d => d.averageSatisfaction.toFixed(1));

    // User Min Satisfaction Line
    if (userMinSatisfaction >= xDomainMin && userMinSatisfaction <= xDomainMax) {
        svg.append('line')
        .attr('x1', x(userMinSatisfaction))
        .attr('y1', 0)
        .attr('x2', x(userMinSatisfaction))
        .attr('y2', chartHeight)
        .attr('stroke', '#555555')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');

        svg.append('text')
        .attr('x', x(userMinSatisfaction) + 4)
        .attr('y', -5)
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#000000')
        .text(`Your Min: ${userMinSatisfaction.toFixed(0)}`);
    }


  }, [loading, error, cityData, userMinSatisfaction]);


  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-8 leading-tight">
        {loading ? 'Calculating...' : error ? 'Error loading data.' :
          (cityData.length > 0 ? 
            (passPercentage === 100 ? 
                'All cities meet that rating.' :
                `${passPercentage}% of cities meet that rating.` 
            ) : 
            'No satisfaction data available to display.'
          )
        }
      </h2>

      {loading && <div className="w-full h-[300px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[300px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <div 
          ref={d3Container} 
          className="w-full bg-gray-100 rounded-lg shadow" 
          style={{ minHeight: '250px' }} 
        >
          {/* D3 chart will be rendered here */} 
        </div>
      )}
    </div>
  );
};

export default CitySatisfactionChart; 