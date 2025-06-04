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
            d3.csv(weekdayPath),
            d3.csv(weekendPath)
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

      const svg = svgContainer.append('svg')
        .attr('viewBox', `0 0 ${outerWidth} ${outerHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('width', '100%') 
        .attr('height', outerHeight);

      const chartG = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
        .domain(histogramData.map(d => d.binName))
        .range([0, chartWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(histogramData, d => d.percentage) > 0 ? d3.max(histogramData, d => d.percentage) : 100])
        .range([chartHeight, 0]);

      // X-axis
      chartG.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .append('text')
          .attr('x', chartWidth / 2)
          .attr('y', margin.bottom - 25) // Adjusted for clarity
          .attr('fill', 'currentColor') // Use CSS inherited color
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text('Person Capacity');
      
      // Y-axis
      chartG.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -margin.left + 15) // Adjusted for clarity
          .attr('x', -chartHeight / 2)
          .attr('fill', 'currentColor')
          .style('text-anchor', 'middle')
          .style('font-size', '14px')
          .text('% of Listings');

      const tooltip = d3.select(tooltipRef.current);

      chartG.selectAll('.bar')
        .data(histogramData)
        .join('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.binName))
          .attr('y', d => yScale(d.percentage))
          .attr('width', xScale.bandwidth())
          .attr('height', d => chartHeight - yScale(d.percentage))
          .attr('fill', d => {
            const isSelected = (userSelectedCapacity === d.capacityValue) || (userSelectedCapacity >= 6 && d.capacityValue === 6);
            return isSelected ? '#E51D51' : '#69b3a2';
          })
          .style('opacity', d => {
              const isSelected = (userSelectedCapacity === d.capacityValue) || (userSelectedCapacity >= 6 && d.capacityValue === 6);
              return isSelected ? 1 : 0.7;
          })
          .on('mouseover', (event, d) => {
            tooltip.style('opacity', 1)
                   .style('left', (event.pageX + 15) + 'px')
                   .style('top', (event.pageY - 28) + 'px');
            
            let tooltipHtml = `<div class="font-semibold text-sm mb-1">Capacity: ${d.binName} (${d.percentage.toFixed(1)}% of listings)</div>`;
            tooltipHtml += '<ul class="text-xs list-disc pl-4">';
            
            // Sort cities by average capacity for consistent tooltip display
            const sortedCities = [...cityAverageCapacities].sort((a,b) => b.averageCapacity - a.averageCapacity);

            sortedCities.forEach(city => {
              const meetsCriteria = city.averageCapacity >= d.capacityValue;
              tooltipHtml += `<li style="color: ${meetsCriteria ? 'green' : 'black'}; font-weight: ${meetsCriteria ? 'bold' : 'normal'};">
                                ${city.city}: avg capacity ${city.averageCapacity.toFixed(1)}
                              </li>`;
            });
            tooltipHtml += '</ul>';
            tooltip.html(tooltipHtml);
          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0).html('');
          });
          
      // Pulse animation for the selected bar
      if (userSelectedCapacity > 0) {
          const selectedBinData = histogramData.find(d => (userSelectedCapacity === d.capacityValue) || (userSelectedCapacity >= 6 && d.capacityValue === 6));
          if (selectedBinData) {
              chartG.selectAll('.bar')
                  .filter(d => d.binName === selectedBinData.binName)
                  .transition()
                  .duration(300)
                  .attr('y', d => yScale(d.percentage) - 5)
                  .attr('height', d => chartHeight - yScale(d.percentage) + 5)
                  .transition()
                  .duration(300)
                  .attr('y', d => yScale(d.percentage))
                  .attr('height', d => chartHeight - yScale(d.percentage));
          }
      }
    }, 0);

    return () => clearTimeout(timerId); // Cleanup timeout

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
        return `You're looking for space for ${capacityLabel} people. Approximately ${selectedBinInfo.percentage.toFixed(0)}% of listings accommodate this many.`;
    } else {
        // This might happen if userSelectedCapacity is valid but somehow no matching bin was found (data issue)
        return "Could not find data for the selected capacity. Please try a different selection.";
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-sm font-semibold mb-1" style={{ color: '#E51D51' }}>Insight</p>
      <h2 className="text-3xl font-bold text-black mb-6">{getInsightText()}</h2>

      {loading && <div className="w-full h-[400px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p>Loading visualization...</p></div>}
      {error && !loading && <div className="w-full h-[400px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <>
          <div 
            ref={d3Container} 
            className="w-full bg-gray-100 rounded-lg shadow relative" 
            style={{ minHeight: '400px' }} 
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