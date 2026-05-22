//   src/components/Tile/Tile.jsx

// ----- Imports -----
import React, { useContext, useState, useEffect, useCallback } from 'react';
import tileTypes from '../tileTypes';
import { TilesContext } from '../../context/TilesContext';
import './Tile.css';

// ----- Shrink margin : how many cells must the mouse travel inward before the tile snaps to a smaller size -----
// Increase to make shrinking feel snappier (0.3 – 1.0 is practical; 0.0 = immediate, 1.0 = default full‑cell movement)
const SHRINK_MARGIN = 0.2; // cell units

// ----- Main -----
const Tile = ({ tile, onRemove, onDragStart, isDragging, containerRef, gridSize }) => {
  const { setEditingTileId, resizeTile } = useContext(TilesContext);

  // ----- Resize state -----
  const [resizing, setResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState(null); // 'tl','tr','bl','br'
  const [initialLayout, setInitialLayout] = useState(null); // { row, col, size }

  const typeDef = tileTypes[tile.type];
  if (!typeDef) {
    return <div className="tile-error">Unknown tile type</div>;
  }

  const TileContent = typeDef.component;

  const handleContentClick = () => {
    if (tile.type === 'note') return;
    setEditingTileId(tile.id);
  };

  const isImageWithContent = tile.type === 'image' && tile.content;
  const isNoteTile = tile.type === 'note';
  const isBoardWithImage = tile.type === 'board' && tile.pinImageUrl;

  const tileClasses = `tile ${isDragging ? 'dragging' : ''} ${isImageWithContent ? 'image-tile-filled' : ''} ${isNoteTile ? 'note-tile' : ''} ${isBoardWithImage ? 'board-tile-filled' : ''}`;

  // ----- Resize event handlers -----
  const handleResizeMouseDown = useCallback((corner) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);
    setResizeCorner(corner);
    setInitialLayout({
      row: tile.row,
      col: tile.col,
      size: tile.size || 1,
    });
  }, [tile.row, tile.col, tile.size]);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current || !initialLayout || !resizeCorner) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cellWidth = rect.width / gridSize;
      const cellHeight = rect.height / gridSize;

      // continuous floating‑point cell coordinate of the mouse
      const mouseColFloat = (e.clientX - rect.left) / cellWidth;
      const mouseRowFloat = (e.clientY - rect.top) / cellHeight;

      const { row, col, size: initialSize } = initialLayout;
      let newRow = row,
          newCol = col,
          newSize = initialSize;

      // compute spans from anchor to the mouse (floats) for each corner
      const computeSize = (rowSpan, colSpan) => {
        
        // initial raw size (ceiling to integer cells) – used for expansion
        const rawSize = Math.ceil(Math.max(rowSpan, colSpan));

        // clamp to valid range
        const clampedSize = Math.min(gridSize - newRow, gridSize - newCol, Math.max(1, rawSize));

        // Shrink helper: if the raw ceil still equals the current size, but the
        // mouse has moved sufficiently inside the tile, force a shrink.
        if (clampedSize === initialSize && initialSize > 1) {
          const maxSpan = Math.max(rowSpan, colSpan);
          if (maxSpan <= initialSize - SHRINK_MARGIN) {
            return initialSize - 1;
          }
        }
        return clampedSize;
      };

      switch (resizeCorner) {
        case 'br': { // bottom‑right – anchor: top‑left (row, col)
          const rowSpan = mouseRowFloat - row;
          const colSpan = mouseColFloat - col;
          newSize = computeSize(rowSpan, colSpan);
          break;
        }
        case 'bl': { // bottom‑left – anchor: top‑right (row, col + size)
          const rowSpan = mouseRowFloat - row;
          const colSpan = (col + initialSize) - mouseColFloat;
          const spanSize = computeSize(rowSpan, colSpan);
          newSize = spanSize;
          newCol = (col + initialSize) - newSize;
          break;
        }
        case 'tr': { // top‑right – anchor: bottom‑left (row + size, col)
          const rowSpan = (row + initialSize) - mouseRowFloat;
          const colSpan = mouseColFloat - col;
          const spanSize = computeSize(rowSpan, colSpan);
          newSize = spanSize;
          newRow = (row + initialSize) - newSize;
          break;
        }
        case 'tl': { // top‑left – anchor: bottom‑right (row + size, col + size)
          const rowSpan = (row + initialSize) - mouseRowFloat;
          const colSpan = (col + initialSize) - mouseColFloat;
          const spanSize = computeSize(rowSpan, colSpan);
          newSize = spanSize;
          newRow = (row + initialSize) - newSize;
          newCol = (col + initialSize) - newSize;
          break;
        }
        default:
          break;
      }

      // final sanity clamp to grid bounds
      newRow = Math.max(0, Math.min(newRow, gridSize - newSize));
      newCol = Math.max(0, Math.min(newCol, gridSize - newSize));

      resizeTile(tile.id, newRow, newCol, newSize);
    };

    const handleMouseUp = () => {
      setResizing(false);
      setResizeCorner(null);
      setInitialLayout(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, resizeCorner, initialLayout, containerRef, gridSize, tile.id, resizeTile]);

  return (
    <div
      className={tileClasses}
      style={{
        gridColumn: `${tile.col + 1} / span ${tile.size || 1}`,
        gridRow: `${tile.row + 1} / span ${tile.size || 1}`,
      }}
    >
      {/* Resize handles – light green overlay, drag to resize */}
      <div
        className="resize-handle resize-top-left"
        onMouseDown={handleResizeMouseDown('tl')}
      />
      <div
        className="resize-handle resize-top-right"
        onMouseDown={handleResizeMouseDown('tr')}
      />
      <div
        className="resize-handle resize-bottom-left"
        onMouseDown={handleResizeMouseDown('bl')}
      />
      <div
        className="resize-handle resize-bottom-right"
        onMouseDown={handleResizeMouseDown('br')}
      />

      {!(isImageWithContent || isNoteTile || isBoardWithImage) && (
        <h3 className="tile-title">{tile.title}</h3>
      )}
      <div className="tile-content" onClick={handleContentClick}>
        <TileContent tile={tile} />
      </div>
      <div className="remove-tile-btn">
        <button onClick={() => onRemove(tile.id)}>✕</button>
      </div>
      <div className="drag-handle" onMouseDown={onDragStart}>
        <button>⣿</button>
      </div>
    </div>
  );
};

export default Tile;