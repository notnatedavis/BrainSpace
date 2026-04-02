//   src/components/tileTypes/ImageTile/ImageTile.jsx

// ----- Imports -----
import React from 'react';

// ----- Main -----
const ImageTile = ({ tile }) => {
  const src = tile.content;
  const alt = tile.alt || '';

  if (!src) {
    return (
      <div className="image-placeholder" style={{ 
        textAlign: 'center', 
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        No image set<br />
        <small>Click to edit</small>
      </div>
    );
  }

  // Image fills the tile – use object-fit cover to cover the whole area
  return (
    <img 
      src={src} 
      alt={alt} 
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        display: 'block'
      }} 
    />
  );
};

export default ImageTile;