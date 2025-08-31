import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">Maternity Insights</Link>
                <ul className="navbar-menu">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/Dashboard">Dashboard</Link></li>
                    {/* <li><Link to="/visualizations">Visualizations</Link></li> */}
                    <li><Link to="/about">About</Link></li>
                    
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
