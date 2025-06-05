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
    
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 55)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('opacity', 0)
      .text('Median Cleanliness Score')
      .transition()
      .duration(800)
      .style('opacity', 1);

    // Add tooltip div
    const tooltip = d3.select(d3Container.current)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border-radius', '8px')
      .style('padding', '12px')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('transition', 'opacity 0.2s ease-in-out')
      .style('z-index', 1000);

    const x = d3.scaleBand()
      .domain(cityAverageCleanlinessData.map(d => d.city))
      .range([0, width])
      .padding(0.5);

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

    // X-axis with animation
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    // Y-axis with animation
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d))
      .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    // Lollipop sticks (vertical lines) with animation
    svg.selectAll('.stick')
      .data(cityAverageCleanlinessData)
      .join('line')
        .attr('class', 'stick')
        .attr('x1', d => x(d.city) + x.bandwidth() / 2)
        .attr('x2', d => x(d.city) + x.bandwidth() / 2)
        .attr('y1', height)
        .attr('y2', height) // Start from bottom
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .transition()
        .duration(800)
        .delay((d, i) => i * 180)
        .ease(d3.easeCubicInOut)
        .attr('y2', d => y(d.average));

    // Dots with animation and tooltips
    svg.selectAll('.dot')
      .data(cityAverageCleanlinessData)
      .join('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.city) + x.bandwidth() / 2)
        .attr('cy', height) // Start from bottom
        .attr('r', 0) // Start with radius 0
        .attr('fill', d => {
          if (d.average < userMinCleanliness) return '#A9A9A9';
          if (d.average >= grandAverageCleanliness) return '#E51D51';
          return '#D90865';
        })
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 7); // Slightly larger on hover

          tooltip.transition()
            .duration(200)
            .style('opacity', 1);

          const isAboveMin = d.average >= userMinCleanliness;
          const isAboveAvg = d.average >= grandAverageCleanliness;
          const diffFromMin = Math.abs(d.average - userMinCleanliness).toFixed(1);
          const diffFromAvg = Math.abs(d.average - grandAverageCleanliness).toFixed(1);
          
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666; margin-bottom: 2px;">Cleanliness Score: ${d.average.toFixed(1)}/10</div>
            <div style="color: ${isAboveMin ? '#2E7D32' : '#D32F2F'}">
              ${isAboveMin 
                ? `✓ ${diffFromMin} points above your minimum`
                : `✗ ${diffFromMin} points below your minimum`
              }
            </div>
            <div style="color: ${isAboveAvg ? '#2E7D32' : '#D32F2F'}">
              ${isAboveAvg 
                ? `✓ ${diffFromAvg} points above typical average`
                : `✗ ${diffFromAvg} points below typical average`
              }
            </div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5);

          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 180 + 120)
        .ease(d3.easeCubicInOut)
        .attr('cy', d => y(d.average))
        .attr('r', 5);

    // City labels (if any, e.g. value labels) - staggered after dots
    svg.selectAll('.dot-label')
      .data(cityAverageCleanlinessData)
      .join('text')
        .attr('class', 'dot-label')
        .attr('x', d => x(d.city) + x.bandwidth() / 2 + 8)
        .attr('y', height)
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .text(d => d.average.toFixed(1))
        .transition()
        .duration(800)
        .delay((d, i) => i * 180 + 300)
        .ease(d3.easeCubicInOut)
        .attr('y', d => y(d.average) + 3)
        .style('opacity', 1);

    // Horizontal line for userMinCleanliness with animation
    if (userMinCleanliness !== null && y(userMinCleanliness) >= 0 && y(userMinCleanliness) <= height) {
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', height) // Start from bottom
        .attr('x2', 0) // Start from left
        .attr('y2', height)
        .attr('stroke', '#555555')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr('x2', width)
        .attr('y1', y(userMinCleanliness))
        .attr('y2', y(userMinCleanliness));

      svg.append('text')
        .attr('x', width - 5)
        .attr('y', height) // Start from bottom
        .attr('text-anchor', 'end')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .text(`Your min: ${userMinCleanliness.toFixed(1)}`)
        .transition()
        .duration(800)
        .delay(400)
        .attr('y', y(userMinCleanliness) - 5)
        .style('opacity', 1);
    }
    
    // Horizontal line for Grand Average Cleanliness with animation
    if (grandAverageCleanliness > 0 && y(grandAverageCleanliness) >= 0 && y(grandAverageCleanliness) <= height) {
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', height) // Start from bottom
        .attr('x2', 0) // Start from left
        .attr('y2', height)
        .attr('stroke', '#555555')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '2,2')
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr('x2', width)
        .attr('y1', y(grandAverageCleanliness))
        .attr('y2', y(grandAverageCleanliness));

      svg.append('text')
        .attr('x', 5)
        .attr('y', height) // Start from bottom
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#555555')
        .style('opacity', 0)
        .text(`Typical Avg: ${grandAverageCleanliness.toFixed(1)}`)
        .transition()
        .duration(800)
        .delay(400)
        .attr('y', y(grandAverageCleanliness) - 5)
        .style('opacity', 1);
    }

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [loading, error, cityAverageCleanlinessData, userMinCleanliness, grandAverageCleanliness]);

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">
        {loading ? 'Calculating...' : error ? 'Error loading data.' : `${passPercentage}% of cities hit that sparkle level.`}
      </h2>
      <p className="text-[16px] text-gray-500 mb-8 -mt-2">Hover over the data for more information</p>

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