import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const PriceHistogramChart = ({ userMaxPrice }) => {
  const d3Container = useRef(null);
  const [cityMedianPrices, setCityMedianPrices] = useState([]);
  const [shareOfCities, setShareOfCities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialCities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];

  useEffect(() => {
    const fetchDataAndProcess = async () => {
      setLoading(true);
      setError(null);
      try {
        const cityDataPromises = initialCities.map(async (city) => {
          const weekdayPath = `/data/${city}_weekdays.csv`;
          const weekendPath = `/data/${city}_weekends.csv`;
          try {
            const [weekdayData, weekendData] = await Promise.all([
              d3.csv(weekdayPath),
              d3.csv(weekendPath)
            ]);
            
            const combinedPrices = [];
            if (weekdayData) weekdayData.forEach(d => { if (d.realSum && !isNaN(parseFloat(d.realSum))) combinedPrices.push(parseFloat(d.realSum)); });
            if (weekendData) weekendData.forEach(d => { if (d.realSum && !isNaN(parseFloat(d.realSum))) combinedPrices.push(parseFloat(d.realSum)); });

            if (combinedPrices.length === 0) {
              console.warn(`No valid price data for ${city}`);
              return { city, medianPrice: null };
            }
            const median = d3.median(combinedPrices);
            return { city: city.charAt(0).toUpperCase() + city.slice(1), medianPrice: median };
          } catch (cityError) {
            console.error(`Error fetching data for ${city}:`, cityError);
            return { city, medianPrice: null };
          }
        });

        let calculatedMedians = (await Promise.all(cityDataPromises)).filter(data => data.medianPrice !== null);
        // Sort cities by median price for better visualization in bar chart (optional)
        calculatedMedians.sort((a, b) => a.medianPrice - b.medianPrice);
        setCityMedianPrices(calculatedMedians);

        if (calculatedMedians.length > 0) {
          const affordableCities = calculatedMedians.filter(c => c.medianPrice <= userMaxPrice).length;
          setShareOfCities(((affordableCities / calculatedMedians.length) * 100).toFixed(0));
        } else {
          setShareOfCities(0);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching or processing city median prices:', err);
        setError('Failed to load data for the chart. Please check data sources and network.');
        setLoading(false);
      }
    };

    fetchDataAndProcess();
  }, [userMaxPrice]);

  useEffect(() => {
    if (loading || error || !d3Container.current) {
      // Clear chart if loading or error, but only if container exists
      if (d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      return;
    }

    if (cityMedianPrices.length === 0) {
      d3.select(d3Container.current).selectAll('*').remove();
      const svg = d3.select(d3Container.current)
         .append('svg').attr('width', '100%').attr('height', '100%')
         .append('g').attr('transform', `translate(${d3Container.current.clientWidth/2}, ${d3Container.current.clientHeight/2})`);
      svg.append('text').attr('text-anchor', 'middle').text('No city data to display chart.');
      return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 70, left: 50 }; // Increased bottom margin for city labels
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

    // Add chart title at the top
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 55)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('opacity', 0)
      .text('Median Price per Night')
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
      .domain(cityMedianPrices.map(d => d.city))
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(cityMedianPrices, d => d.medianPrice);
    const y = d3.scaleLinear()
      .domain([0, d3.max([yMax, userMaxPrice]) * 1.1 || 100])
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
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    // Y-axis with animation
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `€${d}`))
      .selectAll('text')
        .style('font-size', '10px')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 1);

    // Bars with animation
    svg.selectAll('.bar')
      .data(cityMedianPrices)
      .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.city))
        .attr('y', height) // Start from bottom
        .attr('width', x.bandwidth())
        .attr('height', 0) // Start with height 0
        .attr('fill', d => {
          if (d.medianPrice <= userMaxPrice) {
            const ratio = d.medianPrice / userMaxPrice;
            if (ratio <= 0.33) return '#FF8DA0';
            if (ratio <= 0.66) return '#E51D51';
            return '#D90865';
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
          
          const isAffordable = d.medianPrice <= userMaxPrice;
          const priceDiff = Math.abs(d.medianPrice - userMaxPrice);
          const percentage = ((d.medianPrice / userMaxPrice) * 100).toFixed(1);
          
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666; margin-bottom: 2px;">Median Price: €${d.medianPrice.toFixed(2)}</div>
            <div style="color: ${isAffordable ? '#2E7D32' : '#D32F2F'}">
              ${isAffordable 
                ? `€${priceDiff.toFixed(2)} under your budget (${percentage}%)`
                : `€${priceDiff.toFixed(2)} over your budget (${percentage}%)`
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
        .delay((d, i) => i * 120)
        .ease(d3.easeCubicInOut)
        .attr('y', d => y(d.medianPrice))
        .attr('height', d => height - y(d.medianPrice));

    // Value labels with staggered animation (optional, if you want to add)
    svg.selectAll('.bar-label')
      .data(cityMedianPrices)
      .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.city) + x.bandwidth() / 2)
        .attr('y', height)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .text(d => `€${d.medianPrice.toFixed(0)}`)
        .transition()
        .duration(800)
        .delay((d, i) => i * 120 + 200)
        .ease(d3.easeCubicInOut)
        .attr('y', d => y(d.medianPrice) - 5)
        .style('opacity', 1);

    // Horizontal cutoff line with animation
    if (userMaxPrice !== null && userMaxPrice !== undefined && y(userMaxPrice) >= 0 && y(userMaxPrice) <= height) {
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', height) // Start from bottom
        .attr('x2', 0) // Start from left
        .attr('y2', height)
        .attr('stroke', '#555555')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4')
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr('x2', width)
        .attr('y1', y(userMaxPrice))
        .attr('y2', y(userMaxPrice));

      // Add label for the cutoff line
      svg.append('text')
        .attr('x', 5)
        .attr('y', y(userMaxPrice) - 8)
        .attr('text-anchor', 'start')
        .attr('fill', '#555555')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('opacity', 0)
        .text(`Your Max Price: €${userMaxPrice}`)
        .transition()
        .duration(800)
        .delay(800)
        .style('opacity', 1);
    }

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [cityMedianPrices, userMaxPrice, loading, error]); // Removed initialCities from deps as it's constant

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">
        {loading ? 'Calculating...' : error ? ' ' : 
          (parseInt(shareOfCities) >= 50 ? `About ${shareOfCities}%` : `Only ${shareOfCities}%`) + 
          ` of cities have a median ≤ €${userMaxPrice}.
        `}
      </h2>
      <p className="text-[16px] text-gray-500 mb-8 -mt-2">Hover over the data for more information</p>

      {loading && <div className="w-full h-[300px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal">Loading visualization...</p></div>}
      {error && <div className="w-full h-[300px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-base font-normal text-red-500 p-4 text-center">{error}</p></div>}
      
      {!loading && !error && (
        <div 
          ref={d3Container} 
          className="w-full h-[300px] bg-gray-100 rounded-lg shadow"
        >
          {/* D3 chart will be rendered here */} 
        </div>
      )}
    </div>
  );
};

export default PriceHistogramChart; 