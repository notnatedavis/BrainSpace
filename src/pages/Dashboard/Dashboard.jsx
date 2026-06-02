//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import TileEditModal from '../../components/common/TileEditModal';
import { TilesContext } from '../../context/TilesContext';
import { hslToString } from '../../utils/colorUtils';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { bgColor, accentColor } = useContext(TilesContext);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-background', hslToString(bgColor));
  }, [bgColor]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', hslToString(accentColor));
  }, [accentColor]);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar />
        <main className="dashboard-content">
          <TileContainer />
        </main>
      </div>
      <TileEditModal />
    </div>
  );
};

export default Dashboard;