//   src/context/TilesContext.jsx

//   Placeholder for tile positions / data

// ----- Imports -----
import React, { createContext, useState } from 'react';

// ----- Main -----
export const TilesContext = createContext();

export const TilesProvider = ({ children }) => {
  const [tiles, setTiles] = useState([]); // will hold tile objects with position, size, content

  // placeholder functions
  const updateTilePosition = (id, newPosition) => {
    // will be implemented later
  };

  return (
    <TilesContext.Provider value={{ tiles, updateTilePosition }}>
      {children}
    </TilesContext.Provider>
  );
};