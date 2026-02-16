//   src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React from 'react';
import Tile from '../Tile/Tile';
import './TileContainer.css';

// ----- Main -----
const TileContainer = ({ tiles, onRemoveTile }) => {
  if (tiles.length === 0) {
    return (
      <div className="tile-container empty">
        <p className="empty-message">No tiles yet. Click the green button to add one.</p>
      </div>
    );
  }

  return (
    <div className="tile-container">
      {tiles.map(tile => (
        <Tile key={tile.id} tile={tile} onRemove={onRemoveTile} />
      ))}
    </div>
  );
};

export default TileContainer;