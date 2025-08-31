import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
// import './Sunburst.css';

const SunburstChart = () => {
  const chartRef = useRef(null); // Reference to the chart container
  const [data, setData] = useState([]); // State to store hierarchical data

  // Fetch data from the Flask API and transform it into a hierarchical format
  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `
          SELECT 
              m.v5WomEthnicOriginCode AS MotherEthnicCode, 
              COUNT(CASE WHEN b.BirthComplicnBn <> 0 THEN 1 END) AS BirthComplications,
              COUNT(CASE WHEN b.BirthDefectsCode <> 'none' THEN 1 END) AS BirthDefects,
              COUNT(CASE WHEN b.ResuscBn <> 0 THEN 1 END) AS ResuscitationNeeded,
              COUNT(CASE WHEN b.BabyDeathCode <> 0 THEN 1 END) AS BabyDeaths,
              COUNT(CASE WHEN b.XferNeonatalUnitCode <> 'none' THEN 1 END) AS NeonatalUnitTransfers,
              COUNT(b.BabyKey) AS TotalBabies
          FROM 
              motherv5 m
          JOIN 
              babyv5 b ON m.MainKey = b.MainKey
          GROUP BY 
              m.v5WomEthnicOriginCode
          ORDER BY 
              TotalBabies DESC;
        `;

        // Fetch data from the API
        const response = await fetch("https://flaksrepo.onrender.com/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();
        if (result.results) {
          // Transform the fetched data into a hierarchical structure suitable for the sunburst chart
          const transformedData = {
            name: "Total Births",
            children: result.results.map((d) => ({
              name: d.MotherEthnicCode,
              children: [
                { name: "Birth Complications", value: d.BirthComplications },
                { name: "Birth Defects", value: d.BirthDefects },
                { name: "Resuscitation Needed", value: d.ResuscitationNeeded },
                { name: "Baby Deaths", value: d.BabyDeaths },
                { name: "Neonatal Transfers", value: d.NeonatalUnitTransfers },
              ],
            })),
          };
          setData(transformedData); // Update the state with the transformed data
        }
      } catch (error) {
        console.error("Error fetching data:", error); // Log any errors
      }
    };

    fetchData(); // Call the fetchData function
  }, []);

  // Render the sunburst chart using D3.js
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return; // Exit if data is not available

    const width = 928; // Chart width
    const height = width; // Chart height
    const radius = width / 6; // Radius for the sunburst chart

    // Color scale for the chart segments
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout for the hierarchical data
    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value) // Sum up the values for each node
      .sort((a, b) => b.value - a.value); // Sort nodes by value
    const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy); // Partition layout
    root.each(d => d.current = d); // Store the current state of each node

    // Create the arc generator
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // Clear any previous chart
    d3.select(chartRef.current).select("svg").remove();

    // Create the SVG container
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "10px sans-serif");

    // Append the arcs for the chart
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1)) // Exclude the root node
      .join("path")
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); }) // Set color based on parent
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0) // Adjust opacity
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none") // Enable pointer events for visible arcs
      .attr("d", d => arc(d.current)); // Draw the arc

    // Make arcs clickable if they have children
    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    // Add tooltips to display data on hover
    const format = d3.format(",d");
    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    // Add labels to the chart
    const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current)) // Adjust label visibility
      .attr("transform", d => labelTransform(d.current)) // Position labels
      .text(d => d.data.name);

    // Add a central circle to reset zoom
    const parent = svg.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    // Handle zoom on click
    function clicked(event, p) {
      parent.datum(p.parent || root); // Update the parent node

      // Update the target positions for all nodes
      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = svg.transition().duration(event.altKey ? 7500 : 750); // Transition duration

      // Transition the arcs
      path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function(d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
        .attrTween("d", d => () => arc(d.current));

      // Transition the labels
      label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
    }

    // Check if an arc is visible
    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    // Check if a label is visible
    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    // Transform the label position
    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [data]);

  return <div ref={chartRef}></div>; // Render the chart container
};

export default SunburstChart;