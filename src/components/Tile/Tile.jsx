//   src/components/Tile/Tile.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import tileTypes from '../tileTypes';
import { TilesContext } from '../../context/TilesContext';
import './Tile.css';

// ----- Main -----
const Tile = ({ tile, onRemove, onDragStart, isDragging, isTarget }) => {
  const { setEditingTile } = useContext(TilesContext); // we'll add this later

  const typeDef = tileTypes[tile.type];
  if (!typeDef) {
    return <div className="tile-error">Unknown tile type</div>;
  }

  const TileContent = typeDef.component;

  const handleContentClick = () => {
    // Open edit modal for this tile – implementation TBD
    setEditingTile(tile.id);
  };

  return (
    <div className={`tile ${isDragging ? 'dragging' : ''} ${isTarget ? 'drop-target' : ''}`}>
      <h3 className="tile-title">{tile.title}</h3>
      <div className="tile-content" onClick={handleContentClick}>
        <TileContent tile={tile} />
      </div>
      <div className="remove-tile-btn">
        <button onClick={() => onRemove(tile.id)}>✕</button>
      </div>
      <div className="drag-handle" onMouseDown={onDragStart}>
        <button>⣿</button>
      </div>
    </div>
  );
};

export default Tile;