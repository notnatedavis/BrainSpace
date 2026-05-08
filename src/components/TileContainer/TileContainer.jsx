//   src/components/TileContainer/TileContainer.jsx

// ----- Imports ----- 
import React, { useRef, useEffect, useCallback, useContext } from 'react';
import Tile from '../Tile/Tile';
import { useDragDrop } from '../../hooks/useDragDrop';
import { TilesContext } from '../../context/TilesContext';
import './TileContainer.css';

// ----- Main ----- 
const TileContainer = () => {
  const { tiles, gridSize, moveTile, removeTile } = useContext(TilesContext);
  const containerRef = useRef(null);
  const {
    draggedIndex,
    targetIndex,
    startDrag,
    updateDrag,
    endDrag,
  } = useDragDrop(containerRef, gridSize, moveTile);

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

  // ----- Dynamic tile sizing & centering -----
  const baseSize = 220; // starting tile size (px)
  const scale = 1 - (gridSize - 3) * 0.1; // original scaling curve
  const tileSize = Math.round(baseSize * scale); // dynamic tile width/height

  const gridStyle = {
    gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
    gridAutoRows: `${tileSize}px`,
    gap: 'var(--space-lg)',
    justifyContent: 'center', // centers the grid
    overflow: 'auto', // scroll if the grid still overflows
    '--tile-scale': scale, // keep content scaling
  };

  return (
    <div
      ref={containerRef}
      className="tile-container"
      style={gridStyle}
    >
      {tiles.map((cell, index) => {
        const isDragging = draggedIndex === index;
        const isTarget = targetIndex === index;

        if (cell === null) {
          // empty cell – render placeholder
          return (
            <div
              key={`cell-${index}`}
              className={`tile-placeholder ${isTarget ? 'drop-target' : ''}`}
            >
              <span className="dot" />
            </div>
          );
        } else {
          // cell with a tile
          return (
            <Tile
              key={cell.id}
              tile={cell}
              onRemove={removeTile}
              onDragStart={(clientX, clientY) => handleDragStart(index, clientX, clientY)}
              isDragging={isDragging}
              isTarget={isTarget}  // optional – highlight the tile itself when it's the target
            />
          );
        }
      })}
    </div>
  );
};

export default TileContainer;