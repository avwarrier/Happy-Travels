import { useEffect, useRef } from "react";
import * as d3 from 'd3';

/**
 * A D3.js component that renders a circular gauge to display a metric value
 * against a maximum value (e.g., "8.5 / 10"). Includes a label for the metric.
 *
 * @param {object} props - The component's props.
 * @param {number} props.value - The current value of the metric.
 * @param {number} [props.maxValue=10] - The maximum possible value for the metric.
 * @param {string} props.label - The label for the metric (e.g., "Cleanliness").
 * @param {string} [props.unit=""] - A unit string to append to the value (though less used with "X / Y" format).
 * @param {string} [props.color="#4FD1C5"] - The color for the value arc of the gauge.
 * @returns {JSX.Element} A div container with an SVG gauge chart, or a message if data is unavailable.
 */

export const MetricGaugeChart = ({ value, maxValue = 10, label, unit = "", color = "#4FD1C5" }) => {
  const d3Container = useRef(null);
  const dimensions = { width: 110, height: 140, margin: { top: 5, right: 5, bottom: 0, left: 5 } };
  const arcWidth = 10; // Width of the gauge's arc/stroke

  useEffect(() => {
    if (value === undefined || value === null || !d3Container.current) {
      return;
    }

    // Ensure value is within 0 and maxValue
    const validValue = Math.max(0, Math.min(value, maxValue));
    const percent = maxValue === 0 ? 0 : validValue / maxValue; // Avoid division by zero

    // SVG setup
    const svg = d3.select(d3Container.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll("*").remove(); // Clear previous renders

    // Calculate radius for the circle gauge
    const circleAreaHeight = dimensions.height - dimensions.margin.bottom;
    const diameter = Math.min(
        dimensions.width - dimensions.margin.left - dimensions.margin.right,
        circleAreaHeight - dimensions.margin.top // Use circleAreaHeight for diameter calculation
    );
    const outerRadius = diameter / 2;
    const innerRadius = outerRadius - arcWidth;

    // Center for the gauge circle
    const centerX = dimensions.width / 2;
    const centerY = circleAreaHeight / 2; // Center Y within the area designated for the circle

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
      .cornerRadius(arcWidth / 2); // Rounded ends for the arc stroke

    g.append('path')
      .attr('d', backgroundArcGenerator())
      .style('fill', '#E2E8F0'); // Tailwind: gray-300

    // Value Arc
    const valueArcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .cornerRadius(arcWidth / 2);

    g.append('path')
      .datum({ endAngle: valueEndAngle }) // Initial end angle for transition
      .style('fill', color)
      .transition()
      .duration(750) // Animation duration
      .attrTween("d", function(d) {
          // Interpolate the endAngle from startAngle to the target valueEndAngle
          const interpolate = d3.interpolate(startAngle, d.endAngle);
          return function(t) {
              d.endAngle = interpolate(t); // Update endAngle during transition
              return valueArcGenerator(d); // Generate new arc path
          };
      });

    // Text in the middle of the gauge (e.g., "8.5 / 10")
    g.append('text')
      .attr('text-anchor', 'middle')       // Horizontally center
      .attr('dominant-baseline', 'central') // Vertically center
      .style('font-size', outerRadius > 30 ? '16px' : '14px') // Adjust font size based on radius
      .style('font-weight', 'bold')
      .style('fill', '#1A202C') // Tailwind: gray-900
      .text(`${validValue.toFixed(2)} / ${maxValue.toFixed(0)}`);

  }, [value, maxValue, label, unit, color, dimensions, arcWidth]);

  // Fallback display if value is not available
  if (value === undefined || value === null) {
    return <p className="text-sm text-gray-500 text-center py-2">{label} data not available.</p>;
  }

  // Render the container for the SVG
  return (
    <div className="p-2 border w-fit h-fit border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col items-center">
        <h2 className="font-semibold">{label}</h2>
        <svg ref={d3Container} />
    </div>
  );
};
