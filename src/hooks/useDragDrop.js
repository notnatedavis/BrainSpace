//   src/hooks/useDragDrop.js

// ----- Imports -----
import { useState, useCallback } from 'react';

// ----- Main -----
export const useDragDrop = (containerRef, gridSize, onMoveTile) => {
  const [draggedId, setDraggedId] = useState(null);
  const [targetCell, setTargetCell] = useState(null); // { row, col } | null

  const startDrag = useCallback((tileId) => {
    setDraggedId(tileId);
  }, []);

  const updateDrag = useCallback((clientX, clientY) => {
    if (draggedId === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cellWidth = rect.width / gridSize;
    const cellHeight = rect.height / gridSize;

    const col = Math.floor((clientX - rect.left) / cellWidth);
    const row = Math.floor((clientY - rect.top) / cellHeight);

    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      setTargetCell({ row, col });
    } else {
      setTargetCell(null);
    }
  }, [draggedId, containerRef, gridSize]);

  const endDrag = useCallback(() => {
    if (draggedId !== null && targetCell !== null) {
      onMoveTile(draggedId, targetCell.row, targetCell.col);
    }
    setDraggedId(null);
    setTargetCell(null);
  }, [draggedId, targetCell, onMoveTile]);

  return {
    draggedId,
    targetCell,
    startDrag,
    updateDrag,
    endDrag,
  };
};