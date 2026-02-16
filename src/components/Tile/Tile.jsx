//   src/components/Tile/Tile.jsx

// ----- Imports -----
import React from 'react';
import './Tile.css';

// ----- Main -----
const Tile = ({ tile }) => {
  return (
    <div className="tile">
      <h3 className="tile-title">{tile.title}</h3>
      <div className="tile-content">
        {tile.type === 'image' && (
          <img src={`/assets/${tile.content}`} alt={tile.title} />
        )}
        {tile.type === 'note' && <p>{tile.content}</p>}
        {tile.type === 'info' && <p>{tile.content}</p>}
      </div>
      {/* Placeholder for future drag handle */}
    </div>
  );
};

export default Tile;