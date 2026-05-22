//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import TileEditModal from '../../components/common/TileEditModal';
import { TilesContext } from '../../context/TilesContext';
import { getGradientColor } from '../../utils/colorUtils';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { bgHue, accentHue } = useContext(TilesContext);

  // apply the dynamic hues to CSS variables on the document root
  useEffect(() => {
    document.documentElement.style.setProperty('--color-background', getGradientColor(bgHue));
  }, [bgHue]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', getGradientColor(accentHue));
  }, [accentHue]);

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