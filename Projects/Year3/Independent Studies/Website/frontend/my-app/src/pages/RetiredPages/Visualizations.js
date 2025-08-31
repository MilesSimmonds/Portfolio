import React from 'react';
import AgeIssuesChart from '../components/AgeIssuesChart/AgeIssuesChart';
import MotherEthnicityChart from '../components/EthnicMotherBabyComplications/EthnicMotherBabyComplicatons';
import BarChartRace from '../components/BarChartRace/BarChartRace';


function Visualizations() {
    return (
        <div>
            <h2>Visualizations</h2>
            <BarChartRace/>
            <MotherEthnicityChart />
            <AgeIssuesChart />
           
        </div>
    );
}

export default Visualizations;
