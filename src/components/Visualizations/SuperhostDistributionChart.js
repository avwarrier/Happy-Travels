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
              d3.csv(weekdayPath),  // Load CSV data for weekdays
              d3.csv(weekendPath)   // Load CSV data for weekends
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

    // Create tooltip using D3
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

    // Create scales for data mapping
    const x = d3.scaleLinear()  // Create linear scale for percentages
      .domain([0, 100])
      .range([0, width]);

    const y = d3.scaleBand()  // Create band scale for city names
      .domain(citySuperhostData.map(d => d.city))
      .range([0, chartHeight])
      .padding(0.4);

    // Create and style X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))  // Create bottom axis with percentage format
      .selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 55)
      .attr('fill', '#191919')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('opacity', 0)
      .text('Percentage of Superhost Listings')
      .transition()
      .duration(800)
      .style('opacity', 1);
        
    // Create and style Y-axis
    svg.append('g')
      .call(d3.axisLeft(y))  // Create left axis for city names
      .selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100) // Stagger the animations
        .style('opacity', 1);

    // Create average line with D3 transitions
    svg.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#555555')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .transition()
      .duration(800)
      .delay(800)
      .ease(d3.easeCubicInOut)
      .attr('x1', x(overallAverage))
      .attr('x2', x(overallAverage));

    svg.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .style('font-size', '10px')
      .style('fill', '#191919')
      .style('opacity', 0)
      .text(`Avg: ${overallAverage.toFixed(0)}%`)
      .transition()
      .duration(800)
      .delay(1000) // After the line
      .ease(d3.easeCubicInOut)
      .attr('x', x(overallAverage) + 4)
      .style('opacity', 1);

    // Create dots with D3 transitions and interactions
    svg.selectAll('.dot')
      .data(citySuperhostData)
      .join('circle')
        .attr('class', 'dot')
        .attr('cx', 0)
        .attr('cy', d => y(d.city) + y.bandwidth() / 2)
        .attr('r', 0)
        .attr('fill', d => {
          const percent = d.superhostPercent;
          if (percent <= 33) return '#FF8DA0';
          if (percent <= 66) return '#E51D51';
          return '#D90865';
        })
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('stroke', '#191919')
            .attr('stroke-width', 1.5);

          tooltip.transition()
            .duration(200)
            .style('opacity', 1);

          const isAboveAvg = d.superhostPercent > overallAverage;
          const diffFromAvg = Math.abs(d.superhostPercent - overallAverage).toFixed(1);
          
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666; margin-bottom: 2px;">Superhost Listings: ${d.superhostPercent.toFixed(1)}%</div>
            <div style="color: ${isAboveAvg ? '#2E7D32' : '#D32F2F'}">
              ${isAboveAvg 
                ? `✓ ${diffFromAvg}% above average`
                : `✗ ${diffFromAvg}% below average`
              }
            </div>
            ${userSuperhostPreference === 'superhost_only' ? 
              `<div style="color: #666; margin-top: 4px;">Matches your Superhost preference</div>` : 
              ''
            }
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)
            .attr('stroke', 'none');

          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400) // Stagger and delay after axes
        .ease(d3.easeCubicInOut)
        .attr('cx', d => x(d.superhostPercent))
        .attr('r', 6);

    // Create value labels with D3 transitions
    svg.selectAll('.dot-label')
      .data(citySuperhostData)
      .join('text')
        .attr('class', 'dot-label')
        .attr('x', 0)
        .attr('y', d => y(d.city) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .text(d => `${d.superhostPercent.toFixed(0)}%`)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 600)
        .ease(d3.easeCubicInOut)
        .attr('x', d => x(d.superhostPercent) + 10)
        .style('opacity', 1);

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [loading, error, citySuperhostData, overallAverage, userSuperhostPreference]);

  const getInsightText = () => {
    if (loading) return 'Calculating...';
    if (error) return 'Error loading data.';
    if (citySuperhostData.length === 0) return 'Not enough data for insights.';

    if (userSuperhostPreference === 'superhost_only') {
      return `You prefer Superhosts! On average, ${overallAverage.toFixed(0)}% of listings in these cities are by Superhosts.`;
    } else {
      return `Superhosts make up an average of ${overallAverage.toFixed(0)}% of listings across these cities. See how each city compares below.`;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">{getInsightText()}</h2>
      <p className="text-[16px] text-gray-500 mb-8 -mt-2">Hover over the data for more information</p>

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