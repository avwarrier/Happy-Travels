import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * A D3.js component that renders a donut chart to visualize the
 * distribution of different categories (e.g., room types).
 * It displays slices for each category. The legend shows the label, percentage (to one decimal place),
 * and count for each category. Hovering over a slice or legend item updates the central
 * text to show the specific count for that category.
 *
 * @param {object} props - The component's props.
 * @param {Array<{label: string, value: number}>} props.data - An array of data objects.
 * Each object should have a 'label' (string) for the category name and a 'value' (number)
 * for its count.
 * @returns {JSX.Element} A div container with an SVG donut chart, or a message if data is unavailable.
 */
export const RoomTypeDonutChart = ({ data }) => {
  const d3Container = useRef(null);
  const dimensions = { width: 260, height: 330, margin: { top: 15, right: 15, bottom: 75, left: 15 } };
  const legendItemHeight = 18;
  const legendSpacing = 4;


  useEffect(() => {
    if (!data || data.length === 0 || !d3Container.current) {
      if (d3Container.current) {
        d3.select(d3Container.current).selectAll("*").remove();
      }
      return;
    }

    const totalValue = data.reduce((sum, d) => sum + d.value, 0);

    const svg = d3.select(d3Container.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll("*").remove();

    if (totalValue === 0) {
        svg.append("text")
            .attr("x", dimensions.width / 2)
            .attr("y", dimensions.height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .style("fill", "#6B7280")
            .text("No listing types to display.");
        return;
    }

    // Donut chart specific dimensions
    const chartAreaHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;
    const chartAreaWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    const radius = Math.min(chartAreaWidth, chartAreaHeight) / 2 * 0.95;
    const innerRadius = radius * 0.55;

    const chartGroup = svg.append("g")
      .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.margin.top + (chartAreaHeight / 2)})`);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcs = pie(data);

    // Central text elements (will be updated on hover)
    const centralTextTop = chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.3em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#1A202C");

    const centralTextBottom = chartGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.9em")
      .style("font-size", "11px")
      .style("fill", "#4B5563");

    function updateCentralText(topText, bottomText) {
        centralTextTop.text(topText);
        centralTextBottom.text(bottomText);
    }

    // Initial central text: Total
    updateCentralText(totalValue.toLocaleString(), "Total Listings");

    // Draw donut slices
    const sliceGroup = chartGroup.selectAll(".slice-group")
      .data(arcs)
      .enter()
      .append("g")
      .attr("class", "slice-group");

    sliceGroup.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "#FFFFFF")
      .style("stroke-width", "1.5px")
      .style("transition", "opacity 0.2s ease-in-out, transform 0.1s ease-out")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .style("opacity", 0.7)
          .attr("transform", "scale(1.03)");
        updateCentralText(d.data.value.toLocaleString(), d.data.label);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .style("opacity", 1)
          .attr("transform", "scale(1)");
        updateCentralText(totalValue.toLocaleString(), "Total Listings");
      });

    // Legend
    const legendGroup = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${dimensions.margin.left}, ${dimensions.margin.top + chartAreaHeight + 20})`); // Position below chart

    const legendItems = legendGroup.selectAll(".legend-item")
      .data(data) // Bind to original data for labels and values
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * (legendItemHeight + legendSpacing)})`)
      .style("cursor", "default")
      .on("mouseover", function(event, d) {
        // Find corresponding slice and trigger its mouseover
        sliceGroup.selectAll("path")
          .filter(sliceData => sliceData.data.label === d.label)
          .dispatch("mouseover");
        d3.select(this).select("text").style("font-weight", "bold");
      })
      .on("mouseout", function(event, d) {
        sliceGroup.selectAll("path")
          .filter(sliceData => sliceData.data.label === d.label)
          .dispatch("mouseout");
        d3.select(this).select("text").style("font-weight", "normal");
      });

    legendItems.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendItemHeight * 0.7)
      .attr("height", legendItemHeight * 0.7)
      .style("fill", (d, i) => color(i));

    legendItems.append("text")
      .attr("x", legendItemHeight)
      .attr("y", legendItemHeight * 0.35)
      .attr("dy", "0.32em")
      .style("font-size", "11px")
      .style("fill", "#374151")
      .text(d => `${d.label}: ${d.value.toLocaleString()} (${((d.value / totalValue) * 100).toFixed(1)}%)`);


  }, [data, dimensions, legendItemHeight, legendSpacing]);

  if (!data || data.length === 0) {
    return (
      <div className="my-4 p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col items-center justify-center" style={{width: dimensions.width, height: dimensions.height}}>
        <svg ref={d3Container} />
      </div>
    );
  }

  return (
    <div className="my-4 p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col items-center">
      <svg ref={d3Container} />
    </div>
  );
};
