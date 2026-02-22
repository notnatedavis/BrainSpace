//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext , useState } from 'react';
import { useGridSize } from '../../hooks/useGridSize';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import TilesContext from '../../context/TilesContext';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { tiles, removeTile, setTiles } = useContext(TilesContext);
  const [gridSize, setGridSize] = useGridSize(4); // controls both dimensions

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar gridSize={gridSize} setGridSize={setGridSize} />
        <main className="dashboard-content">
          <TileContainer tiles={tiles} onRemoveTile={removeTile} gridSize={gridSize} setTiles={setTiles} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;