import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const RoomTypeBreakdownChart = ({ userSelectedRoomType }) => {
  const d3Container = useRef(null);
  const [cityRoomTypeData, setCityRoomTypeData] = useState([]);
  const [overallAverages, setOverallAverages] = useState({ 
    entirePlacePercent: 0, entirePlacePrice: 0, 
    privateRoomPercent: 0, privateRoomPrice: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];
  const roomTypeMapping = {
    entire_place: 'Entire home/apt',
    private_room: 'Private room'
  };
  const CsvRoomTypes = ['Entire home/apt', 'Private room']; 
  const colors = ['#E51D51', '#FF8DA0']; // Airbnb red for Entire, lighter red for Private

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let processedCityData = [];
      let allEntirePlacePrices = [];
      let allPrivateRoomPrices = [];
      let totalEntirePlaceListings = 0;
      let totalPrivateRoomListings = 0;
      let totalConsideredListings = 0;

      try {
        for (const city of cities) {
          const weekdayPath = `/data/${city}_weekdays.csv`;
          const weekendPath = `/data/${city}_weekends.csv`;
          
          try {
            const [weekdayData, weekendData] = await Promise.all([
              d3.csv(weekdayPath),
              d3.csv(weekendPath)
            ]);
            const combinedData = [...(weekdayData || []), ...(weekendData || [])];
            
            let entirePlaceCount = 0;
            let privateRoomCount = 0;
            let cityEntirePrices = [];
            let cityPrivatePrices = [];

            combinedData.forEach(d => {
              const roomType = d.room_type;
              const price = parseFloat(d.realSum);

              if (roomType === CsvRoomTypes[0]) { // Entire home/apt
                entirePlaceCount++;
                if (!isNaN(price)) cityEntirePrices.push(price);
              } else if (roomType === CsvRoomTypes[1]) { // Private room
                privateRoomCount++;
                if (!isNaN(price)) cityPrivatePrices.push(price);
              }
            });

            const totalCityListings = entirePlaceCount + privateRoomCount;
            if (totalCityListings > 0) {
              processedCityData.push({
                city: city.charAt(0).toUpperCase() + city.slice(1),
                types: [
                    { type: CsvRoomTypes[0], percent: (entirePlaceCount / totalCityListings) * 100 },
                    { type: CsvRoomTypes[1], percent: (privateRoomCount / totalCityListings) * 100 }
                ],
                medianEntirePrice: cityEntirePrices.length > 0 ? d3.median(cityEntirePrices) : 0,
                medianPrivatePrice: cityPrivatePrices.length > 0 ? d3.median(cityPrivatePrices) : 0,
              });
              totalEntirePlaceListings += entirePlaceCount;
              totalPrivateRoomListings += privateRoomCount;
              allEntirePlacePrices.push(...cityEntirePrices);
              allPrivateRoomPrices.push(...cityPrivatePrices);
              totalConsideredListings += totalCityListings;
            }

          } catch (cityError) {
            console.error(`Error processing room type data for ${city}:`, cityError);
          }
        }
        
        // Sort by total proportion or a specific type, e.g., entirePlacePercent
        processedCityData.sort((a,b) => (b.types[0].percent) - (a.types[0].percent)); 
        setCityRoomTypeData(processedCityData);

        if (totalConsideredListings > 0) {
            setOverallAverages({
                entirePlacePercent: (totalEntirePlaceListings / totalConsideredListings) * 100,
                entirePlacePrice: allEntirePlacePrices.length > 0 ? d3.median(allEntirePlacePrices) : 0,
                privateRoomPercent: (totalPrivateRoomListings / totalConsideredListings) * 100,
                privateRoomPrice: allPrivateRoomPrices.length > 0 ? d3.median(allPrivateRoomPrices) : 0,
            });
        }

      } catch (err) {
        console.error('Error fetching or processing room type data:', err);
        setError('Failed to load room type data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // D3 Visualization: Stacked Percentage Bar Chart
  useEffect(() => {
    if (loading || error || !d3Container.current || cityRoomTypeData.length === 0) {
      if(d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      if (d3Container.current && !loading && !error && cityRoomTypeData.length === 0) {
        const tempSvg = d3.select(d3Container.current).append('svg').attr('width', '100%').attr('height', '100%');
        tempSvg.append('text').attr('x', '50%').attr('y', '50%').attr('text-anchor', 'middle').text('No room type data to display.');
      }
      return;
    }

    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 100 };
    const containerWidth = d3Container.current.clientWidth;

    const barCoreHeight = 20; // Core height of the bar part
    const barPadding = 10;    // Padding between city bars
    const chartHeight = cityRoomTypeData.length * (barCoreHeight + barPadding) - barPadding;
    const svgHeight = chartHeight + margin.top + margin.bottom + 30; // +30 for legend
    const width = containerWidth - margin.left - margin.right;

    const svg = d3.select(d3Container.current)
      .append('svg')
        .attr('width', containerWidth)
        .attr('height', svgHeight)
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

    const y = d3.scaleBand()
      .domain(cityRoomTypeData.map(d => d.city))
      .rangeRound([0, chartHeight])
      .paddingInner(barPadding / (barCoreHeight + barPadding));

    const x = d3.scaleLinear()
      .domain([0, 100]) // Percentage
      .rangeRound([0, width]);

    const colorScale = d3.scaleOrdinal()
      .domain(CsvRoomTypes)
      .range(colors);

    // X-axis with animation
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
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
      .text('Proportion of Listings')
      .transition()
      .duration(800)
      .style('opacity', 1);

    // Y-axis with animation
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100) // Stagger the animations
        .style('opacity', 1);

    // City Groups for stacked bars
    const cityGroup = svg.selectAll('.city-group')
      .data(cityRoomTypeData)
      .join('g')
        .attr('class', 'city-group')
        .attr('transform', d => `translate(0,${y(d.city)})`);

    // Create the stack generator
    const stack = d3.stack()
        .keys(CsvRoomTypes)
        .value((d, key) => d[key] || 0);
    
    const dataForStacking = cityRoomTypeData.map(city => {
        const cityObj = { city: city.city };
        city.types.forEach(typeDetail => {
            cityObj[typeDetail.type] = typeDetail.percent;
        });
        return cityObj;
    });

    const stackedData = stack(dataForStacking);

    // Draw the stacked bars with animation
    cityGroup.selectAll('rect')
      .data((d, i) => CsvRoomTypes.map(key => {
          const series = stackedData.find(s => s.key === key);
          const cityValues = series ? series[i] : [0,0];
          return {
              key: key,
              city: d.city,
              values: cityValues,
              percent: d.types.find(t => t.type === key)?.percent || 0,
              price: key === CsvRoomTypes[0] ? d.medianEntirePrice : d.medianPrivatePrice
          };
      }))
      .join('rect')
        .attr('x', d => x(d.values[0]))
        .attr('y', 0)
        .attr('width', 0) // Start with width 0
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(d.key))
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

          const isSelected = (d.key === 'Entire home/apt' && userSelectedRoomType === 'entire_place') ||
                           (d.key === 'Private room' && userSelectedRoomType === 'private_room');
          
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666; margin-bottom: 2px;">${d.key}: ${d.percent.toFixed(1)}%</div>
            <div style="color: #666; margin-bottom: 2px;">Typical Price: €${d.price.toFixed(0)}</div>
            <div style="color: ${isSelected ? '#2E7D32' : '#666'}">
              ${isSelected ? '✓ Your selected type' : ''}
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
        .attr('width', d => x(d.values[1]) - x(d.values[0]));

    // Bar Labels with animation
    cityGroup.selectAll('.bar-label')
      .data((d, i) => CsvRoomTypes.map(key => {
          const series = stackedData.find(s => s.key === key);
          const cityValues = series ? series[i] : [0,0];
          const percent = d.types.find(t => t.type === key)?.percent || 0;
          return { key, city: d.city, values: cityValues, percent };
      }))
      .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.values[0]) + (x(d.values[1]) - x(d.values[0])) / 2)
        .attr('y', y.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '9px')
        .style('fill', 'white')
        .style('opacity', 0)
        .text(d => d.percent > 5 ? `${d.percent.toFixed(0)}%` : '')
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400) // Stagger and delay after bars
        .ease(d3.easeCubicInOut)
        .style('opacity', 1);
        
    // Legend with animation
    const legend = svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .style('opacity', 0)
        .selectAll('g')
        .data(CsvRoomTypes)
        .join('g')
            .attr('transform', (d, i) => `translate(${i * 140}, ${chartHeight + margin.bottom -15})`);

    legend.append('rect')
        .attr('x', 0)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', (d, i) => colors[i])
        .attr('stroke', '#191919')
        .attr('stroke-width', 0.5);

    legend.append('text')
        .attr('x', 24)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .style('fill', '#191919')
        .text(d => d);

    // Animate legend in
    svg.selectAll('g.legend')
        .transition()
        .duration(800)
        .delay(1000) // After bars and labels
        .style('opacity', 1);

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [loading, error, cityRoomTypeData, userSelectedRoomType]);

  const getInsightText = () => {
    if (loading) return 'Calculating...';
    if (error) return 'Error loading data.';
    if (cityRoomTypeData.length === 0) return 'Not enough data for insights.';
    const { entirePlacePercent, entirePlacePrice, privateRoomPercent, privateRoomPrice } = overallAverages;

    if (userSelectedRoomType === 'entire_place') {
      return `Entire Places average ${entirePlacePercent.toFixed(0)}% of listings (typ. €${entirePlacePrice.toFixed(0)}).`;
    } else if (userSelectedRoomType === 'private_room') {
      return `Private Rooms average ${privateRoomPercent.toFixed(0)}% of listings (typ. €${privateRoomPrice.toFixed(0)}).`;
    } else {
      return `Avg. mix: Entire Place ${entirePlacePercent.toFixed(0)}% (€${entirePlacePrice.toFixed(0)}), Private Room ${privateRoomPercent.toFixed(0)}% (€${privateRoomPrice.toFixed(0)}).`;
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
        <div ref={d3Container} className="w-full bg-gray-100 rounded-lg shadow" style={{ minHeight: '300px' }}></div>
      )}
    </div>
  );
};

export default RoomTypeBreakdownChart; 