//   src/hooks/useDragDrop.js

// ----- Imports -----
import { useState, useCallback, useRef } from 'react';

// ----- Main -----
export const useDragDrop = (tiles, setTiles, containerRef, gridSize) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 }); // for smooth positioning (optional)

  const startDrag = useCallback((index, clientX, clientY) => {
    console.log('startDrag', index); // logging - remove later
    setDraggedIndex(index);
    // calculate offset between mouse and tile top-left if needed for visual clone
    // For simplicity just track index
  }, []);

  const updateDrag = useCallback((clientX, clientY) => {
    if (draggedIndex === null || !containerRef.current) return;

    // get grid container dimensions and cell size
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const cellWidth = rect.width / gridSize;
    const cellHeight = rect.height / gridSize;

    // calculate which cell the mouse is over
    const col = Math.floor((clientX - rect.left) / cellWidth);
    const row = Math.floor((clientY - rect.top) / cellHeight);

    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      const newTargetIndex = row * gridSize + col;
      console.log('updateDrag', { col, row, newTargetIndex }); // logging - remove later
      setTargetIndex(newTargetIndex);
    } else {
      setTargetIndex(null);
    }

  }, [draggedIndex, containerRef, gridSize]);

  const endDrag = useCallback(() => {
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      // Reorder tiles: move tile from draggedIndex to targetIndex
      setTiles(prevTiles => {
        const newTiles = [...prevTiles];
        const [movedTile] = newTiles.splice(draggedIndex, 1);
        newTiles.splice(targetIndex, 0, movedTile);
        return newTiles;
      });
    }
    setDraggedIndex(null);
    setTargetIndex(null);
    console.log('endDrag', { draggedIndex, targetIndex }); // logging - remove later
  }, [draggedIndex, targetIndex, setTiles]);

  return {
    draggedIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  };
};