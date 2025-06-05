import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const PersonCapacityChart = ({ userSelectedCapacity }) => {
  const d3Container = useRef(null);
  const tooltipRef = useRef(null);
  const [histogramData, setHistogramData] = useState([]);
  const [cityAverageCapacities, setCityAverageCapacities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];
  const capacityBinsDefinition = [
    { label: '1', minValue: 1, maxValue: 1 },
    { label: '2', minValue: 2, maxValue: 2 },
    { label: '3', minValue: 3, maxValue: 3 },
    { label: '4', minValue: 4, maxValue: 4 },
    { label: '5', minValue: 5, maxValue: 5 },
    { label: '6+', minValue: 6, maxValue: Infinity },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const cityDataPromises = cities.map(async (city) => {
        const weekdayPath = `/data/${city}_weekdays.csv`;
        const weekendPath = `/data/${city}_weekends.csv`;
        try {
          const [weekdayData, weekendData] = await Promise.all([
            d3.csv(weekdayPath),  // Load CSV data for weekdays
            d3.csv(weekendPath)   // Load CSV data for weekends
          ]);
          const combinedData = [...(weekdayData || []), ...(weekendData || [])];
          const capacitiesInCity = combinedData
            .map(d => parseFloat(d.person_capacity))
            .filter(cap => !isNaN(cap) && cap > 0);
          
          let averageCapacity = 0;
          if (capacitiesInCity.length > 0) {
            const sum = capacitiesInCity.reduce((acc, val) => acc + val, 0);
            averageCapacity = sum / capacitiesInCity.length;
          }
          return {
            city: city.charAt(0).toUpperCase() + city.slice(1),
            averageCapacity,
            totalListings: capacitiesInCity.length,
            capacities: capacitiesInCity, // Return all capacities for global histogram
            error: false,
          };
        } catch (err) {
          console.error(`Error loading or processing data for ${city}:`, err);
          return { city: city.charAt(0).toUpperCase() + city.slice(1), error: true, capacities: [] };
        }
      });

      try {
        const resolvedCityResults = await Promise.all(cityDataPromises);
        
        const validCityData = resolvedCityResults.filter(result => !result.error);
        setCityAverageCapacities(validCityData.map(c => ({ city: c.city, averageCapacity: c.averageCapacity, totalListings: c.totalListings })));

        const allCapacities = validCityData.reduce((acc, cityResult) => acc.concat(cityResult.capacities), []);

        if (allCapacities.length === 0 && validCityData.length === 0) {
          setError('No capacity data found for any city.');
          setLoading(false);
          return;
        }
        
        const totalListings = allCapacities.length;
        const bins = capacityBinsDefinition.map(binDef => {
          const count = allCapacities.filter(cap => cap >= binDef.minValue && cap <= binDef.maxValue).length;
          return {
            binName: binDef.label,
            percentage: totalListings > 0 ? (count / totalListings) * 100 : 0,
            capacityValue: binDef.minValue, 
            actualCount: count,
          };
        });
        setHistogramData(bins);

      } catch (err) {
        console.error('Overall error processing capacity data:', err);
        setError('Failed to load or process capacity data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Dependencies: cities and capacityBinsDefinition are stable

  useEffect(() => {
    if (loading || error || !d3Container.current || histogramData.length === 0) {
      if (d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      if (d3Container.current && !loading && !error && histogramData.length === 0 && !error) {
        const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
        tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No data to display for capacity.');
      }
      return;
    }

    // setTimeout with 0ms delay: A common workaround to ensure that the browser has completed
    // its layout calculations and the container div (d3Container.current) has its correct 
    // dimensions before D3 attempts to use them. This can prevent issues with D3 drawing 
    // into an incorrectly sized area, especially in complex React component lifecycles.
    const timerId = setTimeout(() => {
      if (!d3Container.current) return;

      const svgContainer = d3.select(d3Container.current);
      svgContainer.selectAll('*').remove(); // Clear previous SVG content

      const margin = { top: 30, right: 30, bottom: 70, left: 60 };
      const containerRect = d3Container.current.getBoundingClientRect();

      if (!containerRect || containerRect.width < 50 || containerRect.height < 50) {
        console.warn('PersonCapacityChart: Container dimensions too small post-timeout.', containerRect);
        const fallbackSvg = svgContainer.append('svg').attr('width', '100%').attr('height', '100%');
        fallbackSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('Chart area too small.');
        return;
      }

      const outerWidth = containerRect.width;
      const outerHeight = 350; // Fixed height for the SVG chart area
      
      const chartWidth = Math.max(0, outerWidth - margin.left - margin.right);
      const chartHeight = Math.max(0, outerHeight - margin.top - margin.bottom);

      if (chartWidth <= 0 || chartHeight <= 0) {
        console.warn(`PersonCapacityChart: Calculated drawing dimensions zero or negative. W: ${chartWidth}, H: ${chartHeight}.`);
        const fallbackSvg = svgContainer.append('svg').attr('width', '100%').attr('height', '100%');
        fallbackSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('Cannot render chart.');
        return;
      }

      const svg = svgContainer.append('svg')  // Create SVG container
        .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('width', '100%') 
        .attr('height', outerHeight);

      const chartG = svg.append('g')  // Create chart group with margins
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create tooltip using D3
      const tooltip = d3.select('body')
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
      const xScale = d3.scaleBand()  // Create band scale for capacity bins
        .domain(histogramData.map(d => d.binName))
        .range([0, chartWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()  // Create linear scale for percentages
        .domain([0, d3.max(histogramData, d => d.percentage) > 0 ? d3.max(histogramData, d => d.percentage) : 100])
        .range([chartHeight, 0]);

      // Create and style X-axis
      chartG.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))  // Create bottom axis
        .selectAll('text')
          .style('opacity', 0)
          .transition()
          .duration(800)
          .style('opacity', 1);

      chartG.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', margin.bottom - 25)
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('opacity', 0)
        .text('Person Capacity')
        .transition()
        .duration(800)
        .style('opacity', 1);
      
      // Create and style Y-axis
      chartG.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))  // Create left axis with percentage format
        .selectAll('text')
          .style('opacity', 0)
          .transition()
          .duration(800)
          .style('opacity', 1);

      chartG.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -chartHeight / 2)
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('opacity', 0)
        .text('% of Listings')
        .transition()
        .duration(800)
        .style('opacity', 1);

      // Create bars with D3 transitions and interactions
      chartG.selectAll('.bar')
        .data(histogramData)
        .join('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.binName))
          .attr('y', chartHeight) // Start from bottom
          .attr('width', xScale.bandwidth())
          .attr('height', 0) // Start with height 0
          .attr('fill', d => {
            if (d.capacityValue === userSelectedCapacity) {
              return '#E51D51';
            }
            return '#A9A9A9';
          })
          .attr('stroke', '#191919')
          .attr('stroke-width', 0.5)
          .style('opacity', d => {
            const isSelected = (userSelectedCapacity === d.capacityValue) || (userSelectedCapacity >= 6 && d.capacityValue === 6);
            return isSelected ? 1 : 0.7;
          })
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 1)
              .attr('y', d => yScale(d.percentage) - 5)
              .attr('height', d => chartHeight - yScale(d.percentage) + 5);

            tooltip.transition()
              .duration(200)
              .style('opacity', 1);

            const sortedCities = [...cityAverageCapacities].sort((a,b) => b.averageCapacity - a.averageCapacity);
            const matchingCities = sortedCities.filter(city => city.averageCapacity >= d.capacityValue);
            
            tooltip.html(`
              <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">Capacity: ${d.binName}</div>
              <div style="color: #666; margin-bottom: 4px;">${d.percentage.toFixed(1)}% of listings</div>
              <div style="color: #666; margin-bottom: 4px;">${d.actualCount.toLocaleString()} total listings</div>
              ${matchingCities.length > 0 ? `
                <div style="color: #2E7D32; margin-top: 4px; font-weight: 500;">
                  ✓ ${matchingCities.length} cities typically offer this capacity
                </div>
              ` : ''}
              ${userSelectedCapacity === d.capacityValue ? `
                <div style="color: #E51D51; margin-top: 4px; font-weight: 500;">
                  ✓ Your selected capacity
                </div>
              ` : ''}
            `)
              .style('left', (event.clientX + 10) + 'px')
              .style('top', (event.clientY - 28) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', d => {
                const isSelected = (userSelectedCapacity === d.capacityValue) || (userSelectedCapacity >= 6 && d.capacityValue === 6);
                return isSelected ? 1 : 0.7;
              })
              .attr('y', d => yScale(d.percentage))
              .attr('height', d => chartHeight - yScale(d.percentage));

            tooltip.transition()
              .duration(200)
              .style('opacity', 0);
          })
          .transition()
          .duration(800)
          .delay((d, i) => i * 100) // Stagger the animations
          .ease(d3.easeCubicInOut)
          .attr('y', d => yScale(d.percentage))
          .attr('height', d => chartHeight - yScale(d.percentage));

      // Create percentage labels with D3 transitions
      chartG.selectAll('.bar-label')
        .data(histogramData)
        .join('text')
          .attr('class', 'bar-label')
          .attr('x', d => xScale(d.binName) + xScale.bandwidth() / 2)
          .attr('y', chartHeight)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', '#191919')
          .style('opacity', 0)
          .text(d => `${d.percentage.toFixed(0)}%`)
          .transition()
          .duration(800)
          .delay((d, i) => i * 100 + 400) // Stagger and delay after bars
          .ease(d3.easeCubicInOut)
          .attr('y', d => yScale(d.percentage) - 5)
          .style('opacity', 1);

      // Clean up tooltip on unmount
      return () => {
        tooltip.remove();
      };

    }, 0);

    return () => clearTimeout(timerId);

  }, [loading, error, histogramData, cityAverageCapacities, userSelectedCapacity]);

  const getInsightText = () => {
    if (loading) return 'Calculating...';
    if (error) return error; // Display the error message directly
    if (histogramData.length === 0 && !loading) return 'Not enough data for insights.';

    if (userSelectedCapacity === 0) {
        return "Select your group size to see how it compares with typical availability.";
    }
    
    const selectedBinInfo = histogramData.find(bin => 
        (userSelectedCapacity === bin.capacityValue) || 
        (userSelectedCapacity >= 6 && bin.capacityValue === 6)
    );

    if (selectedBinInfo) {
        const capacityLabel = userSelectedCapacity >=6 ? "6+" : userSelectedCapacity.toString();
        return `${capacityLabel} people: Approximately ${selectedBinInfo.percentage.toFixed(0)}% of listings accommodate this many.`;
    } else {
        // This might happen if userSelectedCapacity is valid but somehow no matching bin was found (data issue)
        return "Could not find data for the selected capacity. Please try a different selection.";
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">{getInsightText()}</h2>
      <p className="text-[16px] text-gray-500 mb-8 -mt-2">Hover over the data for more information</p>

      {loading && <div className="w-full h-[400px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[400px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <>
          <div 
            ref={d3Container} 
            className="w-full bg-gray-100 rounded-lg shadow relative" 
            style={{ minHeight: '300px' }} 
          >
            {/* D3 chart will be rendered here */}
          </div>
          <div 
            ref={tooltipRef} 
            className="absolute bg-white p-3 rounded-md shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 border border-gray-300 z-10"
            style={{ maxWidth: '250px' }}
          >
            {/* Tooltip content will be set by D3 */}
          </div>
        </>
      )}
    </div>
  );
};

export default PersonCapacityChart; 