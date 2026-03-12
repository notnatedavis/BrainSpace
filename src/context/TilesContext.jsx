//   src/context/TilesContext.jsx

// ----- Imports -----
import React, { createContext, useState, useCallback } from 'react';
export const TilesContext = createContext();

const INITIAL_GRID_SIZE = 4;
const createEmptyGrid = (size) => Array(size * size).fill(null);

// ----- Main -----
export const TilesProvider = ({ children }) => {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [tiles, setTiles] = useState(() => {
    // Start with some sample tiles in the first few cells
    const grid = createEmptyGrid(INITIAL_GRID_SIZE);
    grid[0] = { id: 1, title: 'Image Tile', type: 'image', content: 'test.jpg' };
    grid[1] = { id: 2, title: 'Note Tile', type: 'note', content: 'Sample note' };
    grid[2] = { id: 3, title: 'Info Tile', type: 'info', content: 'Some info' };
    return grid;
  });

  const addTile = useCallback(() => {
    const newTile = {
      id: Date.now(),
      title: 'New Tile',
      type: 'note',
      content: 'Click to edit',
    };
    setTiles(prev => {
      const firstEmpty = prev.findIndex(cell => cell === null);
      if (firstEmpty === -1) return prev; // grid full – do nothing or handle differently
      const next = [...prev];
      next[firstEmpty] = newTile;
      return next;
    });
  }, []);

  const removeTile = useCallback((id) => {
    setTiles(prev => prev.map(cell => (cell && cell.id === id ? null : cell)));
  }, []);

  const moveTile = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setTiles(prev => {
      const next = [...prev];
      // swap the values (works for tile↔tile, tile↔null, null↔tile)
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  }, []);

  // Called when the slider changes the grid size
  const resizeGrid = useCallback((newSize) => {
    setGridSize(newSize);
    setTiles(prev => {
      const newLength = newSize * newSize;
      if (newLength > prev.length) {
        // expand with nulls
        return [...prev, ...Array(newLength - prev.length).fill(null)];
      } else {
        // truncate – tiles that fall off are lost (you might want to warn or save them)
        return prev.slice(0, newLength);
      }
    });
  }, []);

  const value = {
    tiles,
    gridSize,
    addTile,
    removeTile,
    moveTile,
    resizeGrid,
  };

  return (
    <TilesContext.Provider value={value}>
      {children}
    </TilesContext.Provider>
  );
};