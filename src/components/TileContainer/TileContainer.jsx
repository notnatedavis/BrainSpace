//   src/components/TileContainer/TileContainer.jsx

// ----- Imports -----
import React, { useRef, useEffect, useCallback, useContext } from 'react';
import Tile from '../Tile/Tile';
import { useDragDrop } from '../../hooks/useDragDrop';
import { TilesContext } from '../../context/TilesContext';
import { hslToString } from '../../utils/colorUtils';
import GridResizeHandles from './GridResizeHandles';
import './TileContainer.css';

// ----- Main -----
const TileContainer = () => {
  const {
    tiles,
    gridRows,
    gridCols,
    moveTile,
    removeTile,
    accentColor,
    containerOutlineWidth,
    containerZoom = 1, // defensive default – falls back to 100 % if context isn't updated
  } = useContext(TilesContext);

  if (!Array.isArray(tiles)) {
    console.error('TileContainer: tiles is not an array', tiles);
    return null;
  }

  const containerRef = useRef(null);

  const {
    draggedId,
    targetCell,
    startDrag,
    updateDrag,
    endDrag,
  } = useDragDrop(containerRef, gridRows, gridCols, moveTile);

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

  // ----- Base tile sizing (zoom is applied later via CSS transform) -----
  // The grid is laid out in *base* pixels — zoom is implemented as a single
  // `transform: scale()` on the wrapper below. Doing it this way means every
  // tile's contents (text, canvas, images, iframes, hard-coded rem/px in tile
  // CSS, etc.) scale together, not just the tile boxes. It also keeps all
  // existing drag / resize math working because `getBoundingClientRect()`
  // returns the *transformed* rect that those hooks already consume.
  const baseSize = 220;
  const scaleRows = 1 - (gridRows - 3) * 0.1;
  const scaleCols = 1 - (gridCols - 3) * 0.1;
  const scale = Math.min(scaleRows, scaleCols);
  const tileSize = Math.round(baseSize * scale);
  const gap = 24;

  // Dimensions of the *unscaled* grid. The wrapper below reserves the
  // scaled equivalent so surrounding layout neither collapses (< 100 %)
  // nor overlaps (> 100 %).
  const baseWidth = gridCols * tileSize + (gridCols - 1) * gap;
  const baseHeight = gridRows * tileSize + (gridRows - 1) * gap;
  const wrapperWidth = baseWidth * containerZoom;
  const wrapperHeight = baseHeight * containerZoom;

  const gridStyle = {
    display: 'inline-grid',
    gridTemplateColumns: `repeat(${gridCols}, ${tileSize}px)`,
    gridTemplateRows: `repeat(${gridRows}, ${tileSize}px)`,
    gap: 'var(--space-lg)',
    overflow: 'visible',
    '--tile-scale': scale,
    position: 'relative',
    // dynamic outline using context value
    outline: `${containerOutlineWidth}px solid ${hslToString(accentColor)}`,
    outlineOffset: '15px',
  };

  // ----- Compute style for the drop‑target indicator (unscaled pixel coords) -----
  // The indicator is rendered inside the transformed wrapper, so positioning
  // it in base pixels is correct — the transform scales it visually to the
  // same place as the corresponding tile.
  let targetIndicatorStyle = null;
  if (targetCell) {
    const left = targetCell.col * (tileSize + gap);
    const top = targetCell.row * (tileSize + gap);

    const accentColorStr = hslToString(accentColor);
    const accentShadow = `0 0 0 2px ${accentColorStr}33`;
    const accentBg = `${accentColorStr}0D`;

    targetIndicatorStyle = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${tileSize}px`,
      height: `${tileSize}px`,
      pointerEvents: 'none',
      border: `5px solid ${accentColorStr}`,
      borderRadius: 'var(--border-radius)',
      boxShadow: accentShadow,
      background: accentBg,
      zIndex: 1000,
    };
  }

  return (
    // Outer wrapper: reserves scaled layout space (transform alone does not
    // affect layout), and is the coordinate anchor for everything inside.
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width: `${wrapperWidth}px`,
        height: `${wrapperHeight}px`,
      }}
    >
      {/* Inner wrapper: applies the visual zoom to the grid *and* its
          resize handles together, so hit areas and visuals stay aligned. */}
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          transform: `scale(${containerZoom})`,
          transformOrigin: 'top left',
        }}
      >
        <div ref={containerRef} className="tile-container" style={gridStyle}>
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
                gridRows={gridRows}
                gridCols={gridCols}
              />
            );
          })}
          {targetIndicatorStyle && (
            <div className="drop-target-indicator" style={targetIndicatorStyle} />
          )}
        </div>
        <GridResizeHandles containerRef={containerRef} />
      </div>
    </div>
  );
};

export default TileContainer;