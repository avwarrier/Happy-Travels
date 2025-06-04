import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Conceptually, this is now a Dot Plot / Lollipop Chart
const CityCleanlinessBarChart = ({ userMinCleanliness }) => {
  const d3Container = useRef(null);
  const [cityAverageCleanlinessData, setCityAverageCleanlinessData] = useState([]);
  const [passPercentage, setPassPercentage] = useState(0);
  const [grandAverageCleanliness, setGrandAverageCleanliness] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];

  // Data fetching and processing effect
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let processedCityAverages = [];
      let allScoresForGrandAverage = [];

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
            if (weekdayData) weekdayData.forEach(d => { const score = parseFloat(d.cleanliness_rating); if (!isNaN(score)) { cityScores.push(score); allScoresForGrandAverage.push(score); } });
            if (weekendData) weekendData.forEach(d => { const score = parseFloat(d.cleanliness_rating); if (!isNaN(score)) { cityScores.push(score); allScoresForGrandAverage.push(score); } });
            
            if (cityScores.length > 0) {
              const cityAvg = d3.mean(cityScores);
              processedCityAverages.push({ city: city.charAt(0).toUpperCase() + city.slice(1), average: cityAvg });
            } else {
              console.warn(`No cleanliness data for ${city}`);
              processedCityAverages.push({ city: city.charAt(0).toUpperCase() + city.slice(1), average: 0 });
            }
          } catch (cityError) {
            console.error(`Error fetching cleanliness data for ${city}:`, cityError);
            processedCityAverages.push({ city: city.charAt(0).toUpperCase() + city.slice(1), average: 0 });
          }
        }
        
        processedCityAverages.sort((a,b) => b.average - a.average);
        setCityAverageCleanlinessData(processedCityAverages);

        if (allScoresForGrandAverage.length > 0) {
          setGrandAverageCleanliness(d3.mean(allScoresForGrandAverage) || 0);
        } else {
          setGrandAverageCleanliness(0);
        }

        if (processedCityAverages.length > 0) {
          const passingCities = processedCityAverages.filter(c => c.average >= userMinCleanliness).length;
          setPassPercentage(Math.round((passingCities / processedCityAverages.length) * 100));
        } else {
            setPassPercentage(0);
        }
        
      } catch (err) {
        console.error('Error processing cleanliness data:', err);
        setError('Failed to load or process cleanliness data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userMinCleanliness]);

  // D3 rendering effect for Dot Plot / Lollipop Chart
  useEffect(() => {
    if (loading || error || !d3Container.current ) {
      if(d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      return;
    }
    if (cityAverageCleanlinessData.length === 0 && !loading && !error) {
        d3.select(d3Container.current).selectAll('*').remove();
        const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
        tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No data to display.');
        return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 70, left: 50 }; 
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

    const x = d3.scaleBand()
      .domain(cityAverageCleanlinessData.map(d => d.city))
      .range([0, width])
      .padding(0.5); // Adjust padding for dots

    // Determine dynamic Y-axis domain
    let yAxisMin = 0;
    const allAverages = cityAverageCleanlinessData.map(d => d.average);
    if (allAverages.length > 0) {
      const minDataVal = d3.min(allAverages);
      if (minDataVal !== undefined) { // Ensure minDataVal is a number
        yAxisMin = Math.max(0, minDataVal - 1); // Start 1 unit below min, but not less than 0
      }
    }
    // Ensure yAxisMin is not too close to 10 if all values are 10, provide some range.
    if (yAxisMin >= 9.5 && d3.max(allAverages) === 10) { // if min is 9.5 or more, and max is 10
        yAxisMin = Math.max(0, 10 - (d3.max(allAverages) - d3.min(allAverages) || 0) -1); // Adjust based on actual data range, ensuring at least 1 unit range if possible
        if (yAxisMin > 8.5) yAxisMin = 8.5; // Cap to ensure some space if all are 10 or very close
    }
    if (yAxisMin >= 9 && d3.max(allAverages) === 10 && d3.min(allAverages) === 10) yAxisMin = 9; // if all are 10, show 9-10

    const y = d3.scaleLinear()
      .domain([yAxisMin, 10]) // Dynamic min, fixed max at 10
      .range([height, 0]);

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '10px')
        .style('fill', '#191919');

    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d))
      .selectAll('text').style('font-size', '10px')
      .style('fill', '#191919');

    // Lollipop sticks (vertical lines)
    svg.selectAll('.stick')
      .data(cityAverageCleanlinessData)
      .join('line')
        .attr('class', 'stick')
        .attr('x1', d => x(d.city) + x.bandwidth() / 2) // Center of the band
        .attr('x2', d => x(d.city) + x.bandwidth() / 2)
        .attr('y1', height) // Start from x-axis
        .attr('y2', d => y(d.average))
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);

    // Dots
    svg.selectAll('.dot')
      .data(cityAverageCleanlinessData)
      .join('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.city) + x.bandwidth() / 2) // Center of the band
        .attr('cy', d => y(d.average))
        .attr('r', 5) // Radius of the dot
        .attr('fill', d => {
          if (d.average < userMinCleanliness) return '#A9A9A9';
          if (d.average >= grandAverageCleanliness) return '#E51D51';
          return '#D90865';
        });

    // Horizontal line for userMinCleanliness
    if (userMinCleanliness !== null && y(userMinCleanliness) >=0 && y(userMinCleanliness) <= height) {
      svg.append('line')
        .attr('x1', 0).attr('y1', y(userMinCleanliness))
        .attr('x2', width).attr('y2', y(userMinCleanliness))
        .attr('stroke', '#555555').attr('stroke-width', 2).attr('stroke-dasharray', '5,5');
      svg.append('text')
        .attr('x', width - 5).attr('y', y(userMinCleanliness) - 5)
        .attr('text-anchor', 'end').style('font-size', '10px').style('fill', '#191919')
        .text(`Your min: ${userMinCleanliness.toFixed(1)}`);
    }
    
    // Horizontal line for Grand Average Cleanliness
    if (grandAverageCleanliness > 0 && y(grandAverageCleanliness) >=0 && y(grandAverageCleanliness) <= height) {
        svg.append('line')
          .attr('x1', 0).attr('y1', y(grandAverageCleanliness))
          .attr('x2', width).attr('y2', y(grandAverageCleanliness))
          .attr('stroke', '#555555').attr('stroke-width', 1.5).attr('stroke-dasharray', '2,2');
        svg.append('text')
          .attr('x', 5).attr('y', y(grandAverageCleanliness) - 5)
          .attr('text-anchor', 'start').style('font-size', '10px').style('fill', '#555555')
          .text(`Typical Avg: ${grandAverageCleanliness.toFixed(1)}`);
    }

  }, [loading, error, cityAverageCleanlinessData, userMinCleanliness, grandAverageCleanliness]);

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-8 leading-tight">
        {loading ? 'Calculating...' : error ? 'Error loading data.' : `${passPercentage}% of cities hit that sparkle level.`}
      </h2>

      {loading && <div className="w-full h-[300px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[300px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <div 
          ref={d3Container} 
          className="w-full h-[300px] bg-gray-100 rounded-lg shadow"
          style={{ minHeight: '250px' }} 
        >
          {/* D3 chart will be rendered here */} 
        </div>
      )}
    </div>
  );
};

// Ensure to export with the new conceptual name if file is renamed.
// export default CityCleanlinessBarChart;
export default CityCleanlinessBarChart; // Assuming file is renamed or this is the desired export name 