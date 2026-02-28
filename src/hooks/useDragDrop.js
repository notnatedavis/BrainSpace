//   src/hooks/useDragDrop.js

// ----- Imports -----
import { useState, useCallback, useRef } from 'react';

// ----- Main -----
export const useDragDrop = (tiles, setTiles, containerRef, gridSize) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);

  // Refs to hold the latest indices during drag – these avoid stale closures in event handlers
  const draggedIndexRef = useRef(null);
  const targetIndexRef = useRef(null);
  
  const startDrag = useCallback((index, clientX, clientY) => {
    console.log('startDrag', index); // logging - remove later
    setDraggedIndex(index);
    // (clientX, clientY can be used for offset if needed)
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
      targetIndexRef.current = newTargetIndex;
    } else {
      setTargetIndex(null);
      targetIndexRef.current = null;
    }

  }, [containerRef, gridSize]); // removed draggedIndex dependency, now using ref

  const endDrag = useCallback((mouseUpEvent) => {
    // Compute target from the mouseup event
    let finalTarget = null;
    if (mouseUpEvent && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;
      const col = Math.floor((mouseUpEvent.clientX - rect.left) / cellWidth);
      const row = Math.floor((mouseUpEvent.clientY - rect.top) / cellHeight);
      if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
        finalTarget = row * gridSize + col;
      }
    }

    console.log('endDrag', { draggedIndex, targetIndex: finalTarget });

    if (draggedIndex !== null && finalTarget !== null && draggedIndex !== finalTarget) {
      setTiles(prevTiles => {
        const newTiles = [...prevTiles];
        const [moved] = newTiles.splice(draggedIndex, 1);
        newTiles.splice(finalTarget, 0, moved);
        console.log('newTiles', newTiles.map(t => t.id)); // log
        return newTiles;
      });
    }

    setDraggedIndex(null);
    setTargetIndex(null);
  }, [draggedIndex, containerRef, gridSize, setTiles]);

  return {
    draggedIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  };
};