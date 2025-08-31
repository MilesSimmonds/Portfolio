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
import './AntenetalCare.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StackedBarChartVisualization = ({ query }) => {
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
          const labels = result.results.map((item) => item.MotherEthnicCode);

          // Calculate the total for each group
          const totals = result.results.map((item) => 
            item.TotalIMVisits + item.BirthComplications + item.BirthDefects + 
            item.ResuscitationNeeded + item.BabyDeaths + item.NeonatalUnitTransfers
          );

          const datasets = [
            {
              label: "Total IM Visits",
              data: result.results.map((item, index) => (item.TotalIMVisits / totals[index]) * 100),
              backgroundColor: "rgba(75, 192, 192, 0.7)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Birth Complications",
              data: result.results.map((item, index) => (item.BirthComplications / totals[index]) * 100),
              backgroundColor: "rgba(255, 99, 132, 0.7)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
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
              titleFont: { size: 16 }, // Increases tooltip title size
              bodyFont: { size: 16 }, // Increases tooltip text size
              footerFont: { size: 14 }, // Optional: Increase footer font size
              callbacks: {
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
              stacked: true,
              title: {
                display: true,
                text: "",
              },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: {
                display: true,
                text: "Percentage",
              },
              ticks: {
                callback: (value) => `${value}%`,
              },
            },
          },
          hover: {
            mode: "nearest", // Ensures tooltip appears on the closest point
            intersect: false, // Allows tooltips even when not directly on the point
          },
          elements: {
            point: {
              radius: 5, // Default size of points
              hoverRadius: 8, // Increases point size on hover
              hoverBorderWidth: 2, // Increases border width on hover
            },
          },
        }}
      />
    </div>
  );
};

export default StackedBarChartVisualization;
