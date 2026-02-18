// src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React from 'react';
import Tile from '../Tile/Tile';
import './TileContainer.css';

// ----- Main -----
const TileContainer = ({ tiles, onRemoveTile, columns = 4 }) => {
  if (tiles.length === 0) {
    return (
      <div className="tile-container empty">
        <p className="empty-message">No tiles yet. Click the green button to add one.</p>
      </div>
    );
  }

  // Define a scaling factor based on columns (tweak the formula as needed)
  const tileScale = 0.8 + (columns - 3) * 0.1; // e.g., 3 cols → 1.0, 6 cols → 1.3? Actually we want smaller tiles → smaller text? Let's invert: more columns → smaller scale.
  // Better: base scale at 3 columns = 1, at 6 columns = 0.7
  const scale = 1.2 - (columns - 3) * 0.1; // 3→1.2, 4→1.1, 5→1.0, 6→0.9

  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    '--tile-scale': scale,
  };

  return (
    <div className="tile-container" style={gridStyle}>
      {tiles.map(tile => (
        <Tile key={tile.id} tile={tile} onRemove={onRemoveTile} />
      ))}
    </div>
  );
};

export default TileContainer;