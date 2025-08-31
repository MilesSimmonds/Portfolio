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
import './BarChart.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ query }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://flaksrepo.onrender.com/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }), // Use the passed query
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.results && result.results.length > 0) {
          // Extract labels and data from the query results
          const labels = result.results.map((item) => item.GroupKey);
          const percentages = result.results.map((item) => item.PercentageIMVisits);
          const totals = result.results.map((item) => item.TotalIMVisits);
          

          const datasets = [
            {
              label: "Percentage of IM Visits",
              data: percentages,
              backgroundColor: "rgba(75, 192, 192, 0.7)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              totals, // Store the total numerical values for tooltips
            },
          ];

          setChartData({
            labels,
            datasets,
          });
        } else {
          throw new Error("No data returned from the API.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]); // Re-run the fetch when the query changes

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="chart">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              titleFont: { size: 16 },
              bodyFont: { size: 16 },
              footerFont: { size: 14 },
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const dataset = context.chart.data.datasets[context.datasetIndex];
                const percentage = dataset.data[index]; // Percentage from the query
                const total = dataset.totals[index]; // Total IM visits from the query
                return `${percentage}% / ${total} IM Visits`; // Format percentage to 1 decimal place
              },
            },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Percentage of IM Visits (%) / Total IM Visits",
              },
              ticks: {
                callback: (value) => `${value}%`, // Display percentages on the y-axis
              },
            },
          },
        }}
      />
    </div>
  );
};

export default BarChart;
