import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const WeekdayWeekendChart = ({ weekday }) => {
  const d3Container = useRef(null);
  const [averagePriceDifference, setAveragePriceDifference] = useState(0);
  const [processedChartData, setProcessedChartData] = useState([]); // Store data for D3 effect
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = [
    'vienna', 'rome', 'paris', 'london', 'lisbon',
    'budapest', 'berlin', 'barcelona', 'athens', 'amsterdam'
  ];

  // Effect for data fetching and processing
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setDataLoaded(false);
      try {
        const priceDataPromises = cities.flatMap(city => [
          d3.csv(`/data/${city}_weekdays.csv`),
          d3.csv(`/data/${city}_weekends.csv`)
        ]);

        const allCsvData = await Promise.all(priceDataPromises);

        const currentProcessedData = [];
        let totalDifference = 0;
        let citiesCount = 0;

        for (let i = 0; i < cities.length; i++) {
          const weekdayData = allCsvData[i * 2];
          const weekendData = allCsvData[i * 2 + 1];

          if (!weekdayData || !weekendData) {
            console.warn(`Data missing for ${cities[i]}`);
            continue;
          }

          const getMedianPrice = (data) => {
            const prices = data.map(d => parseFloat(d.realSum)).filter(p => !isNaN(p));
            if (prices.length === 0) return undefined;
            return d3.median(prices);
          };

          const medianWeekdayPrice = getMedianPrice(weekdayData);
          const medianWeekendPrice = getMedianPrice(weekendData);

          if (medianWeekdayPrice !== undefined && medianWeekendPrice !== undefined) {
            currentProcessedData.push({
              city: cities[i].charAt(0).toUpperCase() + cities[i].slice(1),
              weekdayPrice: medianWeekdayPrice,
              weekendPrice: medianWeekendPrice,
            });
            totalDifference += (medianWeekendPrice - medianWeekdayPrice);
            citiesCount++;
          } else {
            console.warn(`Could not calculate median prices for ${cities[i]}. Weekday: ${medianWeekdayPrice}, Weekend: ${medianWeekendPrice}`);
          }
        }
        setProcessedChartData(currentProcessedData); // Set data for D3 effect

        if (citiesCount > 0) {
          setAveragePriceDifference(totalDifference / citiesCount);
        } else {
          setAveragePriceDifference(0);
          console.warn('No city data processed successfully, average price difference might be inaccurate.');
        }
        setDataLoaded(true);
      } catch (err) {
        console.error('Error fetching or processing data:', err);
        setError('Failed to load data for the chart. Please check data sources and network.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [weekday]); // Only re-fetch data when weekday prop changes

  // Effect for D3 chart rendering
  useEffect(() => {
    if (loading || error || !d3Container.current) {
      // If loading, error, or container not ready, clear any existing SVG and return
      if (d3Container.current) d3.select(d3Container.current).selectAll('*').remove();
      return;
    }

    if (processedChartData.length === 0) {
      d3.select(d3Container.current).selectAll('*').remove();
      const svg = d3.select(d3Container.current)
        .append('svg').attr('width', '100%').attr('height', '100%')
        .append('g').attr('transform', `translate(${d3Container.current.clientWidth/2}, ${d3Container.current.clientHeight/2})`);
      svg.append('text').attr('text-anchor', 'middle').text('No data available to display chart.');
      return;
    }

    // D3 Chart Drawing Logic (moved here)
    d3.select(d3Container.current).selectAll('*').remove(); // Clear previous chart
    const margin = { top: 20, right: 80, bottom: 40, left: 80 };
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
      .attr('y', margin.bottom - 45)
      .attr('fill', '#000')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('opacity', 0)
      .text('Weekend vs Weekday Price')
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

    const allPrices = processedChartData.flatMap(d => [d.weekdayPrice, d.weekendPrice]);
    const yMax = d3.max(allPrices);
    const y = d3.scaleLinear()
      .domain([0, yMax > 0 ? yMax * 1.1 : 100])
      .range([height, 0]);

    const x = d3.scalePoint()
      .domain(['Weekday', 'Weekend'])
      .range([0, width])
      .padding(0.5);

    // Add axes with animation
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('font-size', '12px')
      .attr('fill', '#333')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `€${d}`))
      .selectAll('text')
      .style('font-size', '10px')
      .attr('fill', '#333')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1);

    // Create groups for each city
    const cityGroups = svg.selectAll('.city-group')
      .data(processedChartData)
      .enter()
      .append('g')
      .attr('class', 'city-group')
      .style('opacity', 0)
      .transition()
      .duration(400)
      .delay((d, i) => i * 180)
      .style('opacity', 1);

    // Add lines with staggered animation
    processedChartData.forEach((d, i) => {
      const group = svg.append('g').attr('class', 'city-group');
      group.append('line')
        .attr('x1', x('Weekday'))
        .attr('y1', y(d.weekdayPrice))
        .attr('x2', x('Weekday'))
        .attr('y2', y(d.weekdayPrice))
        .attr('stroke', '#555555')
        .attr('stroke-width', 1.5)
        .transition()
        .duration(800)
        .delay(i * 180)
        .ease(d3.easeCubicInOut)
        .attr('x2', x('Weekend'))
        .attr('y2', y(d.weekendPrice));

      // Add weekday circle with tooltip, staggered after line
      group.append('circle')
        .attr('cx', x('Weekday'))
        .attr('cy', y(d.weekdayPrice))
        .attr('r', 0)
        .attr('fill', weekday ? '#E51D51' : '#A9A9A9')
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 1);
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666;">Weekday Price: €${d.weekdayPrice.toFixed(2)}</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        })
        .transition()
        .duration(400)
        .delay(i * 180 + 120)
        .attr('r', 4);

      // Add weekend circle with tooltip, staggered after line
      group.append('circle')
        .attr('cx', x('Weekend'))
        .attr('cy', y(d.weekendPrice))
        .attr('r', 0)
        .attr('fill', !weekday ? '#E51D51' : '#A9A9A9')
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 1);
          tooltip.html(`
            <div style="font-weight: 500; color: #191919; margin-bottom: 4px;">${d.city}</div>
            <div style="color: #666;">Weekend Price: €${d.weekendPrice.toFixed(2)}</div>
          `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
          tooltip.transition()
            .duration(200)
            .style('opacity', 0);
        })
        .transition()
        .duration(400)
        .delay(i * 180 + 120)
        .attr('r', 4);

      // Add city label, staggered after circles
      group.append('text')
        .attr('x', x('Weekend') + 10)
        .attr('y', y(d.weekendPrice))
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .text(d.city)
        .style('font-size', '9px')
        .style('fill', '#191919')
        .style('opacity', 0)
        .transition()
        .duration(400)
        .delay(i * 180 + 240)
        .style('opacity', 1);
    });

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [loading, error, processedChartData, weekday]); // Re-render D3 chart if loading/error state changes, or data changes, or weekday changes (for circle colors)


  const renderInsightSentence = () => {
    const diff = parseFloat(averagePriceDifference.toFixed(2));
    const absDiff = Math.abs(diff);
    if (loading) return 'Calculating insight...'; // Show loading for sentence too
    if (error) return 'Could not calculate insight.'; // Show error for sentence
    if (!dataLoaded && !loading) return 'Waiting for data...'; // Initial state before data is loaded for the first time

    if (diff === 0 && dataLoaded && !loading) {
        return "Weekday and Weekend nights average the same price.";
    }

    if (weekday) {
      if (diff > 0) {
        return <>Weekday nights average <span style={{ whiteSpace: 'nowrap' }}>€{absDiff}</span> lower than weekends.</>;
      } else {
        return <>Weekday nights average <span style={{ whiteSpace: 'nowrap' }}>€{absDiff}</span> higher than weekends.</>;
      }
    } else {
      if (diff > 0) {
        return <>Weekend nights average <span style={{ whiteSpace: 'nowrap' }}>€{absDiff}</span> higher than weekdays.</>;
      } else {
        return <>Weekend nights average <span style={{ whiteSpace: 'nowrap' }}>€{absDiff}</span> lower than weekdays.</>;
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-start justify-start p-0">
      <p className="text-[14px] font-normal mb-2 text-[#E51D51]">Insight</p>
      <h2 className="text-[40px] font-normal text-black mb-2 leading-tight">
        {renderInsightSentence()}
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
      
      {dataLoaded && !loading && !error && averagePriceDifference === 0 && cities.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          The average price difference is €0.00. This might indicate an issue with the data or that prices are identical.
        </p>
      )}
    </div>
  );
};

export default WeekdayWeekendChart; 