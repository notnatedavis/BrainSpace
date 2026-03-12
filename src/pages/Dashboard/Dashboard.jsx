// src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import { TilesContext } from '../../context/TilesContext';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { gridSize, resizeGrid } = useContext(TilesContext);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar gridSize={gridSize} setGridSize={resizeGrid} />
        <main className="dashboard-content">
          <TileContainer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;