import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import './BarChartRace.css';

const BarChartRace = () => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const [currentDate, setCurrentDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `
          SELECT 
              YearOfBirth, 
              v5WomEthnicOriginCode AS MotherEthnicCode, 
              COUNT(*) AS TotalBirths 
          FROM 
              motherv5 
          GROUP BY 
              YearOfBirth, v5WomEthnicOriginCode 
          ORDER BY 
              YearOfBirth ASC, TotalBirths DESC;
        `;

        const response = await fetch("http://127.0.0.1:5000/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (result.results) {
          setData(result.results);
        } else {
          console.error("Unexpected API response structure:", result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) return;

    const margin = { top: 40, right: 30, bottom: 70, left: 100 };
    const containerWidth = chartRef.current.clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const n = 12; // Number of bars to display

    // Clear previous chart
    d3.select(chartRef.current).select("svg").remove();

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const groupedData = d3.group(data, (d) => d.YearOfBirth);
    const years = Array.from(groupedData.keys()).sort();

    const cumulativeData = new Map();
    years.forEach((year) => {
      const yearData = groupedData.get(year) || [];
      yearData.forEach((entry) => {
        if (!cumulativeData.has(entry.MotherEthnicCode)) {
          cumulativeData.set(entry.MotherEthnicCode, 0);
        }
        entry.TotalBirths += cumulativeData.get(entry.MotherEthnicCode);
        cumulativeData.set(entry.MotherEthnicCode, entry.TotalBirths);
      });
    });

    const rank = (data) => {
      return data
        .slice()
        .sort((a, b) => b.TotalBirths - a.TotalBirths)
        .slice(0, n)
        .map((d, i) => ({ ...d, rank: i }));
    };

    const x = d3.scaleLinear([0, 1], [0, width]);
    const y = d3
      .scaleBand()
      .domain(d3.range(n + 1))
      .rangeRound([0, height])
      .padding(0.1);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "x-axis");

    svg.append("g").attr("class", "bars");

    svg.append("g").attr("class", "labels");

    svg.append("text")
      .attr("class", "date-label")
      .attr("x", width)
      .attr("y", height - 10)
      .attr("text-anchor", "end")
      .style("font", "bold 24px var(--sans-serif)")
      .text(years[0]);

    const update = (year) => {
      const yearData = groupedData.get(year) || [];
      const rankedData = rank(yearData);

      x.domain([0, d3.max(rankedData, (d) => d.TotalBirths)]);

      svg
        .select(".x-axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(width / 80, "s"));

      const bars = svg
        .select(".bars")
        .selectAll("rect")
        .data(rankedData, (d) => d.MotherEthnicCode);

      bars
        .enter()
        .append("rect")
        .attr("fill", (d) => color(d.MotherEthnicCode))
        .attr("height", y.bandwidth())
        .attr("y", (d) => y(d.rank))
        .attr("x", x(0))
        .attr("width", 0)
        .transition()
        .duration(1000)
        .attr("width", (d) => x(d.TotalBirths));

      bars
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.rank))
        .attr("width", (d) => x(d.TotalBirths));

      bars
        .exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .remove();

      const labels = svg
        .select(".labels")
        .selectAll("text")
        .data(rankedData, (d) => d.MotherEthnicCode);

      labels
        .enter()
        .append("text")
        .attr("y", (d) => y(d.rank) + y.bandwidth() / 2)
        .attr("x", (d) => x(d.TotalBirths) - 6)
        .attr("dy", "0.35em")
        .text((d) => `${d.MotherEthnicCode}: ${d.TotalBirths}`)
        .style("font", "bold 12px var(--sans-serif)")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .transition()
        .duration(1000)
        .attr("x", (d) => x(d.TotalBirths) - 6);

      labels
        .transition()
        .duration(1000)
        .attr("y", (d) => y(d.rank) + y.bandwidth() / 2)
        .attr("x", (d) => x(d.TotalBirths) - 6)
        .text((d) => `${d.MotherEthnicCode}: ${d.TotalBirths}`);

      labels.exit().transition().duration(1000).attr("x", x(0)).remove();

      svg.select(".date-label").text(year);
    };

    const showFinalTotals = () => {
      const totalData = Array.from(cumulativeData, ([MotherEthnicCode, TotalBirths]) => ({ MotherEthnicCode, TotalBirths }));
      totalData.sort((a, b) => b.TotalBirths - a.TotalBirths);

      x.domain([0, d3.max(totalData, (d) => d.TotalBirths)]);

      svg
        .select(".x-axis")
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(width / 80, "s"));

      const bars = svg
        .select(".bars")
        .selectAll("rect")
        .data(totalData, (d) => d.MotherEthnicCode);

      bars
        .enter()
        .append("rect")
        .attr("fill", (d) => color(d.MotherEthnicCode))
        .attr("height", y.bandwidth())
        .attr("y", (d, i) => y(i))
        .attr("x", x(0))
        .attr("width", 0)
        .transition()
        .duration(1000)
        .attr("width", (d) => x(d.TotalBirths));

      bars
        .transition()
        .duration(1000)
        .attr("y", (d, i) => y(i))
        .attr("width", (d) => x(d.TotalBirths));

      bars
        .exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .remove();

      const labels = svg
        .select(".labels")
        .selectAll("text")
        .data(totalData, (d) => d.MotherEthnicCode);

      labels
        .enter()
        .append("text")
        .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("x", (d) => x(d.TotalBirths) - 6)
        .attr("dy", "0.35em")
        .text((d) => `${d.MotherEthnicCode}: ${d.TotalBirths}`)
        .style("font", "bold 12px var(--sans-serif)")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .transition()
        .duration(1000)
        .attr("x", (d) => x(d.TotalBirths) - 6);

      labels
        .transition()
        .duration(1000)
        .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("x", (d) => x(d.TotalBirths) - 6)
        .text((d) => `${d.MotherEthnicCode}: ${d.TotalBirths}`);

      labels.exit().transition().duration(1000).attr("x", x(0)).remove();

      svg.select(".date-label").text("Final Totals");
    };

    let yearIndex = 0;
    const interval = setInterval(() => {
      if (yearIndex < years.length) {
        update(years[yearIndex]);
        yearIndex++;
      } else {
        clearInterval(interval);
        showFinalTotals();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return <div ref={chartRef} className="chart-container"></div>;
};

export default BarChartRace;