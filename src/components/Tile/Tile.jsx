//   src/components/Tile/Tile.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import tileTypes from '../tileTypes';
import { TilesContext } from '../../context/TilesContext';
import './Tile.css';

// ----- Main -----
const Tile = ({ tile, onRemove, onDragStart, isDragging, isTarget }) => {
  const { setEditingTileId } = useContext(TilesContext);

  const typeDef = tileTypes[tile.type];
  if (!typeDef) {
    return <div className="tile-error">Unknown tile type</div>;
  }

  const TileContent = typeDef.component;

  const handleContentClick = () => {
    setEditingTileId(tile.id);
  };

  // Hide title for image tiles that have an image source
  const isImageWithContent = tile.type === 'image' && tile.content;
  const tileClasses = `tile ${isDragging ? 'dragging' : ''} ${isTarget ? 'drop-target' : ''} ${isImageWithContent ? 'image-tile-filled' : ''}`;

  return (
    <div className={tileClasses}>
      {!isImageWithContent && <h3 className="tile-title">{tile.title}</h3>}
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