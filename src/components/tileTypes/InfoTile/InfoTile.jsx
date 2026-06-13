// src/components/tileTypes/InfoTile/InfoTile.jsx
// Introductory tile with hardcoded welcome message. Not editable.

// ----- Imports -----
import React from 'react';
import './InfoTile.css';

// ----- Main -----
const InfoTile = () => {
  // Hardcoded content – no dependence on tile props
  return (
    <div className="info-tile-content">
      <h3 className="info-title">Welcome to BrainSpace</h3>
      <div className="info-description">
        <p>
          Click <strong>+Add Tile</strong> to get started<br />
          
          Hover over the sidebar to add anything<br />
          
          Save profiles or open an existing layout<br />
          
          Enjoy your personalised dashboard!<br />
        </p>
      </div>
    </div>
  );
};

export default InfoTile;