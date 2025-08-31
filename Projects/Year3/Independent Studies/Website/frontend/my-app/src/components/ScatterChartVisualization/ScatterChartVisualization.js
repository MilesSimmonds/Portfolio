import React, { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components to enable their usage
ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const ScatterChartVisualization = ({ query }) => {
  // State variables to manage chart data, loading status, error messages, and toggle state
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(true);

  // Fetch data from the API whenever the `query` prop changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make a POST request to the API with the query as the payload
        const response = await fetch("https://flaksrepo.onrender.com/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        // Throw an error if the response is not OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();

        // Process the data if results are available
        if (result.results && result.results.length > 0) {
          // Extract unique group keys from the data
          const groups = [...new Set(result.results.map((item) => item.GroupKey))];

          // Define a set of colors for the chart
          const colors = [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(255, 87, 34, 0.6)",
            "rgba(63, 81, 181, 0.6)",
            "rgba(0, 150, 136, 0.6)",
            "rgba(233, 30, 99, 0.6)",
            "rgba(103, 58, 183, 0.6)",
            "rgba(244, 3, 192, 0.6)",
            "rgba(76, 175, 80, 0.6)",
            "rgba(255, 235, 59, 0.6)",
            "rgba(121, 85, 72, 0.6)",
          ];

          // Create datasets for each group
          const datasets = groups.map((group, index) => {
            const groupData = result.results
              .filter((item) => item.GroupKey === group)
              .map((item) => ({
                x: item.YearOfBirth, // X-axis value
                y: item.BirthComplications, // Y-axis value
                r: Math.min(Math.sqrt(item.BirthComplications) * 2, 8), // Bubble size
              }));
            return {
              label: group, // Group label
              data: groupData, // Data points for the group
              backgroundColor: colors[index % colors.length], // Background color
              borderColor: colors[index % colors.length].replace("0.6", "1"), // Border color
              borderWidth: 1, // Border width
            };
          });

          // Update the chart data state
          setChartData({
            datasets,
          });
        } else {
          throw new Error("No data returned from the API.");
        }
      } catch (err) {
        // Handle errors and update the error state
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        // Set loading to false after the fetch is complete
        setLoading(false);
      }
    };

    fetchData();
  }, [query]); // Dependency array ensures the effect runs when `query` changes

  // Display a loading message while data is being fetched
  if (loading) {
    return <p>Loading...</p>;
  }

  // Display an error message if an error occurred
  if (error) {
    return <p>Error: {error}</p>;
  }

  // Toggle visibility of all datasets
  const handleToggleAll = () => {
    if (!chartData) return;
    const updatedDatasets = chartData.datasets.map((ds) => ({
      ...ds,
      hidden: showAll, // Hide or show datasets based on the current toggle state
    }));
    setChartData({ ...chartData, datasets: updatedDatasets });
    setShowAll(!showAll); // Update the toggle state
  };

  return (
    <div className="chart">
      {/* Button to toggle visibility of all datasets */}
      <button onClick={handleToggleAll} style={{ marginBottom: "1rem" }}>
        {showAll ? "Hide All" : "Show All"}
      </button>
      {/* Render the scatter chart */}
      <Scatter
        data={chartData}
        options={{
          responsive: true, // Make the chart responsive
          scales: {
            x: {
              title: {
                display: true,
                text: "Year of Birth", // Label for the X-axis
                font: { size: 14 },
              },
            },
            y: {
              title: {
                display: true,
                text: "Total Birth Complications", // Label for the Y-axis
                font: { size: 14 },
              },
              beginAtZero: true, // Start Y-axis at zero
            },
          },
          plugins: {
            tooltip: {
              titleFont: { size: 16 }, // Tooltip title font size
              bodyFont: { size: 16 }, // Tooltip body font size
              footerFont: { size: 14 }, // Tooltip footer font size
              callbacks: {
                label: (context) => {
                  // Customize tooltip content
                  const index = context.dataIndex;
                  const dataset = context.chart.data.datasets[context.datasetIndex];
                  const value = dataset.data[index];
                  return `Year: ${value.x}, Birth Complications: ${value.y}, Group: ${dataset.label}`;
                },
              },
            },
          },
          hover: {
            mode: "nearest", // Tooltip appears on the nearest point
            intersect: false, // Tooltip appears even when not directly on the point
          },
          elements: {
            point: {
              radius: (context) => {
                // Dynamically set point radius based on the `r` property
                const value = context.raw?.r || 5;
                return value;
              },
              hoverRadius: 8, // Increase point size on hover
              hoverBorderWidth: 2, // Increase border width on hover
            },
          },
        }}
      />
    </div>
  );
};

export default ScatterChartVisualization;