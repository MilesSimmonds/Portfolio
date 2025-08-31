import React, { useState } from "react";
import "./ChartVisibilityDropdown.css"; // Optional CSS for styling

const ChartVisibilityDropdown = ({ chartVisibility, setChartVisibility }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to track dropdown visibility

  const handleCheckboxChange = (chartKey) => {
    setChartVisibility({
      ...chartVisibility,
      [chartKey]: !chartVisibility[chartKey],
    });
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="chart-visibility-dropdown">
      <button
        className="dropdown-toggle"
        onClick={toggleDropdown}
        aria-expanded={isDropdownOpen}
      >
        Select Charts to Display
      </button>
      {isDropdownOpen && (
        <div className="dropdown-menu">
          {Object.keys(chartVisibility).map((chartKey) => (
            <div key={chartKey} className="dropdown-item">
              <input
                type="checkbox"
                id={chartKey}
                checked={chartVisibility[chartKey]}
                onChange={() => handleCheckboxChange(chartKey)}
              />
              <label htmlFor={chartKey}>
                {chartKey
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChartVisibilityDropdown;