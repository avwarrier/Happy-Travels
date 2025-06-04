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
  const colors = ['#1f77b4', '#2ca02c']; // Blue for Entire, Green for Private

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

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .append('text')
        .attr('x', width / 2).attr('y', margin.bottom - 10)
        .attr('fill', '#000').style('text-anchor', 'middle')
        .text('Proportion of Listings');

    // Y-axis
    svg.append('g').call(d3.axisLeft(y));

    // City Groups for stacked bars
    const cityGroup = svg.selectAll('.city-group')
      .data(cityRoomTypeData)
      .join('g')
        .attr('class', 'city-group')
        .attr('transform', d => `translate(0,${y(d.city)})`);

    // Create the stack generator
    const stack = d3.stack()
        .keys(CsvRoomTypes)
        .value((d, key) => {
            // 'd' here is one of the objects from dataForStacking
            // 'key' is one of CsvRoomTypes ('Entire home/apt' or 'Private room')
            return d[key] || 0; // Directly access the property matching the key
        });
    
    // Prepare data for stacking by transforming cityRoomTypeData slightly
    // The stack generator expects an array of objects, where each object represents a city
    // and has properties matching the keys (CsvRoomTypes)
    const dataForStacking = cityRoomTypeData.map(city => {
        const cityObj = { city: city.city };
        city.types.forEach(typeDetail => {
            cityObj[typeDetail.type] = typeDetail.percent;
        });
        return cityObj;
    });

    const stackedData = stack(dataForStacking);

    // Draw the stacked bars
    cityGroup.selectAll('rect')
      .data((d, i) => {
          // For each city, we need to map to the series data from stackedData
          // Each series corresponds to a room type (key)
          // Each element in a series is [startValue, endValue] for that city
          return CsvRoomTypes.map(key => {
              const series = stackedData.find(s => s.key === key);
              const cityValues = series ? series[i] : [0,0]; // series[i] should give [start, end] for city i
              return {
                  key: key,
                  city: d.city,
                  values: cityValues,
                  percent: d.types.find(t => t.type === key)?.percent || 0
              };
          });
      })
      .join('rect')
        .attr('x', d => x(d.values[0]))
        .attr('y', 0) // y is relative to the cityGroup, which is already positioned by y-scale
        .attr('width', d => x(d.values[1]) - x(d.values[0]))
        .attr('height', y.bandwidth())
        .attr('fill', d => colorScale(d.key))
        .attr('opacity', d => roomTypeMapping[userSelectedRoomType] === d.key || !userSelectedRoomType ? 1 : 0.5);

    // Bar Labels (inside segments)
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
        .text(d => d.percent > 5 ? `${d.percent.toFixed(0)}%` : ''); // Only show if segment > 5%
        
    // Legend
    const legend = svg.append('g')
        .attr('font-family', 'sans-serif').attr('font-size', 10).attr('text-anchor', 'start')
        .selectAll('g').data(CsvRoomTypes).join('g')
            .attr('transform', (d, i) => `translate(${i * 140}, ${chartHeight + margin.bottom -15})`);
    legend.append('rect').attr('x', 0).attr('width', 19).attr('height', 19).attr('fill', colorScale);
    legend.append('text').attr('x', 24).attr('y', 9.5).attr('dy', '0.32em').text(d => d);

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
      <p className="text-sm font-semibold mb-1" style={{ color: '#E51D51' }}>Insight</p>
      <h2 className="text-3xl font-bold text-black mb-6">{getInsightText()}</h2>
      {loading && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p>Loading visualization...</p></div>}
      {error && <div className="w-full h-[350px] flex justify-center items-center bg-gray-100 rounded-lg shadow"><p className="text-red-500 p-4 text-center">{error}</p></div>}
      {!loading && !error && (
        <div ref={d3Container} className="w-full bg-gray-100 rounded-lg shadow" style={{ minHeight: '300px' }}></div>
      )}
    </div>
  );
};

export default RoomTypeBreakdownChart; 