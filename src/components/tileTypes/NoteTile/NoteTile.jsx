//   src/components/tiletypes/NoteTile/NoteTile.jsx

// ----- Imports -----
import React from 'react';

// ----- Main -----
const NoteTile = ({ tile }) => {
  return <div className="note-content">{tile.content}</div>;
};

export default NoteTile;