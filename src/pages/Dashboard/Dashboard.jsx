//   src/pages/Dashboard/Dashboard.jsx

// ----- Imports -----
import React from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import TileContainer from '../../components/TileContainer/TileContainer';
import './Dashboard.css';

const Dashboard = () => {
  // placeholder tile data – will eventually come from context
  const tiles = [
    { id: 1, title: 'Image Tile', type: 'image', content: 'placeholder-tile-img.png' },
    { id: 2, title: 'Note Tile', type: 'note', content: 'This is a sample note.' },
    { id: 3, title: 'Info Tile', type: 'info', content: 'Some information here.' },
  ];

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-main">
        <Sidebar />
        <main className="dashboard-content">
          <TileContainer tiles={tiles} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;