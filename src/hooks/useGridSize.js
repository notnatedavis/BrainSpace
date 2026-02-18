//   src/hooks/useGridSize.js

// ----- Imports -----
import { useState, useEffect } from 'react';

// ----- Main -----
export const useGridSize = (initialSize = 4) => {
  const [gridSize, setGridSize] = useState(() => {
    const saved = localStorage.getItem('dashboardGridSize');
    return saved ? parseInt(saved, 10) : initialSize;
  });

  useEffect(() => {
    localStorage.setItem('dashboardGridSize', gridSize);
  }, [gridSize]);

  return [gridSize, setGridSize];
};