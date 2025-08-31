import React from 'react';
import SunburstChart from '../../components/SunBurst/SunBurst';
import './Home.css'

function Home() {
    return (
        <div>
            <h1>Maternal Health & Maternity Services in the UK</h1>
            <div class = "home_content">
                <div class = "chartitem1">
                        <SunburstChart />
                </div>

                <h2>The need for data-driven decision making in healthcare is pivotal for providing quality care.
                    An area such as maternal care requires accurate, timely insights to provide the best care possible 
                    as well as identify shortcomings in the service provided and make the required improvements. 
                </h2>

            </div>
        </div>
    );
}   

export default Home;
