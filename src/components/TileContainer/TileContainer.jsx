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
    draggedId,
    targetCell,
    startDrag,
    updateDrag,
    endDrag,
  } = useDragDrop(containerRef, gridSize, moveTile);

  useEffect(() => {
    if (draggedId !== null) {
      const handleMouseMove = (e) => updateDrag(e.clientX, e.clientY);
      const handleMouseUp = () => endDrag();

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedId, updateDrag, endDrag]);

  const handleDragStart = useCallback((tileId) => {
    startDrag(tileId);
  }, [startDrag]);

  // ----- Dynamic tile sizing & centering -----
  const baseSize = 220;
  const scale = 1 - (gridSize - 3) * 0.1;
  const tileSize = Math.round(baseSize * scale);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
    gridAutoRows: `${tileSize}px`,
    gap: 'var(--space-lg)',
    justifyContent: 'center',
    overflow: 'auto',
    '--tile-scale': scale,
  };

  // Cell overlays for drop‑target highlighting
  const cellOverlays = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const isTarget = targetCell && targetCell.row === row && targetCell.col === col;
      cellOverlays.push(
        <div
          key={`cell-${row}-${col}`}
          className={`grid-cell ${isTarget ? 'drop-target' : ''}`}
          style={{
            gridColumn: `${col + 1} / span 1`,
            gridRow: `${row + 1} / span 1`,
          }}
        />
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className="tile-container"
      style={gridStyle}
    >
      {cellOverlays}
      {tiles.map((tile) => {
        const isDragging = draggedId === tile.id;
        return (
          <Tile
            key={tile.id}
            tile={tile}
            onRemove={removeTile}
            onDragStart={() => handleDragStart(tile.id)}
            isDragging={isDragging}
            containerRef={containerRef}
            gridSize={gridSize}
          />
        );
      })}
    </div>
  );
};

export default TileContainer;