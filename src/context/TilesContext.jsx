//   src/context/TilesContext.jsx

// ----- Imports -----
import React, { createContext, useState, useCallback } from 'react';
import tileTypes from '../components/tileTypes';
export const TilesContext = createContext();

const INITIAL_GRID_SIZE = 4;
const createEmptyGrid = (size) => Array(size * size).fill(null);

// ----- Main -----
export const TilesProvider = ({ children }) => {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [tiles, setTiles] = useState(() => {
    const grid = createEmptyGrid(INITIAL_GRID_SIZE);
    grid[0] = { id: 1, title: 'Image Tile', type: 'image', content: 'test.jpg', alt: 'Test image' };
    grid[1] = {
      id: 2,
      title: 'Note Tile',
      type: 'note',
      content: 'Sample note',
      noteStyle: {
        backgroundColor: '#ffffff',
        bold: false,
        italic: false,
        underline: false,
        fontSize: 'medium',
        fontFamily: 'sans',
        headerLevel: 0,
      },
    };
    grid[2] = {
      id: 3,
      title: 'Info Tile',
      type: 'info',
      content: 'Some info',
    };
    // Optional: add a timer tile at index 3 if grid size > 3
    // grid[3] = { id: 4, title: 'Timer', type: 'timer', mode: 'stopwatch', initialTime: 60 };
    return grid;
  });

  const [editingTileId, setEditingTileId] = useState(null);

  const addTile = useCallback((type = 'note') => {
    const typeDef = tileTypes[type];
    if (!typeDef) {
      console.warn(`Unknown tile type: ${type}, defaulting to note`);
      type = 'note';
    }
    const defaultData = tileTypes[type].defaultData();
    const newTile = {
      id: Date.now(),
      type: type,
      ...defaultData,
    };
    setTiles(prev => {
      const firstEmpty = prev.findIndex(cell => cell === null);
      if (firstEmpty === -1) return prev;
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
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  }, []);

  const updateTile = useCallback((id, newData) => {
    setTiles(prev =>
      prev.map(cell =>
        cell && cell.id === id ? { ...cell, ...newData } : cell
      )
    );
  }, []);

  const resizeGrid = useCallback((newSize) => {
    setGridSize(newSize);
    setTiles(prev => {
      const newLength = newSize * newSize;
      if (newLength > prev.length) {
        return [...prev, ...Array(newLength - prev.length).fill(null)];
      } else {
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
    editingTileId,
    setEditingTileId,
    updateTile,
  };

  return (
    <TilesContext.Provider value={value}>
      {children}
    </TilesContext.Provider>
  );
};