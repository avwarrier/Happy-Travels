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
              d3.csv(weekdayPath),  // Load CSV data for weekdays
              d3.csv(weekendPath)   // Load CSV data for weekends
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
              const avgScore = d3.mean(cityScores);  // Calculate average satisfaction score
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

    // Calculate data bounds using D3
    const allScores = cityData.map(d => d.averageSatisfaction);
    const dataMinScore = d3.min(allScores) ?? 0;  // Get minimum score
    const dataMaxScore = d3.max(allScores) ?? 100;  // Get maximum score

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

    // Create scales for data mapping
    const x = d3.scaleLinear()  // Create linear scale for satisfaction scores
      .domain([xDomainMin, xDomainMax])
      .range([0, width]);

    const y = d3.scaleBand()  // Create band scale for city names
      .domain(cityData.map(d => d.city))
      .range([0, chartHeight])
      .paddingInner(barPadding / (barHeight + barPadding))
      .paddingOuter(0.1);

    // Create and style X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d.toFixed(0)}`))  // Create bottom axis with 5 ticks
      .selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 55)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('opacity', 0)
      .text('Average Guest Satisfaction Score')
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

    // Create bars with D3 transitions and interactions
    svg.selectAll('.bar')
      .data(cityData)
      .join('rect')
        .attr('class', 'bar')
        .attr('x', x(xDomainMin > 0 ? xDomainMin: 0))
        .attr('y', d => y(d.city))
        .attr('width', 0) // Start with width 0
        .attr('height', y.bandwidth())
        .attr('fill', (d, i) => {
          if (d.averageSatisfaction >= userMinSatisfaction) {
            const gradientColors = ['#FF8DA0', '#FF6B85', '#E51D51', '#E51D51', '#D90865'];
            const index = cityData.findIndex(city => city.city === d.city);
            const normalizedIndex = index / (cityData.length - 1);
            const colorIndex = Math.floor(normalizedIndex * (gradientColors.length - 1));
            return gradientColors[colorIndex];
          }
          return '#A9A9A9';
        })
        .attr('stroke', '#191919')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8);

          tooltip.transition()
            .duration(200)
            .style('opacity', 1);

          const isAboveMin = d.averageSatisfaction >= userMinSatisfaction;
          const diffFromMin = Math.abs(d.averageSatisfaction - userMinSatisfaction).toFixed(1);
          const percentage = ((d.averageSatisfaction / 100) * 100).toFixed(1);
          
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666; margin-bottom: 2px;">Satisfaction Score: ${d.averageSatisfaction.toFixed(1)}/100</div>
            <div style="color: #666; margin-bottom: 2px;">Top ${percentage}% of satisfaction</div>
            <div style="color: ${isAboveMin ? '#2E7D32' : '#D32F2F'}">
              ${isAboveMin 
                ? `✓ ${diffFromMin} points above your minimum`
                : `✗ ${diffFromMin} points below your minimum`
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
            .attr('opacity', 1);

          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100) // Stagger the animations
        .ease(d3.easeCubicInOut)
        .attr('width', d => x(d.averageSatisfaction) - x(xDomainMin > 0 ? xDomainMin: 0));

    // Create value labels with D3 transitions
    svg.selectAll('.bar-label')
      .data(cityData)
      .join('text')
        .attr('class', 'bar-label')
        .attr('x', x(xDomainMin > 0 ? xDomainMin: 0)) // Start from left
        .attr('y', d => y(d.city) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .text(d => d.averageSatisfaction.toFixed(1))
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400) // Stagger and delay after bars
        .ease(d3.easeCubicInOut)
        .attr('x', d => x(d.averageSatisfaction) + 5)
        .style('opacity', 1);

    // Create minimum satisfaction line with D3 transitions
    if (userMinSatisfaction >= xDomainMin && userMinSatisfaction <= xDomainMax) {
      svg.append('line')
        .attr('x1', x(xDomainMin > 0 ? xDomainMin: 0)) // Start from left
        .attr('y1', 0)
        .attr('x2', x(xDomainMin > 0 ? xDomainMin: 0)) // Start from left
        .attr('y2', chartHeight)
        .attr('stroke', '#555555')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .transition()
        .duration(800)
        .delay(800) // After bars and labels
        .ease(d3.easeCubicInOut)
        .attr('x1', x(userMinSatisfaction))
        .attr('x2', x(userMinSatisfaction));

      svg.append('text')
        .attr('x', x(xDomainMin > 0 ? xDomainMin: 0)) // Start from left
        .attr('y', -5)
        .attr('text-anchor', 'start')
        .style('font-size', '10px')
        .style('fill', '#000000')
        .style('opacity', 0)
        .text(`Your Min: ${userMinSatisfaction.toFixed(0)}`)
        .transition()
        .duration(800)
        .delay(1000) // After the line
        .ease(d3.easeCubicInOut)
        .attr('x', x(userMinSatisfaction) + 4)
        .style('opacity', 1);
    }

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [loading, error, cityData, userMinSatisfaction]);


  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">
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
      <p className="text-[16px] text-gray-500 mb-8 -mt-2">Hover over the data for more information</p>

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