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

    const x = d3.scaleBand()
      .domain(cityMedianPrices.map(d => d.city))
      .range([0, width])
      .padding(0.2);

    const yMax = d3.max(cityMedianPrices, d => d.medianPrice);
    const y = d3.scaleLinear()
      .domain([0, d3.max([yMax, userMaxPrice]) * 1.1 || 100]) // Ensure userMaxPrice is visible on y-axis
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
        .style('font-size', '10px');

    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `€${d}`))
      .selectAll('text').style('font-size', '10px');

    // Bars
    svg.selectAll('.bar')
      .data(cityMedianPrices)
      .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.city))
        .attr('y', d => y(d.medianPrice))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.medianPrice))
        .attr('fill', d => {
          if (d.medianPrice <= userMaxPrice) {
            // Create gradient based on price relative to userMaxPrice
            const ratio = d.medianPrice / userMaxPrice;
            if (ratio <= 0.33) return '#FF8DA0'; // Lightest red for lowest prices
            if (ratio <= 0.66) return '#E51D51'; // Medium red for middle prices
            return '#D90865'; // Darker red for higher prices (but still under max)
          }
          return '#A9A9A9'; // Grey for prices above userMaxPrice
        })
        .attr('stroke', '#191919')
        .attr('stroke-width', 0.5);

    // Horizontal cutoff line for userMaxPrice
    if (userMaxPrice !== null && userMaxPrice !== undefined && y(userMaxPrice) >=0 && y(userMaxPrice) <= height) {
      svg.append('line')
        .attr('x1', 0)
        .attr('y1', y(userMaxPrice))
        .attr('x2', width)
        .attr('y2', y(userMaxPrice))
        .attr('stroke', '#555555')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4');
    }

  }, [cityMedianPrices, userMaxPrice, loading, error]); // Removed initialCities from deps as it's constant

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-8 leading-tight">
        {loading ? 'Calculating...' : error ? ' ' : 
          (parseInt(shareOfCities) >= 50 ? `About ${shareOfCities}%` : `Only ${shareOfCities}%`) + 
          ` of cities have a median ≤ €${userMaxPrice}.
        `}
      </h2>

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