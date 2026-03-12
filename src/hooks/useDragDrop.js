//   src/hooks/useDragDrop.js

// ----- Imports -----
import { useState, useCallback } from 'react';

// ----- Main -----
export const useDragDrop = (containerRef, gridSize, onMoveTile) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);

  const startDrag = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const updateDrag = useCallback((clientX, clientY) => {
    if (draggedIndex === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cellWidth = rect.width / gridSize;
    const cellHeight = rect.height / gridSize;

    const col = Math.floor((clientX - rect.left) / cellWidth);
    const row = Math.floor((clientY - rect.top) / cellHeight);

    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      const newTargetIndex = row * gridSize + col;
      setTargetIndex(newTargetIndex);
    } else {
      setTargetIndex(null);
    }
  }, [draggedIndex, containerRef, gridSize]);

  const endDrag = useCallback(() => {
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      onMoveTile(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setTargetIndex(null);
  }, [draggedIndex, targetIndex, onMoveTile]);

  return {
    draggedIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  };
};