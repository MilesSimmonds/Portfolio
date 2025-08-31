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

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const LineChart = ({ query }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(true); // Toggle flag

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://flaksrepo.onrender.com/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.results && result.results.length > 0) {
          const labels = [...new Set(result.results.map((item) => item.YearOfBirth))];
          const types = [...new Set(result.results.map((item) => item.GroupKey))];

          const colors = [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgb(36, 136, 190)",
            "rgba(255, 87, 34, 0.6)",
            "rgba(63, 81, 181, 0.6)",
            "rgba(0, 150, 136, 0.6)",
            "rgba(233, 30, 99, 0.6)",
            "rgba(103, 58, 183, 0.6)",
            "rgba(3, 169, 244, 0.6)",
            "rgba(76, 175, 80, 0.6)",
            "rgba(255, 235, 59, 0.6)",
            "rgba(121, 85, 72, 0.6)",
          ];

          const datasets = types.map((type, index) => ({
            label: type,
            data: labels.map((year) => {
              const item = result.results.find(
                (item) => item.YearOfBirth === year && item.GroupKey === type
              );
              return item ? item.TotalBabies : 0;
            }),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace("0.6", "1"),
            borderWidth: 2,
            fill: false,
          }));

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
  }, [query]);



  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  const handleToggleAll = () => {
    if (!chartData) return;

    const updatedDatasets = chartData.datasets.map(ds => ({
      ...ds,
      hidden: showAll,
    }));

    setChartData({ ...chartData, datasets: updatedDatasets });
    setShowAll(!showAll);
  };
  
  return (
    <div className="line-chart">
      <button onClick={handleToggleAll} style={{ marginBottom: "1rem" }}>
        {showAll ? "Hide All" : "Show All"}
      </button>
      <Line
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
                  const value = dataset.data[index];
                  return `${dataset.label}: ${value}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Year of Birth",
              },
            },
            y: {
              title: {
                display: true,
                text: "Total Babies",
              },
            },
          },
          hover: {
            mode: "nearest",
            intersect: false,
          },
          elements: {
            point: {
              radius: 4,
              hoverRadius: 8,
              hoverBorderWidth: 2,
            },
          },
        }}
      />
    </div>
  );
};

export default LineChart;
