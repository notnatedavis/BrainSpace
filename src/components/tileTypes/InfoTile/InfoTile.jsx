//   src/components/tileTypes/InfoTile/InfoTile.jsx

// ----- Imports -----
import React from 'react';

// ----- Main -----
const InfoTile = ({ tile }) => {
  return <div className="info-content">{tile.content}</div>;
};

export default InfoTile;