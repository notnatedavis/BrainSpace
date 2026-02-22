// src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React, { useRef, useEffect, useCallback } from 'react';
import Tile from '../Tile/Tile';
import { useDragDrop } from '../../hooks/useDragDrop';
import { getTileScale } from '../../utils/layoutHelpers';
import './TileContainer.css';

// ----- Main -----
const TileContainer = ({ tiles, onRemoveTile, gridSize = 4, setTiles }) => {
  const containerRef = useRef(null);
  const {
    draggedIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  } = useDragDrop(tiles, setTiles, containerRef, gridSize);

  // attach global mouse move/up during drag
  useEffect(() => {
    if (draggedIndex !== null) {
      const handleMouseMove = (e) => updateDrag(e.clientX, e.clientY);
      const handleMouseUp = () => endDrag();

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedIndex, updateDrag, endDrag]);

  const handleDragStart = useCallback((index, clientX, clientY) => {
    startDrag(index, clientX, clientY);
  }, [startDrag]);

  const totalCells = gridSize * gridSize;
  const scale = getTileScale(gridSize);

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
    '--tile-scale': scale,
  };

  const visibleTiles = tiles.slice(0, totalCells);
  const placeholdersNeeded = totalCells - visibleTiles.length;

  return (
    <div
      ref={containerRef}
      className="tile-container fixed-grid"
      style={gridStyle}
    >
      {visibleTiles.map((tile, index) => (
        <Tile
          key={tile.id}
          tile={tile}
          onRemove={onRemoveTile}
          onDragStart={(clientX, clientY) => handleDragStart(index, clientX, clientY)}
          isDragging={draggedIndex === index}
        />
      ))}
      {Array.from({ length: placeholdersNeeded }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className={`tile-placeholder ${targetIndex === visibleTiles.length + index ? 'drop-target' : ''}`}
        >
          <span className="dot" />
        </div>
      ))}
    </div>
  );
};

export default TileContainer;