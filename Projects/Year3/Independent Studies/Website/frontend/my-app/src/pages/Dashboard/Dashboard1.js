import React, { useState } from "react";
// Importing chart components and utilities
import ScatterChartVisualization from "../../components/ScatterChartVisualization/ScatterChartVisualization";
import SunburstChartVisualization from "../../components/SunburstChartVisualization/SunburstChartVisualization";
import StackedBarChartVisualization from "../../components/StackedBarChart/StackedBarChart";
import BarChart from "../../components/BarChart/BarChart";
import SelectBox from "../../components/Dashboard1Select/Select";
import LineChart from "../../components/LineChart/LineChart";
import MapChart from "../../components/MapChart/MapChart";
import MapChart2 from "../../components/MapChart2/MapChart2";
import Modal from "../../components/Modal/Modal";
import ChartVisibilityDropdown from "../../components/ChartVisibilityDropdown/ChartVisibilityDropdown";
import './Dashboard1.css'; // Importing CSS for styling

const Dashboard = () => {
  // State variables for managing user selections and chart visibility
  const [selectedValue, setSelectedValue] = useState("v5WomEthnicOriginCode");
  const [startYear, setStartYear] = useState(2006);
  const [endYear, setEndYear] = useState(2012);
  const [modalContent, setModalContent] = useState(null);
  const [chartVisibility, setChartVisibility] = useState({
    lineChart: true,
    scatterChart: true,
    stackedBarChart: true,
    barChart: true,
    mapChart2: true,
    mapChart1: true,
    sunburstChart: true,
  });
  const [secondaryGroup, setSecondaryGroup] = useState(null);

  // Handler for primary group selection
  const handleGroupChange = (event) => {
    setSelectedValue(event.target.value);
  };

  // Handler for start year selection
  const handleStartYearChange = (event) => {
    const IntStartYear = parseInt(event.target.value);
    if (IntStartYear <= endYear) {
      setStartYear(event.target.value);
    }
  };

  // Handler for end year selection
  const handleEndYearChange = (event) => {
    const IntEndYear = parseInt(event.target.value);
    if (IntEndYear >= startYear) {
      setEndYear(event.target.value);
    }
  };

  // Modal management functions
  const openModal = (content) => {
    setModalContent(content);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  // Options for dropdown menus
  const options = [
    { value: "v5WomEthnicOriginCode", label: "Ethnic Group" },
    { value: "PopnCode", label: "Area Population Density" },
    { value: "WomAge", label: "Age" },
    { value: "v5FatherAge", label: "Father's Age" },
    { value: "v4WomOccupCode", label: "Occupation" },
    { value: "NumIMVisitsAN", label: "Number of Pre Birth Visits" },
    { value: "PartnerStatusCode", label: "Marital Status" },
    { value: "GOR", label: "Region" },
    { value: "BMIxp", label: "Mother's BMI" },
    { value: "WomSmokeCode", label: "Mother's Smoking Habits" },
    { value: "WomAlcoholCode", label: "Mother's Drinking Habits" },
    { value: "v4ActualBthPlaceCode", label: "Birth Place" },
    { value: "WomDietCode", label: "Diet" },
    { value: "TotalLabourHrs", label: "Total Labour Hours" },
  ];

  const selectedLabel = options.find((option) => option.value === selectedValue)?.label || "Selected Value";

  // Helper function to get the grouping key for SQL queries
  const getGroupKey = () => {
    if (secondaryGroup && secondaryGroup !== selectedValue) {
      return `CONCAT(m.${selectedValue}, '-', m.${secondaryGroup})`;
    }
    return `m.${selectedValue}`;
  };

  // Year options for dropdown menus
  const years = [
    { value: "2006", label: "2006" },
    { value: "2007", label: "2007" },
    { value: "2008", label: "2008" },
    { value: "2009", label: "2009" },
    { value: "2010", label: "2010" },
    { value: "2011", label: "2011" },
    { value: "2012", label: "2012" },
  ];

  // SQL queries for different charts
  const LineChartQuery = `
  SELECT  
    ${getGroupKey()} AS GroupKey,  
    m.YearOfBirth,
    COUNT(b.BabyKey) AS TotalBabies
  FROM 
    motherv5 m
  JOIN 
    babyv5 b ON m.MainKey = b.MainKey
  WHERE 
    m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
    AND m.${selectedValue} IS NOT NULL
    AND m.${selectedValue} <> 'NULL'
    ${secondaryGroup ? `AND m.${secondaryGroup} IS NOT NULL AND m.${secondaryGroup} <> 'NULL'` : ""}
    AND b.BabyKey IS NOT NULL
  GROUP BY 
    GroupKey, m.YearOfBirth
  ORDER BY 
    m.YearOfBirth, GroupKey;
`;

const ScatterQuery = `
  SELECT 
    ${getGroupKey()} AS GroupKey,
    m.YearOfBirth,
    COUNT(CASE WHEN b.BirthComplicnBn <> 0 THEN 1 END) AS BirthComplications,
    COUNT(b.BabyKey) AS TotalBabies,
    COALESCE(
      ROUND(
        (COUNT(CASE WHEN b.BirthComplicnBn <> 0 THEN 1 END) * 100.0) / NULLIF(COUNT(b.BabyKey), 0),
        2
      ),
      0
    ) AS ComplicationRate
  FROM 
    motherv5 m
  JOIN 
    babyv5 b ON m.MainKey = b.MainKey
  WHERE 
    m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
    AND m.${selectedValue} IS NOT NULL
    AND m.${selectedValue} <> 'NULL'
    ${secondaryGroup ? `AND m.${secondaryGroup} IS NOT NULL AND m.${secondaryGroup} <> 'NULL'` : ""}
    AND b.BabyKey IS NOT NULL
  GROUP BY 
    GroupKey, m.YearOfBirth
  ORDER BY 
    m.YearOfBirth, GroupKey;
`;

  
const SunBurstQuery = `
  SELECT 
    ${getGroupKey()} AS GroupKey,
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
  WHERE 
    m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
    AND m.${selectedValue} IS NOT NULL
    AND m.${selectedValue} <> 'NULL'
    ${secondaryGroup ? `AND m.${secondaryGroup} IS NOT NULL AND m.${secondaryGroup} <> 'NULL'` : ""}
    AND b.BabyKey IS NOT NULL
  GROUP BY 
    GroupKey
  ORDER BY 
    TotalBabies DESC;
`;

  
const StackedBarChartQuery = `
SELECT 
  ${getGroupKey()} AS GroupKey,
  SUM(m.NumIMVisitsAN) AS TotalIMVisits,
  AVG(m.NumIMVisitsAN) AS AvgIMVisits,
  COUNT(CASE WHEN COALESCE(b.BirthComplicnBn, 0) <> 0 THEN 1 END) AS BirthComplications,
  COUNT(CASE WHEN COALESCE(b.BirthDefectsCode, 'none') NOT IN ('none', 'NULL') THEN 1 END) AS BirthDefects,
  COUNT(CASE WHEN COALESCE(b.ResuscBn, 0) <> 0 THEN 1 END) AS ResuscitationNeeded,
  COUNT(CASE WHEN COALESCE(b.BabyDeathCode, 0) <> 0 THEN 1 END) AS BabyDeaths,
  COUNT(CASE WHEN COALESCE(b.XferNeonatalUnitCode, 'none') NOT IN ('none', 'NULL') THEN 1 END) AS NeonatalUnitTransfers,
  COUNT(b.BabyKey) AS TotalBabies
FROM 
  motherv5 m
JOIN 
  babyv5 b ON m.MainKey = b.MainKey
WHERE 
  m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
  AND m.${selectedValue} IS NOT NULL
  AND m.${selectedValue} <> 'NULL'
  ${secondaryGroup ? `AND m.${secondaryGroup} IS NOT NULL AND m.${secondaryGroup} <> 'NULL'` : ""}
  AND b.BabyKey IS NOT NULL
GROUP BY 
  GroupKey
ORDER BY 
  TotalIMVisits DESC;
`;


const BarChartQuery = `
  SELECT 
    ${getGroupKey()} AS GroupKey,
    COUNT(b.BabyKey) AS TotalIndividuals, 
    COUNT(CASE WHEN m.NumIMVisitsAN > 0 THEN 1 END) AS TotalIMVisits,
    COALESCE((COUNT(CASE WHEN m.NumIMVisitsAN > 0 THEN 1 END) * 100.0) / NULLIF(COUNT(b.BabyKey), 0), 0) AS PercentageIMVisits
  FROM 
    motherv5 m
  JOIN 
    babyv5 b ON m.MainKey = b.MainKey
  WHERE 
    m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
    AND m.${selectedValue} IS NOT NULL
    AND m.${selectedValue} <> 'NULL'
    ${secondaryGroup ? `AND m.${secondaryGroup} IS NOT NULL AND m.${secondaryGroup} <> 'NULL'` : ""}
    AND b.BabyKey IS NOT NULL
  GROUP BY 
    GroupKey
  ORDER BY 
    PercentageIMVisits DESC;
`;




const MapChartQuery = `
  SELECT 
    m.GOR AS Region, 
    COUNT(b.BabyKey) AS TotalBirths,
    COUNT(CASE WHEN b.BirthComplicnBn <> 0 THEN 1 END) AS BirthComplications,
    CAST(COUNT(CASE WHEN b.BirthComplicnBn <> 0 THEN 1 END) AS FLOAT) / 
    NULLIF(COUNT(b.BabyKey), 0) AS ComplicationRatio
  FROM 
    motherv5 m
  JOIN 
    babyv5 b ON m.MainKey = b.MainKey
  WHERE 
    m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
    AND m.GOR IS NOT NULL
    AND m.GOR <> 'NULL'
  GROUP BY 
    m.GOR
  ORDER BY 
    ComplicationRatio DESC;
`;

    const MapChartQuery2 = `
  SELECT 
    m.GOR AS Region, 
    COUNT(b.BabyKey) AS TotalBabies
  FROM 
    motherv5 m
  JOIN 
    babyv5 b ON m.MainKey = b.MainKey
  WHERE 
    m.YearOfBirth BETWEEN ${startYear} AND ${endYear}
    AND m.GOR IS NOT NULL
    AND m.GOR <> 'NULL'
  GROUP BY 
    m.GOR
  ORDER BY 
    TotalBabies DESC;
  `;
  
  return (
    <div>
      <h1>Maternity Visualisation Insights</h1>
      <div className="select-container">
        {/* Dropdowns for selecting grouping, secondary grouping, and years */}
        <div className="item1">
          <label htmlFor="GroupSelect">Select Grouping:</label>
          <SelectBox options={options} value={selectedValue} onChange={handleGroupChange} />
        </div>
        
        <div className="item1">
          <label htmlFor="SecondaryGroupSelect">Secondary Grouping (optional):</label>
          <SelectBox
            options={[{ value: "", label: "None" }, ...options]}
            value={secondaryGroup || ""}
            onChange={(e) => setSecondaryGroup(e.target.value || null)}
          />
        </div>

        {/* Dropdown for selecting start year */}
        <div className="item2">
          <label htmlFor="StartDate">Start Date:</label>
          <SelectBox options={years} value={startYear} onChange={handleStartYearChange} />
        </div>
        
        {/* Dropdown for selecting end year */}
        <div className="item3">
          <label htmlFor="EndDate">End Date:</label>
          <SelectBox options={years} value={endYear} onChange={handleEndYearChange} />
        </div>
       
        <div className="item4 "><ChartVisibilityDropdown
        chartVisibility={chartVisibility}
        setChartVisibility={setChartVisibility} />
        </div>
      </div>
      
      {/* Modal for fullscreen chart display */}
      <Modal show={modalContent !== null} onClose={closeModal}>
        {modalContent}
      </Modal>
      
      {/* Chart container displaying various charts */}
      <div className="chart-container">

        {/* Line chart */}
          {chartVisibility.lineChart && (
          <div className="chart">
            <label htmlFor="ChartTitle">Total babies born by {selectedLabel} over time:</label>
            <LineChart query={LineChartQuery} />
            <p>This line chart shows the total number of babies born over time for each {selectedLabel} group. The chart provides insights into the trends and patterns of births over the selected years.</p>
            {/* <button onClick={() => openModal(<LineChart query={LineChartQuery} />)}>Fullscreen</button> */}
          </div>
        )}
        
        {/* Scatter chart */}
        {chartVisibility.scatterChart && (
          <div className="chart">
            <label htmlFor="ChartTitle">Birth Complications by {selectedLabel} and Year:</label>
            <ScatterChartVisualization query={ScatterQuery} />
            <p>Birth Complications are defined as any complications that occur during the birth of a baby. This chart shows the number of birth complications over the years, grouped by {selectedLabel}. Each point on the scatter plot represents the count of birth complications for a specific year and group.</p>
            {/* <button onClick={() => openModal(<ScatterChartVisualization query={ScatterQuery} />)}>Fullscreen</button> */}
          </div>
        )}
          
        {/* Stacked bar chart */}
        {chartVisibility.stackedBarChart && (
          <div className="chart">
            <label htmlFor="ChartTitle">Total BirthComplications by {selectedLabel}:</label>
            <StackedBarChartVisualization query={StackedBarChartQuery} />
            <p>
            This stacked bar chart shows the percentage distribution of birth-related outcomes for each group based on the selected grouping. 
            Each bar represents a group, and the segments within the bar indicate the proportion of cases with birth complications, 
            birth defects, resuscitation needed, baby deaths, and neonatal unit transfers. The chart allows for a quick comparison of these outcomes across different groups,
            highlighting variations in birth-related outcomes.
            </p>
            {/* <button onClick={() => openModal(<StackedBarChartVisualization query={StackedBarChartQuery} />)}>Fullscreen</button> */}
          </div>
        )}

        {/* Bar chart */}     
        {chartVisibility.barChart && (
          <div className="chart">
            <label htmlFor="ChartTitle">Total Antenatal Care visits by {selectedLabel}:</label>
            <BarChart query={BarChartQuery} />
            <p>This chart shows the total number of antenatal care visits by {selectedLabel}. The chart is stacked to show the average number of visits, total number of visits, and the number of babies with birth complications, birth defects, resuscitation needed, baby deaths, and neonatal unit transfers.</p>
            {/* <button onClick={() => openModal(<BarChart query={BarChartQuery} />)}>Fullscreen</button> */}
          </div>
        )}

        {/* Map chart 2 */}
        {chartVisibility.mapChart2 && (
          <div className="chart">
            <label htmlFor="ChartTitle">Map dataset overview based on birth rates between {startYear} and {endYear}:</label>
            <MapChart2 query={MapChartQuery2} />
            <p>This map chart provides an overview of the dataset showing the birth totals based on region and the selected time period.</p>
            {/* <button onClick={() => openModal(<MapChart2 query={MapChartQuery2} />)}>Fullscreen</button> */}
          </div>
        )}
              
        {/* Map chart */}
        {chartVisibility.mapChart1 && (
          <div className="chart">
            <label htmlFor="ChartTitle">Map dataset overview based on birth complication rates between {startYear} and {endYear}:</label>
            <MapChart query={MapChartQuery} />
            <p>This map chart provides an overview of the dataset showing the birth complication ratio based on region and the selected time period.</p>
            {/* <button onClick={() => openModal(<MapChart query={MapChartQuery} />)}>Fullscreen</button> */}
          </div>
        )}

        {/* Sunburst chart */}
        {chartVisibility.sunburstChart && (
          <div className="chart">
            <label htmlFor="ChartTitle">Dataset overview based on {selectedLabel} grouping:</label>
            <SunburstChartVisualization query={SunBurstQuery} />
            <p>This sunburst chart provides an overview of the dataset based on the {selectedLabel} grouping. The chart shows the total number of babies born, birth complications, birth defects, resuscitation needed, baby deaths, and neonatal unit transfers for each group.</p>
            <p>Click on the chart to zoom in and explore the data further, Hovering over a segment will display numerical data.</p>
            {/* <button onClick={() => openModal(<SunburstChartVisualization query={SunBurstQuery} />)}>Fullscreen</button> */}
          </div>
        )}
        
      </div>
    
    </div>
  );
};

export default Dashboard;
