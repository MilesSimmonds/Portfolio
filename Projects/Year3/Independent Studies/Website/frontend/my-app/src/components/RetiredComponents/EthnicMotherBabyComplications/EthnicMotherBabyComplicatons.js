import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const MotherEthnicityChart = () => {
  const chartRef = useRef(null); // Reference for the chart container
  const [data, setData] = useState([]); // State to store the fetched data

  // Fetch data from the Flask API
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
        
        const response = await fetch("http://127.0.0.1:5000/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
    
        const result = await response.json();
        console.log("API Response:", result); // Check the response structure
    
        if (result.results) {
          setData(result.results); // Extract the array from 'results'
        } else {
          console.error("Unexpected API response structure:", result);
        }
    
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Runs once on mount

  // Render the chart 
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;
  
    const margin = { top: 40, right: 30, bottom: 70, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    // Clear previous chart
    d3.select(chartRef.current).select("svg").remove();
  
    // Create SVG container
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Filter out invalid ethnic codes
    const filteredData = data.filter((d) => d.MotherEthnicCode !== "0");
  
    // Sort data by TotalBabies
    filteredData.sort((a, b) => b.TotalBabies - a.TotalBabies);
  
    // Define scales
    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.MotherEthnicCode))
      .range([0, width])
      .padding(0.2);
  
    const y = d3
      .scaleLog()
      .domain([1, d3.max(filteredData, (d) => d.TotalBabies)])
      .nice()
      .range([height, 0]);
  
    const color = d3.scaleOrdinal(d3.schemeTableau10);
  
    // Add axes
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
  
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y).ticks(10, "~s"));
  
    // Add axis labels
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Mother's Ethnic Group");
  
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Total Babies (log scale)");
  
    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Distribution of Total Babies by Mother's Ethnic Group");
  
    // Tooltip container
    const tooltip = d3
      .select(chartRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("border-radius", "5px");
  
    // Add bars
    svg.selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.MotherEthnicCode))
      .attr("y", (d) => y(d.TotalBabies))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.TotalBabies))
      .attr("fill", (d) => color(d.MotherEthnicCode))
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`
            <strong>Ethnic Origin Code:</strong> ${d.MotherEthnicCode}<br> 
            <strong>Total Babies:</strong> ${d.TotalBabies}<br>
            <strong>Birth Complications:</strong> ${d.BirthComplications}<br>
            <strong>Birth Defects:</strong> ${d.BirthDefects}<br>
            <strong>Neonatal Transfers:</strong> ${d.NeonatalUnitTransfers}
          `)
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  
    // Add average line
    const avg = d3.mean(filteredData, (d) => d.TotalBabies);
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(avg))
      .attr("y2", y(avg))
      .attr("stroke", "red")
      .attr("stroke-dasharray", "4")
      .attr("stroke-width", 1.5);
  
    svg.append("text")
      .attr("x", width - 10)
      .attr("y", y(avg) - 5)
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("fill", "red")
      .text(`Avg: ${Math.round(avg)}`);
  }, [data]);
  

  return <div ref={chartRef}></div>;
};

export default MotherEthnicityChart;
