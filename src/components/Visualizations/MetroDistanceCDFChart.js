import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MetroDistanceCDFChart = ({ userMetroDistance }) => {
  const d3Container = useRef(null);
  const [cityMedianDistances, setCityMedianDistances] = useState([]);
  const [cdfData, setCdfData] = useState([]);
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
          let cityMetroDistances = [];

          try {
            const [weekdayData, weekendData] = await Promise.all([
              d3.csv(weekdayPath),
              d3.csv(weekendPath)
            ]);

            const extractDistances = (data) => {
              if (data) {
                data.forEach(d => {
                  const dist = parseFloat(d.metro_dist);
                  if (!isNaN(dist)) {
                    cityMetroDistances.push(dist);
                  }
                });
              }
            };
            extractDistances(weekdayData);
            extractDistances(weekendData);

            if (cityMetroDistances.length > 0) {
              const medianDist = d3.median(cityMetroDistances);
              processedMedianDistances.push({ city: city.charAt(0).toUpperCase() + city.slice(1), medianDistance: medianDist });
            } else {
              console.warn(`No metro_dist data for ${city}`);
              processedMedianDistances.push({ city: city.charAt(0).toUpperCase() + city.slice(1), medianDistance: Infinity }); // Handle missing data
            }
          } catch (cityError) {
            console.error(`Error fetching metro_dist data for ${city}:`, cityError);
            processedMedianDistances.push({ city: city.charAt(0).toUpperCase() + city.slice(1), medianDistance: Infinity });
          }
        }

        processedMedianDistances.sort((a, b) => a.medianDistance - b.medianDistance);
        setCityMedianDistances(processedMedianDistances.filter(c => isFinite(c.medianDistance))); // Filter out Infinity if any city had no data

      } catch (err) {
        console.error('Error processing metro_dist data:', err);
        setError('Failed to load or process metro distance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Fetch data once on mount

  // 2. Calculate CDF and Pass Percentage
  useEffect(() => {
    if (cityMedianDistances.length === 0) {
      setCdfData([]);
      setPassPercentage(0);
      return;
    }

    const totalCities = cityMedianDistances.length;
    // Map cityMedianDistances to include city names in the points for labeling
    const cdfPointsWithCities = cityMedianDistances.map((d, i) => ({
      city: d.city, // Include city name
      distance: d.medianDistance,
      cdfValue: (i + 1) / totalCities
    }));
    
    let finalCdfDataForChart = [...cdfPointsWithCities];

    // Add a point at the beginning (0,0) if the first city's distance > 0 for a proper CDF start from y=0
    if (finalCdfDataForChart.length > 0 && finalCdfDataForChart[0].distance > 0) {
        finalCdfDataForChart.unshift({ distance: 0, cdfValue: 0, city: ''}); // Add city: '' for consistent shape
    } else if (finalCdfDataForChart.length > 0 && finalCdfDataForChart[0].distance === 0) {
        // If first city is at 0, it's already the first point. Ensure no duplicate (0,0) unless intended for step.
        // The current logic (i+1)/totalCities for cdfValue handles this fine.
        // If we want the line to explicitly start at (0,0) and then jump to (0, 1/N), another point might be needed.
        // For now, assuming the step from (0,0) to (0, 1/N) is fine if the first city is at 0km.
    }

    setCdfData(finalCdfDataForChart);

    const passingCities = cityMedianDistances.filter(c => c.medianDistance <= userMetroDistance).length;
    setPassPercentage(totalCities > 0 ? Math.round((passingCities / totalCities) * 100) : 0);

  }, [cityMedianDistances, userMetroDistance]);


  // 3. D3.js Visualization
  useEffect(() => {
    if (loading || error || !d3Container.current || cdfData.length === 0) {
      if(d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
       if (d3Container.current && !loading && !error && cdfData.length === 0 && cityMedianDistances.length > 0) {
         const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
         tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('Not enough data to draw CDF.');
       }
      return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 50, bottom: 60, left: 60 };
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

    const maxDistanceInData = d3.max(cdfData, d => d.distance);
    const xMax = Math.max(maxDistanceInData || 0, userMetroDistance || 0, 1);

    const x = d3.scaleLinear()
      .domain([0, xMax * 1.05])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // X-axis with animation
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d.toFixed(1)}km`))
      .selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    svg.append('text')
      .attr('x', width / 2 - 180)
      .attr('y', margin.bottom - 60)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('opacity', 0)
      .text('Median Metro Distance (km)')
      .transition()
      .duration(800)
      .style('opacity', 1);

    // Y-axis with animation
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0%')))
      .selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('opacity', 0)
      .text('Cumulative Proportion of Cities')
      .transition()
      .duration(800)
      .style('opacity', 1);

    // CDF Line with animation
    const line = d3.line()
      .x(d => x(d.distance))
      .y(d => y(d.cdfValue))
      .curve(d3.curveStepAfter);

    const path = svg.append('path')
      .datum(cdfData)
      .attr('fill', 'none')
      .attr('stroke', '#E51D51')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Animate the path drawing
    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0);

    // Area fill with animation
    const area = d3.area()
      .x(d => x(d.distance))
      .y0(height)
      .y1(d => y(d.cdfValue))
      .curve(d3.curveStepAfter)
      .defined(d => d.distance <= userMetroDistance);

    const areaPath = svg.append('path')
      .datum(cdfData.filter(d => d.distance <= userMetroDistance + 0.0001))
      .attr('fill', '#E51D51')
      .attr('opacity', 0)
      .attr('d', area)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicInOut)
      .attr('opacity', 0.1);

    // User Cutoff Line with animation
    if (userMetroDistance !== null && isFinite(userMetroDistance) && x(userMetroDistance) >= 0 && x(userMetroDistance) <= width) {
      svg.append('line')
        .attr('x1', x(userMetroDistance))
        .attr('y1', 0)
        .attr('x2', x(userMetroDistance))
        .attr('y2', 0) // Start from top
        .attr('stroke', '#555555')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr('y2', height);

      svg.append('text')
        .attr('x', x(userMetroDistance) + 5)
        .attr('y', 0) // Start from top
        .attr('fill', '#191919')
        .style('font-size', '10px')
        .style('opacity', 0)
        .text(`Your max: ${userMetroDistance.toFixed(1)}km`)
        .transition()
        .duration(800)
        .delay(400)
        .attr('y', y(1) + 15)
        .style('opacity', 1);
    }

    // Add City Labels with animation and tooltips
    svg.selectAll('.city-label')
      .data(cdfData.filter(d => d.city))
      .join('text')
        .attr('class', 'city-label')
        .attr('x', d => x(d.distance) + 6)
        .attr('y', height) // Start from bottom
        .attr('text-anchor', 'start')
        .style('font-size', '9px')
        .style('fill', '#333333')
        .style('opacity', 0)
        .style('cursor', 'pointer')
        .text(d => d.city)
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('font-size', '11px')
            .style('fill', '#E51D51');

          tooltip.transition()
            .duration(200)
            .style('opacity', 1);

          const percentage = (d.cdfValue * 100).toFixed(0);
          const isWithinRange = d.distance <= userMetroDistance;
          
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666; margin-bottom: 2px;">Median Distance: ${d.distance.toFixed(2)}km</div>
            <div style="color: #666; margin-bottom: 2px;">Top ${percentage}% of cities</div>
            <div style="color: ${isWithinRange ? '#2E7D32' : '#D32F2F'}">
              ${isWithinRange 
                ? `✓ Within your ${userMetroDistance}km range`
                : `✗ Outside your ${userMetroDistance}km range`
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
            .style('font-size', '9px')
            .style('fill', '#333333');

          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100) // Stagger the animations
        .attr('y', d => y(d.cdfValue) - 6)
        .style('opacity', 1);

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [loading, error, cdfData, userMetroDistance, cityMedianDistances]); // cityMedianDistances added for the no data message condition

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">
        {loading ? 'Calculating...' : error ? 'Error loading data.' :
         (cityMedianDistances.length > 0 ? 
            (passPercentage === 100 ? 
                'All cities are that compact.' : 
                `Only ${passPercentage}% of cities are that compact.`
            ) : 
            'Not enough data for insights.'
         )
        }
      </h2>
      <p className="text-[16px] text-gray-500 mb-8 -mt-2">Hover over the data for more information</p>

      {loading && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <div 
          ref={d3Container} 
          className="w-full h-[350px] bg-gray-100 rounded-lg shadow" // Increased height for CDF
          style={{ minHeight: '300px' }} 
        >
          {/* D3 chart will be rendered here */} 
        </div>
      )}
    </div>
  );
};

export default MetroDistanceCDFChart; 