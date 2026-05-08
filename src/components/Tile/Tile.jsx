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
    // Do not open the global edit modal for note tiles – they use inline editing
    if (tile.type === 'note') {
      return;
    }
    setEditingTileId(tile.id);
  };

  // Hide title for image tiles that have an image source, and for note tiles (which act as the tile themselves)
  const isImageWithContent = tile.type === 'image' && tile.content;
  const isNoteTile = tile.type === 'note';

  const tileClasses = `tile ${isDragging ? 'dragging' : ''} ${isTarget ? 'drop-target' : ''} ${isImageWithContent ? 'image-tile-filled' : ''} ${isNoteTile ? 'note-tile' : ''}`;

  return (
    <div className={tileClasses}>
      {/* Only show title if not an image‑filled tile and not a note tile */}
      {!(isImageWithContent || isNoteTile) && <h3 className="tile-title">{tile.title}</h3>}
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