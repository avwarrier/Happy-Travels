import { useEffect, useRef } from "react";
import * as d3 from 'd3';

/**
 * A D3.js component that renders a circular gauge to display a metric value
 * against a maximum value (e.g., "8.5 / 10"). Includes a label for the metric.
 *
 * @param {object} props - The component's props.
 * @param {number} props.value - The current value of the metric.
 * @param {number} [props.maxValue=10] - The maximum possible value. For 'percentage' displayMode, this should typically be 100 if `value` is the percentage number.
 * @param {string} props.label - The label for the metric (e.g., "Cleanliness"), displayed outside the SVG.
 * @param {string} [props.displayMode="ratio"] - How to display the value: "ratio" (e.g., "X / Y") or "percentage" (e.g., "X%").
 * @param {string} [props.unit=""] - Custom unit. If displayMode is 'percentage', '%' is appended automatically unless a unit is provided.
 * @param {string} [props.color="#4FD1C5"] - The color for the value arc of the gauge.
 * @returns {JSX.Element} A div container with an SVG gauge chart, or a message if data is unavailable.
 */
export const MetricGaugeChart = ({ value, maxValue = 10, label, displayMode = "ratio", unit = "", color = "#4FD1C5" }) => {
  const d3Container = useRef(null);
  const dimensions = { width: 110, height: 134, margin: { top: 5, right: 5, bottom: 5, left: 5 } };
  const arcWidth = 10; // Width of the gauge's arc/stroke

  useEffect(() => {
    if (value === undefined || value === null || !d3Container.current) {
      return;
    }

    const numericValue = parseFloat(value); // Ensure value is a number
    if (isNaN(numericValue)) {
        // Handle cases where value might be a non-numeric string after toFixed(2) if original is null/undefined
        console.error("MetricGaugeChart: Invalid value prop received", value);
        return;
    }

    // Ensure value is within 0 and maxValue
    const validValue = Math.max(0, Math.min(numericValue, maxValue));
    const percent = maxValue === 0 ? 0 : validValue / maxValue; // Avoid division by zero

    // SVG setup
    const svg = d3.select(d3Container.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll("*").remove(); // Clear previous renders

    // Calculate radius for the circle gauge
    const diameter = Math.min(
        dimensions.width - dimensions.margin.left - dimensions.margin.right,
        dimensions.height - dimensions.margin.top - dimensions.margin.bottom
    );
    const outerRadius = diameter / 2;
    const innerRadius = outerRadius - arcWidth;

    // Center for the gauge circle
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Group for arcs and central text, translated to the center of the circle area
    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Arc angles for a full circle
    const startAngle = 0;
    const backgroundEndAngle = 2 * Math.PI; // Full circle for background
    const valueEndAngle = percent * 2 * Math.PI;   // Value arc based on percentage

    // Background Arc
    const backgroundArcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(backgroundEndAngle)
      .cornerRadius(arcWidth / 2);

    g.append('path')
      .attr('d', backgroundArcGenerator())
      .style('fill', '#E2E8F0');

    // Value Arc
    const valueArcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .cornerRadius(arcWidth / 2);

    g.append('path')
      .datum({ endAngle: valueEndAngle })
      .style('fill', color)
      .transition()
      .duration(750)
      .attrTween("d", function(d) {
          const interpolate = d3.interpolate(startAngle, d.endAngle);
          return function(t) {
              d.endAngle = interpolate(t);
              return valueArcGenerator(d);
          };
      });

    // Text in the middle of the gauge
    let displayText = "";
    if (displayMode === 'percentage') {
      // For percentage, value is already the percentage number (e.g., 85 for 85%)
      // and maxValue is expected to be 100 for the arc.
      displayText = `${validValue.toFixed(0)}${unit || '%'}`;
    } else { // Default to 'ratio'
      displayText = `${validValue.toFixed(1)} / ${maxValue.toFixed(0)}${unit}`;
    }

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', outerRadius > 25 ? '16px' : '12px') // Adjusted font size for smaller gauge
      .style('font-weight', 'bold')
      .style('fill', '#1A202C')
      .text(displayText);

  }, [value, maxValue, label, displayMode, unit, color, dimensions, arcWidth]); // Added displayMode

  // Fallback display if value is not available
  if (value === undefined || value === null) {
    return (
        <div className="p-2 border w-fit h-fit border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col items-center">
            <h2 className="font-semibold text-sm mb-1">{label}</h2>
            <p className="text-xs text-gray-500 text-center py-2">N/A</p>
        </div>
    );
  }

  // Render the container for the SVG
  return (
    <div className="p-2 border w-fit h-fit border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col items-center">
        <h2 className="font-semibold text-sm mb-1">{label}</h2>
        <svg ref={d3Container} />
    </div>
  );
};
