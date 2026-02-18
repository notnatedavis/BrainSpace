// src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React from 'react';
import Tile from '../Tile/Tile';
import './TileContainer.css';
import { getTileScale } from '../../utils/layoutHelpers';

// ----- Main -----
const TileContainer = ({ tiles, onRemoveTile, gridSize = 4 }) => {
  const totalCells = gridSize * gridSize;
  const scale = getTileScale(gridSize); // formula adjusted (optional)

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, auto)`,
    '--tile-scale': scale,
  };

  // take only the first totalCells tiles (if there are more)
  const visibleTiles = tiles.slice(0, totalCells);
  const placeholdersNeeded = totalCells - visibleTiles.length;

  return (
    <div className="tile-container fixed-grid" style={gridStyle}>
      {visibleTiles.map(tile => (
        <Tile key={tile.id} tile={tile} onRemove={onRemoveTile} />
      ))}
      {Array.from({ length: placeholdersNeeded }).map((_, index) => (
        <div key={`placeholder-${index}`} className="tile-placeholder">
          <span className="dot" />
        </div>
      ))}
    </div>
  );
};

export default TileContainer;