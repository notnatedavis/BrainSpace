//   src/components/Tile/Tile.jsx

// ----- Imports -----
import React from 'react';
import './Tile.css';

// ----- Main -----
const Tile = ({ tile, onRemove , onDragStart, isDragging }) => {
  const handleMouseDown = (e) => {
    // prevent default to avoid text selection
    e.preventDefault();
    if (onDragStart) {
      onDragStart(e.clientX, e.clientY);
    }
  };

  return (
    <div className={`tile ${isDragging ? 'dragging' : ''}`}>
      <h3 className="tile-title">{tile.title}</h3>
      <div className="tile-content">
        {/* content as before */}
      </div>
      <div className="remove-tile-btn">
        <button onClick={() => onRemove(tile.id)}>✕</button>
      </div>
      <div className="drag-handle" onMouseDown={handleMouseDown}>
        <button>⣿</button>  {/* simple drag icon: three lines */}
      </div>
    </div>
  );
};

export default Tile;