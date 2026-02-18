//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React, { useContext , useState } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import TilesContext from '../../context/TilesContext';
import './Dashboard.css';

// ----- Main -----
const Dashboard = () => {
  const { tiles, removeTile } = useContext(TilesContext);
  const [columnCount, setColumnCount] = useState(4); // new state for column count

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar columnCount={columnCount} setColumnCount={setColumnCount} />
        <main className="dashboard-content">
          <TileContainer tiles={tiles} onRemoveTile={removeTile} columns={columnCount} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;