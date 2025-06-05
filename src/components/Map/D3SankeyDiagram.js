import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal as d3SankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';

/**
 * A D3.js (advanced) component that renders a Sankey diagram. Users can click on links
 * to select them and view their data in a persistent area below the chart.
 * Clicking again or the background deselects. This was chosen from the advanced visualization method
 * list on provided in class titled (Sankey or alluvial diagram).
 *
 * @param {object} props - The component's props.
 * @param {{nodes: Array<{nodeId: string, name?: string}>, links: Array<{source: string, target: string, value: number}>}} props.data -
 * An object containing 'nodes' and 'links'.
 * - `nodes`: Array of objects, each with a unique `nodeId` and optional `name`.
 * - `links`: Array of objects, each with `source` (nodeId), `target` (nodeId), and `value` (number).
 * @param {number} [props.width=220] - The width of the SVG container.
 * @param {number} [props.height=180] - The height of the SVG container.
 * @param {object} [props.nodeColors] - Optional D3 scaleOrdinal for node colors.
 * @returns {JSX.Element} A div container with an SVG Sankey diagram and data display area.
 */


export const SankeyDiagram = ({
  data,
  width = 220,
  height = 180,
  nodeColors
}) => {
  const d3Container = useRef(null);
  const [selectedLinkData, setSelectedLinkData] = useState(null); // Manages selected link state.
  const colors = nodeColors || d3.scaleOrdinal(d3.schemeTableau10); // Sets color scheme for nodes.
  const defaultLinkOpacity = 0.4;
  const selectedLinkOpacity = 0.9;
  const transitionDuration = 150;

  // --- D3 Rendering Logic ---
  useEffect(() => {
    const svgContainer = d3.select(d3Container.current);

    // Guard clause for no data.
    if (!data || !data.nodes || !data.links || data.nodes.length === 0 || data.links.length === 0) {
      svgContainer.selectAll("*").remove();
      svgContainer.attr('width', width).attr('height', height);
      svgContainer.append("text")
         .attr("x", width / 2)
         .attr("y", height / 2)
         .attr("text-anchor", "middle")
         .attr("dominant-baseline", "middle")
         .style("font-size", "12px")
         .style("fill", "#6B7280")
         .text("No data for Sankey diagram.");
      setSelectedLinkData(null);
      return;
    }

    // --- SVG and Chart Setup ---
    const svg = svgContainer
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll("*").remove(); // Clears previous SVG elements.

    // Background rectangle for deselection.
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("click", () => {
            setSelectedLinkData(null); // Deselects on background click.
        });

    // Defines chart margins and dimensions.
    const margin = { top: 10, right: 60, bottom: 10, left: 60 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    // --- Data Processing for Sankey ---
    // Prepares data for Sankey generator.
    const sankeyInputData = {
      nodes: data.nodes.map(n => ({ ...n, id: n.nodeId, name: n.name || n.nodeId })),
      links: data.links.map((l, index) => ({ ...l, originalIndex: index }))
    };

    // Configures the Sankey layout.
    const sankeyGenerator = d3Sankey()
      .nodeId(d => d.id)
      .nodeWidth(10)
      .nodePadding(10)
      .nodeAlign(sankeyJustify)
      .extent([[0, 0], [graphWidth, graphHeight]]);

    // Processes data, calculates layout.
    let processedGraph;
    try {
      processedGraph = sankeyGenerator(sankeyInputData);
    } catch (error) {
      console.error("Error processing Sankey data:", error, "\nData used:", JSON.stringify(sankeyInputData, null, 2));
      svg.append("text").attr("x", width/2).attr("y", height/2).text("Data Error.").style("fill","red").attr("text-anchor","middle");
      return;
    }
    const { nodes, links } = processedGraph;

    // --- Drawing Chart Elements ---
    // Group for chart elements.
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Creates selections for link paths.
    const linkPaths = g.append("g")
      .attr("fill", "none")
      .selectAll(".link")
      .data(links)
      .join("path")
      .attr("class", "link")
      .attr("d", d3SankeyLinkHorizontal()) // Draws link paths.
      .attr("stroke", d => colors(d.source.name))
      .attr("stroke-width", d => Math.max(1, d.width)) // Link width based on value.
      .style('cursor', 'pointer')
      .sort((a, b) => b.width - a.width);

    // --- Link Interaction Logic ---
    // Handles click-to-select functionality.
    linkPaths
      .on('click', function(event, d) {
        event.stopPropagation(); // Stops background click deselection.
        // Toggles selection on click.
        if (selectedLinkData && selectedLinkData.originalIndex === d.originalIndex) {
          setSelectedLinkData(null);
        } else {
          setSelectedLinkData(d);
        }
      });

    // Applies selected/default link styles.
    linkPaths
      .transition().duration(transitionDuration)
      .attr("stroke-opacity", d =>
        selectedLinkData && d.originalIndex === selectedLinkData.originalIndex ? selectedLinkOpacity : defaultLinkOpacity
      );

    // --- Drawing Node Elements ---
    // Creates selections for node groups.
    const nodeGroup = g.append("g")
      .selectAll(".node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style('cursor', 'default');

    // Draws rectangles for each node.
    nodeGroup.append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => Math.max(1, d.y1 - d.y0))
      .attr("width", d => d.x1 - d.x0)
      .style("fill", d => colors(d.name))
      .style("stroke", d => d3.rgb(colors(d.name)).darker(0.5))
      .style("stroke-width", 0.5)
      .append("title")
      .text(d => `${d.name}\nTotal Value: ${d.value.toLocaleString()}`);

    // Draws labels for each node.
    nodeGroup.append("text")
      .attr("x", d => d.x0 < graphWidth / 2 ? d.x1 + 5 : d.x0 - 5)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < graphWidth / 2 ? "start" : "end")
      .style("font-size", "9px")
      .style("fill", "#222")
      .style("pointer-events", "none")
      .text(d => d.name)
      .filter(d => (d.y1 - d.y0) < 12) // Hides labels on small nodes.
      .style("display", "none");

  }, [data, width, height, colors, selectedLinkData, transitionDuration]); // Re-renders on these changes.

  // --- Component JSX Return ---
  return (
    // Main container for the visual.
    <div className="my-2 p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 flex flex-col items-center relative" style={{alignItems: 'stretch'}}>
      <svg ref={d3Container} style={{ display: 'block', margin: 'auto', width: width, height: height }}/>
      {/* Persistent data display area. */}
      <div
        style={{
          minHeight: '60px',
          marginTop: '10px',
          padding: '8px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          fontSize: '12px',
          textAlign: 'left',
          width: width * 0.95,
          margin: '10px auto 0 auto',
          boxSizing: 'border-box', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {/* Shows details or placeholder text. */}
        {selectedLinkData ? (
          <>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold', color: '#333' }}>Selected Flow:</h4>
            <div><strong>From:</strong> {selectedLinkData.source.name}</div>
            <div><strong>To:</strong> {selectedLinkData.target.name}</div>
            <div><strong>Value:</strong> {selectedLinkData.value.toLocaleString()}</div>
          </>
        ) : (
          <p style={{ margin: '0', color: '#6B7280', textAlign: 'center', fontStyle: 'italic' }}>
            Click a flow on the diagram to see details.
          </p>
        )}
      </div>
    </div>
  );
};
