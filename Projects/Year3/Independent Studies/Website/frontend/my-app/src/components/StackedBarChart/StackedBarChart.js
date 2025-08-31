// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import './StackedBarChart.css';

// Register Chart.js components to enable their usage
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Main component for rendering the stacked bar chart
const StackedBarChartVisualization = ({ query }) => {
  // State variables to manage chart data, loading state, and error state
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API whenever the `query` prop changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make a POST request to the API with the provided query
        const response = await fetch("https://flaksrepo.onrender.com/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }), // Send the query as the request body
        });

        // Handle HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const result = await response.json();

        // Check if the API returned valid results
        if (result.results && result.results.length > 0) {
          // Extract labels for the x-axis from the API response
          const labels = result.results.map((item) => item.GroupKey);

          // Calculate the total for each group to normalize the data
          const totals = result.results.map((item) => 
            item.BirthComplications + item.BirthDefects + 
            item.ResuscitationNeeded + item.BabyDeaths + item.NeonatalUnitTransfers
          );

          // Prepare datasets for the stacked bar chart
          const datasets = [
            {
              label: "Birth Complications",
              data: result.results.map((item, index) => (item.BirthComplications / totals[index]) * 100), // Normalize to percentage
              backgroundColor: "rgba(255, 99, 132, 0.7)", // Bar color
              borderColor: "rgba(255, 99, 132, 1)", // Border color
              borderWidth: 1, // Border width
            },
            {
              label: "Birth Defects",
              data: result.results.map((item, index) => (item.BirthDefects / totals[index]) * 100),
              backgroundColor: "rgba(255, 206, 86, 0.7)",
              borderColor: "rgba(255, 206, 86, 1)",
              borderWidth: 1,
            },
            {
              label: "Resuscitation Needed",
              data: result.results.map((item, index) => (item.ResuscitationNeeded / totals[index]) * 100),
              backgroundColor: "rgba(54, 162, 235, 0.7)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
            {
              label: "Baby Deaths",
              data: result.results.map((item, index) => (item.BabyDeaths / totals[index]) * 100),
              backgroundColor: "rgba(153, 102, 255, 0.7)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
            {
              label: "Neonatal Unit Transfers",
              data: result.results.map((item, index) => (item.NeonatalUnitTransfers / totals[index]) * 100),
              backgroundColor: "rgba(255, 159, 64, 0.7)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
          ];

          // Update the chart data state
          setChartData({
            labels,
            datasets,
          });
        } else {
          throw new Error("No data returned from the API.");
        }
      } catch (err) {
        // Handle errors during the fetch process
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        // Set loading to false once the fetch is complete
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

  // Render the bar chart with the fetched data
  return (
    <div className="chart">
      <Bar
        data={chartData} // Pass the chart data
        options={{
          responsive: true, // Make the chart responsive
          plugins: {
            legend: {
              position: "top", // Position the legend at the top
            },
            tooltip: {
              titleFont: { size: 16 }, // Increase tooltip title font size
              bodyFont: { size: 16 }, // Increase tooltip body font size
              footerFont: { size: 14 }, // Optional: Increase footer font size
              callbacks: {
                // Customize tooltip labels to show percentages
                label: (context) => {
                  const index = context.dataIndex;
                  const dataset = context.chart.data.datasets[context.datasetIndex];
                  const value = dataset.data[index];
                  return `${dataset.label}: ${value.toFixed(2)}%`;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true, // Enable stacking for the x-axis
              title: {
                display: true,
                text: "", // Placeholder for x-axis title
              },
            },
            y: {
              stacked: true, // Enable stacking for the y-axis
              beginAtZero: true, // Start y-axis at zero
              title: {
                display: true,
                text: "Percentage", // Label for the y-axis
              },
              ticks: {
                callback: (value) => `${value}%`, // Append '%' to y-axis tick labels
              },
            },
          },
          hover: {
            mode: "nearest", // Tooltip appears on the nearest point
            intersect: false, // Tooltip appears even when not directly on the point
          },
          elements: {
            point: {
              radius: 5, // Default size of points
              hoverRadius: 8, // Increase point size on hover
              hoverBorderWidth: 2, // Increase border width on hover
            },
          },
        }}
      />
    </div>
  );
};

// Export the component for use in other parts of the application
export default StackedBarChartVisualization;
