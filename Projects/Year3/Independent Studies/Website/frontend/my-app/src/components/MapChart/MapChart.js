import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import "./MapChart.css";

const MapChart = ({ query }) => {
  const svgRef = useRef(null); // Reference to the SVG element
  const containerRef = useRef(null); // Reference to the container for dynamic resizing
  const [dataMap, setDataMap] = useState(new Map()); // State to store the aggregated data
  const [geojson, setGeojson] = useState(null); // State to store GeoJSON data
  const [hoverData, setHoverData] = useState(null); // State to store hover data
  const [error, setError] = useState(null); // State to store error messages

  // Minimum size for the chart
  const MIN_WIDTH = 800; // Minimum width in pixels
  const MIN_HEIGHT = 600; // Minimum height in pixels

  // Fetch GeoJSON and query data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Query being sent to API:", query);

        // Fetch TopoJSON from Flask static folder
        const topoResponse = await fetch("/topo.json");
        if (!topoResponse.ok) throw new Error("Failed to fetch TopoJSON");
        const topojsonData = await topoResponse.json();

        // Extract GeoJSON from TopoJSON
        const geojsonData = topojson.feature(topojsonData, topojsonData.objects.rgn);
        setGeojson(geojsonData);

        // Fetch query results
        const dataResponse = await fetch("https://flaksrepo.onrender.com/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!dataResponse.ok) {
          const errorText = await dataResponse.text();
          console.error("API Error:", errorText);
          throw new Error("Failed to fetch chart data");
        }

        const result = await dataResponse.json();
        const dataArray = result.results;

        if (!Array.isArray(dataArray)) {
          throw new Error("API response does not contain a valid array");
        }

        // Aggregate the data by Region
        const aggregatedDataMap = dataArray.reduce((map, row) => {
          const regionName = row.Region.trim().toLowerCase(); // Normalize region name
          const complicationRatio = row.ComplicationRatio || 0; // Use ComplicationRatio from the query

          // Store ComplicationRatio for each region
          map.set(regionName, complicationRatio);

          return map;
        }, new Map());

        console.log("Aggregated Data Map:", aggregatedDataMap);
        setDataMap(aggregatedDataMap); // Store the aggregated data in state
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      }
    };

    fetchData();
  }, [query]); // Refetch data whenever the query changes

  // Render the map using D3.js
  const renderMap = () => {
    if (!geojson || dataMap.size === 0) return; // Exit if data is not ready

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);

    // Get the container's dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Apply minimum size constraints
    width = Math.max(width, MIN_WIDTH);
    height = Math.max(height, MIN_HEIGHT);

    // Clear any existing content in the SVG
    svg.selectAll("*").remove();

    // Create a projection and path generator
    const projection = d3.geoMercator().fitSize([width, height], geojson);
    const path = d3.geoPath().projection(projection);

    // Create a color scale
    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(Array.from(dataMap.values()))]);

    // Draw the map
    svg
      .attr("viewBox", `0 0 ${width} ${height}`) // Use viewBox for responsive scaling
      .attr("preserveAspectRatio", "xMidYMid meet")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const regionName = (d.properties.areanm || "").trim().toLowerCase(); // Normalize GeoJSON region name
        const value = dataMap.get(regionName) || 0; // Match with normalized dataMap keys
        return colorScale(value);
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        const regionName = (d.properties.areanm || "").trim().toLowerCase();
        const value = dataMap.get(regionName) || 0;

        // Update hover data
        setHoverData({ regionName, value });
      })
      .on("mouseout", () => {
        // Clear hover data
        setHoverData(null);
      });
  };

  // Initial render and resize handling
  useEffect(() => {
    renderMap(); // Initial render

    const handleResize = () => {
      renderMap(); // Re-render the map on resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [geojson, dataMap]); // Re-render the map whenever geojson or dataMap changes

  if (error) return <p>Error: {error}</p>;

  return (
    <div ref={containerRef} className="map-chart-container" style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} className="map-chart-svg"></svg>
      {hoverData && (
        <div className="hover-data">
          <p><strong>Region:</strong> {hoverData.regionName}</p>
          <p><strong>Complication Ratio:</strong> {(hoverData.value * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default MapChart;