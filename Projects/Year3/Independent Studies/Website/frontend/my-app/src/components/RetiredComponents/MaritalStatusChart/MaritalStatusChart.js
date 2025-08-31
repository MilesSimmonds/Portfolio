import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
//import "./MaritalStatusChart.css"; // Ensure you have a CSS file for styling

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const MaritalStatusChart = ({ query }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }), // Use the passed query
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.results && result.results.length > 0) {
          const labels = result.results.map((item) => item.MotherMaritalStatus);
          const totalBabies = result.results.map((item) => item.TotalBabies);

          setChartData({
            labels,
            datasets: [
              {
                label: "Total Babies by Marital Status",
                data: totalBabies,
                backgroundColor: "rgba(54, 162, 235, 0.6)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                fill: false,
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
    <div className="line-chart">
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const index = context.dataIndex;
                  const dataset = context.chart.data.datasets[0];
                  const label = context.chart.data.labels[index];
                  const value = dataset.data[index];
                  return `${label}: ${value}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Marital Status',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Total Babies',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default MaritalStatusChart;
