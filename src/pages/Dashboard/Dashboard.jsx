//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext, useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import TileEditModal from '../../components/common/TileEditModal';
import { TilesContext } from '../../context/TilesContext';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { gridSize, resizeGrid } = useContext(TilesContext);

  // Background hue – default 210° (original #f8fafc)
  const [bgHue, setBgHue] = useState(210);
  // Accent hue – default 160° (original #10b981)
  const [accentHue, setAccentHue] = useState(160);

  // Apply the dynamic hues to CSS variables on the document root
  useEffect(() => {
    document.documentElement.style.setProperty('--bg-hue', bgHue);
  }, [bgHue]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-hue', accentHue);
  }, [accentHue]);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar
          gridSize={gridSize}
          setGridSize={resizeGrid}
          bgHue={bgHue}
          setBgHue={setBgHue}
          accentHue={accentHue}
          setAccentHue={setAccentHue}
        />
        <main className="dashboard-content">
          <TileContainer />
        </main>
      </div>
      <TileEditModal />
    </div>
  );
};

export default Dashboard;