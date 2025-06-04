import { useEffect, useRef } from "react";
import * as d3 from 'd3';

/**
 * This is a D3.js component that visualizes Airbnb listing counts
 * for weekdays versus weekends. It includes the total number of listings examined
 * and interactive hover effects on the bars.
 *
 * @param {object} props - The component's props.
 * @param {number} props.weekdayRows - The count of listings available on weekdays.
 * @param {number} props.weekendRows - The count of listings available on weekends.
 * @param {number} props.totalListings - The total number of listings examined (sum of weekday and weekend rows).
 * @returns {JSX.Element} A div container with an SVG chart, or a message if data is unavailable.
 *
 */

export const DataExaminedBarChart = ({ weekdayRows, weekendRows, totalListings }) => {
  const d3Container = useRef(null);
  const dimensions = { width: 280, height: 220, margin: { top: 40, right: 20, bottom: 50, left: 40 } };

  useEffect(() => {
    if (typeof weekdayRows !== 'number' || typeof weekendRows !== 'number' || typeof totalListings !== 'number' || !d3Container.current) {
      return;
    }

    const data = [
      { label: 'Weekday', value: weekdayRows },
      { label: 'Weekend', value: weekendRows },
    ];

    const svg = d3.select(d3Container.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll("*").remove(); // Clear previous renders

    // Calculate actual chart drawing area dimensions
    const chartWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const chartHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.35);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) > 0 ? d3.max(data, d => d.value) : 10])
      .nice()
      .range([chartHeight, 0]);

    // Chart group (for bars and axes)
    const g = svg.append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#4A5568");

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(totalListings > 1000 ? "~s" : "d")))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#4A5568");

    // Bars
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.value))
      .attr('fill', (d) => d.label === 'Weekday' ? '#63B3ED' : '#4FD1C5')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('transition', 'opacity 0.2s ease-in-out');

    // Bar labels
    const barLabels = g.selectAll('.bar-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 7)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'normal')
      .style('fill', '#2D3748')
      .style('transition', 'font-weight 0.2s ease-in-out, fill 0.2s ease-in-out')
      .text(d => d.value);

    // Hover effects
    bars.on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 1);
        bars.filter(otherD => otherD !== d).style('opacity', 0.5);
        barLabels.filter(labelD => labelD.label === d.label)
          .style('font-weight', 'bold')
          .style('fill', '#000000');
      })
      .on('mouseout', function () {
        bars.style('opacity', 1);
        barLabels.style('font-weight', 'normal')
                 .style('fill', '#2D3748');
      });

    // Chart Title - Left Aligned
    svg.append("text")
        .attr("x", dimensions.width.left)
        .attr("y", dimensions.margin.top / 2) // Positioned in the middle of the top margin
        .attr("text-anchor", "start")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#1A202C")
        .text("Listings: Weekday vs. Weekend");

    // Total Listings Text - Positioned under the X-axis
    // The y-coordinate is calculated based on the top margin, chart height, and some padding.
    // This places it within the bottom margin area, below the x-axis labels.
    const xAxisLabelsHeightEstimate = 25; // Estimated space for x-axis labels and ticks
    svg.append("text")
        .attr("x", dimensions.width / 2) // Centered horizontally in the SVG
        .attr("y", dimensions.margin.top + chartHeight + xAxisLabelsHeightEstimate + 20) // Below x-axis, 10px padding
        .attr("text-anchor", "middle") // Center the text
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#4A5568") // text-gray-700
        .text(`Total Examined: ${totalListings.toLocaleString()}`);


  }, [weekdayRows, weekendRows, totalListings, dimensions]);

  if (typeof weekdayRows !== 'number' || typeof weekendRows !== 'number' || typeof totalListings !== 'number') {
    return <p className="text-sm text-center text-gray-500 py-4">Listing data not available for chart.</p>;
  }

  return (
    <div className="my-4 p-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
      <svg ref={d3Container} />
    </div>
  );
};
