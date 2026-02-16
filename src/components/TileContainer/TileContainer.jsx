//   src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React from 'react';
import Tile from '../Tile/Tile';
import ErrorBoundary from '../common/ErrorBoundary';
import './TileContainer.css';

// ----- Main ------
const TileContainer = ({ tiles }) => {
  return (
    <div className="tile-container">
      {tiles.map(tile => (
        <Tile key={tile.id} tile={tile} />
      ))}
    </div>
  );
};

export default TileContainer;