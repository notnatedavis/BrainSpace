//   src/components/TileContainer/TileContainer.jsx

// ----- Imports ----- 
import React, { useRef, useEffect, useCallback, useContext } from 'react';
import Tile from '../Tile/Tile';
import { useDragDrop } from '../../hooks/useDragDrop';
import { TilesContext } from '../../context/TilesContext';
import './TileContainer.css';

// ----- Main ----- 
const TileContainer = () => {
  const { tiles, gridSize, moveTile, removeTile, accentHue } = useContext(TilesContext); // ★ accentHue added
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

  // ----- Dynamic tile sizing & centering (locked ratio) -----
  const baseSize = 220;
  const scale = 1 - (gridSize - 3) * 0.1;
  const tileSize = Math.round(baseSize * scale);
  const gap = 24; // must match --space-lg (1.5rem = 24px) – keep in sync with CSS variable

  // ----- Visual border outline dependent on grid size -----
  const outlineWidth = `${Math.max(1, (gridSize - 2) * 2)}px`;

  const gridStyle = {
    display: 'inline-grid',          // allows container to shrink‑wrap
    gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
    gridTemplateRows: `repeat(${gridSize}, ${tileSize}px)`,  // explicit rows → full height outline
    gap: 'var(--space-lg)',
    justifyContent: 'center',
    overflow: 'visible',             // allow the absolute overlay to be painted without clipping
    '--tile-scale': scale,
    '--grid-outline-width': outlineWidth,
  };

  // ----- Compute style for the drop‑target indicator (pixel‑perfect alignment) -----
  let targetIndicatorStyle = null;
  if (targetCell) {
    const left = targetCell.col * (tileSize + gap);
    const top = targetCell.row * (tileSize + gap);

    // Build dynamic accent colours from the Secondary slider value
    const accentColor = `hsl(${accentHue}, 84%, 39%)`;
    const accentShadow = `0 0 0 2px hsla(${accentHue}, 84%, 39%, 0.2)`;
    const accentBg = `hsla(${accentHue}, 84%, 39%, 0.05)`;

    targetIndicatorStyle = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${tileSize}px`,
      height: `${tileSize}px`,
      pointerEvents: 'none',
      border: `2px solid ${accentColor}`,
      borderRadius: 'var(--border-radius)',
      boxShadow: accentShadow,
      background: accentBg,
      zIndex: 1000,
    };
  }

  return (
    <div
      ref={containerRef}
      className="tile-container"
      style={gridStyle}
    >
      {/* ---- Tile grid (painted first) ---- */}
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

      {/* ---- Drop target indicator (floats on top, does NOT affect grid layout) ---- */}
      {targetIndicatorStyle && (
        <div className="drop-target-indicator" style={targetIndicatorStyle} />
      )}
    </div>
  );
};

export default TileContainer;