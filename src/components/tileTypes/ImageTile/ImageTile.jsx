//   src/components/tileTypes/ImageTile/ImageTile.jsx

// ----- Imports -----
import React from 'react';

// ----- Main -----
const ImageTile = ({ tile }) => {
  return <img src={`/assets/${tile.content}`} alt={tile.alt || ''} />;
};

export default ImageTile;