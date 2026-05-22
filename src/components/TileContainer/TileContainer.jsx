//   src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React, { useRef, useEffect, useCallback, useContext } from 'react';
import Tile from '../Tile/Tile';
import { useDragDrop } from '../../hooks/useDragDrop';
import { TilesContext } from '../../context/TilesContext';
import { getGradientColor } from '../../utils/colorUtils';
import './TileContainer.css';

// ----- Main -----
const TileContainer = () => {
  const { tiles, gridSize, moveTile, removeTile, accentHue } = useContext(TilesContext);
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
    display: 'inline-grid',
    gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
    gridTemplateRows: `repeat(${gridSize}, ${tileSize}px)`,
    gap: 'var(--space-lg)',
    justifyContent: 'center',
    overflow: 'visible',
    '--tile-scale': scale,
    '--grid-outline-width': outlineWidth,
  };

  // ----- Compute style for the drop‑target indicator (pixel‑perfect alignment) -----
  let targetIndicatorStyle = null;
  if (targetCell) {
    const left = targetCell.col * (tileSize + gap);
    const top = targetCell.row * (tileSize + gap);

    // Build dynamic accent colours from the Secondary slider value
    const accentColor = getGradientColor(accentHue);
    const accentShadow = `0 0 0 2px ${accentColor}33`; // 20% opacity
    const accentBg = `${accentColor}0D`;               // ~5% opacity

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