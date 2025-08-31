import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import './BarChartVisualization.css';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChartVisualization = ({ query }) => {
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
          const labels = result.results.map((item) => item.MotherEthnicCode);
          const totalBabies = result.results.map((item) => item.TotalBabies);

          setChartData({
            labels,
            datasets: [
              {
                label: "Total Babies",
                data: totalBabies,
                backgroundColor: [
                  'rgba(150, 75, 0, 0.2)',   // Saddle Brown
                  'rgba(165, 42, 42, 0.2)',  // Brown
                  'rgba(210, 105, 30, 0.2)', // Chocolate
                  'rgba(139, 69, 19, 0.2)',  // Saddle Brown (Darker)
                  'rgba(160, 82, 45, 0.2)',  // Sienna
                  'rgba(205, 133, 63, 0.2)', // Peru
                  'rgba(222, 184, 135, 0.2)' // Burlywood
                ],
                borderColor: "rgba(150, 75, 0, 1)",
                borderWidth: 1,
              },
            ],
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
          scales: {
            x: {
              title: {
                display: true,
                text: "",
              },
            },
            y: {
              title: {
                display: true,
                text: "Total Babies",
              },
              beginAtZero: true,
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const index = context.dataIndex;
                  const dataset = context.chart.data.datasets[0];
                  const label = context.chart.data.labels[index];
                  const value = dataset.data[index];
                  return ` ${label}, Total Babies: ${value}`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

export default BarChartVisualization;
