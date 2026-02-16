//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import TilesContext from '../../context/TilesContext';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { tiles, removeTile } = useContext(TilesContext);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar />
        <main className="dashboard-content">
          <TileContainer tiles={tiles} onRemoveTile={removeTile} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;