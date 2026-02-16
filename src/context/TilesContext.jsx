//   src/context/TilesContext.jsx

// ----- Imports -----
import React, { createContext, useState } from 'react';

// ----- Main -----
export const TilesContext = createContext();

export const TilesProvider = ({ children }) => {
  const [tiles, setTiles] = useState([
    { id: 1, title: 'Image Tile', type: 'image', content: 'test.jpg' },
    { id: 2, title: 'Note Tile', type: 'note', content: 'This is a sample note.' },
    { id: 3, title: 'Info Tile', type: 'info', content: 'Some information here.' },
  ]);

  const addTile = () => {
    const newTile = {
      id: Date.now(), // simple unique id
      title: 'New Tile',
      type: 'note',
      content: 'Click to edit',
    };
    setTiles(prev => [...prev, newTile]);
  };

  const removeTile = (id) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  };

  // placeholder for future drag & drop
  const updateTilePosition = (id, newPosition) => {};

  return (
    <TilesContext.Provider value={{ tiles, addTile, removeTile, updateTilePosition }}>
      {children}
    </TilesContext.Provider>
  );
};

export default TilesContext;