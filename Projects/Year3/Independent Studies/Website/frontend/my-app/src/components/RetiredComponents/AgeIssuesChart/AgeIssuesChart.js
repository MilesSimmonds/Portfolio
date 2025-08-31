import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MaternalHealthChart = () => {
  const [data, setData] = useState([]); // State to store the fetched data
  const chartRef = useRef(null); // Ref for the SVG container

  // Fetch data from the Flask API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/motherv5");
        const result = await response.json();
        setData(result); // Store the fetched data in state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Render the Pack chart with D3
  useEffect(() => {
    if (data.length === 0) return; // Wait until data is fetched

    // Group data by v5WomEthnicOriginCode
    const groupedData = d3.group(data, d => d.v5WomEthnicOriginCode);

    // Create a hierarchical structure
    const hierarchyData = {
      name: "Maternal Health",
      children: Array.from(groupedData, ([ethnicOrigin, records]) => ({
        name: ethnicOrigin,
        children: [
          { name: "Miscarriage", value: records.filter(d => d.NumMiscarr > 0).length },
          { name: "Postnatal Depression", value: records.filter(d => d.PostNatalDepressionCode === "1").length },
          { name: "PPH", value: records.filter(d => d.NumPPH > 0).length },
          { name: "Maternal Death", value: records.filter(d => d.MaternalDeathBn > 0).length },
        ],
      })),
    };

    const width = 800;
    const height = 800;

    // Create the SVG container
    const svg = d3.select(chartRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "background-color: #f8f9fa; border: 1px solid #ddd");

    // Create a Pack layout
    const pack = d3.pack()
      .size([width, height])
      .padding(10);

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value);

    const nodes = pack(root).descendants();

    // Bind data and draw circles
    const nodeGroup = svg.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Draw circles
    nodeGroup.append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => d.depth === 0 ? "#6c757d" : d.children ? "#f0e68c" : d3.schemeCategory10[d.parent.data.name.charCodeAt(0) % 10])
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

    // Add text labels for all nodes
    nodeGroup.append("text")
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .attr("font-size", d => d.r / 5)
      .text(d => d.depth === 0 ? "" : d.data.name);

    // Add ethnic group labels near the top-level circles
    nodeGroup.filter(d => d.depth === 1)
      .append("text")
      .attr("dy", d => d.r + 20) // Position below the circle
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(d => d.data.name); // Use the ethnic group code

  }, [data]);

  return (
    <div>
      {data.length > 0 ? (
        <svg ref={chartRef}></svg>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default MaternalHealthChart;
