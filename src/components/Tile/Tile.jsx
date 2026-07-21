//   src/components/Tile/Tile.jsx

// ----- Imports -----
import React, { useContext, useState, useEffect, useCallback } from 'react';
import tileTypes from '../tileTypes';
import { TilesContext } from '../../context/TilesContext';
import './Tile.css';

// ----- Shrink margin : # cells the mouse travel inward before the tile snaps to a smaller size -----
// increase to make shrinking feel snappier (0.3 – 1.0 is practical; 0.0 = immediate, 1.0 = default full‑cell movement)
const SHRINK_MARGIN = 0.2; // cell units

// ----- Helper: check if a rectangular area is free (excluding tile w/ given excludeId) -----
const isAreaFree = (tiles, gridRows, gridCols, row, col, size, excludeId) => {
  // bounds check
  if (row < 0 || col < 0 || row + size > gridRows || col + size > gridCols) return false;
  for (let r = row; r < row + size; r++) {
    for (let c = col; c < col + size; c++) {
      for (const tile of tiles) {
        if (tile.id === excludeId) continue;
        const ts = tile.size || 1;
        if (r >= tile.row && r < tile.row + ts && c >= tile.col && c < tile.col + ts) {
          return false;
        }
      }
    }
  }
  return true;
};

// ----- Main -----
const Tile = ({ tile, onRemove, onDragStart, isDragging, containerRef, gridRows, gridCols }) => {
  // ----- Context -----
  const { tiles, setEditingTileId, resizeTile } = useContext(TilesContext);

  // ----- Resize state -----
  const [resizing, setResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState(null); // 'tl','tr','bl','br' ; TopLeft , ...
  const [initialLayout, setInitialLayout] = useState(null); // { row, col, size }

  const typeDef = tileTypes[tile.type];
  if (!typeDef) {
    return <div className="tile-error">Unknown tile type</div>;
  }

  const TileContent = typeDef.component;

  const handleContentClick = () => {
    if (tile.type === 'note') return;
    if (tile.type === 'info') return;   // InfoTile read‑only
    setEditingTileId(tile.id);
  };

  const isInfoTile = tile.type === 'info';
  const isImageWithContent = tile.type === 'image' && tile.content;
  const isNoteTile = tile.type === 'note';
  const isBoardWithImage = tile.type === 'board' && tile.pinImageUrl;
  const isYoutubeWithUrl = tile.type === 'youtube' && tile.url;
  const isCalendarTile = tile.type === 'calendar';
  const isTimerTile = tile.type === 'timer';
  const isPinterestFilled =
    tile.type === 'pinterest' &&
    ((tile.mode === 'board' && tile.pinImageUrl) ||
     (tile.mode === 'pin' && tile.imageUrl));

  const tileClasses = `tile ${isDragging ? 'dragging' : ''} ${
    isImageWithContent ? 'image-tile-filled' : ''
  } ${isNoteTile ? 'note-tile' : ''} ${
    isBoardWithImage ? 'board-tile-filled' : ''
  } ${isYoutubeWithUrl ? 'youtube-tile-filled' : ''} ${
    isPinterestFilled ? 'pinterest-tile-filled' : ''
  }`;

  // ----- Resize mouse down -----
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

  // ----- Validate and adjust resize -----
  const getValidResize = useCallback((corner, desiredRow, desiredCol, desiredSize) => {
    const { row, col, size: initialSize } = initialLayout;
    const currentSize = initialSize;

    // Determine anchor (fixed corner) based on the corner being dragged
    let anchorRow, anchorCol;
    switch (corner) {
      case 'tl':
        anchorRow = row + currentSize - 1;
        anchorCol = col + currentSize - 1;
        break;
      case 'tr':
        anchorRow = row + currentSize - 1;
        anchorCol = col;
        break;
      case 'bl':
        anchorRow = row;
        anchorCol = col + currentSize - 1;
        break;
      case 'br':
        anchorRow = row;
        anchorCol = col;
        break;
      default:
        return { row: tile.row, col: tile.col, size: currentSize };
    }

    // shrinking (desiredSize < currentSize): just clamp to >=1 and use desired position
    if (desiredSize < currentSize) {
      const clampedSize = Math.max(1, desiredSize);
      let newRow, newCol;
      switch (corner) {
        case 'tl':
          newRow = anchorRow - clampedSize + 1;
          newCol = anchorCol - clampedSize + 1;
          break;
        case 'tr':
          newRow = anchorRow - clampedSize + 1;
          newCol = anchorCol;
          break;
        case 'bl':
          newRow = anchorRow;
          newCol = anchorCol - clampedSize + 1;
          break;
        case 'br':
          newRow = anchorRow;
          newCol = anchorCol;
          break;
        default:
          newRow = tile.row;
          newCol = tile.col;
      }
      // ensure within grid bounds
      newRow = Math.max(0, Math.min(newRow, gridRows - clampedSize));
      newCol = Math.max(0, Math.min(newCol, gridCols - clampedSize));
      return { row: newRow, col: newCol, size: clampedSize };
    }

    // expansion (desiredSize >= currentSize): find the largest size <= desiredSize that fits
    const maxPossible = Math.min(gridRows, gridCols);
    const upper = Math.min(desiredSize, maxPossible);
    let bestSize = currentSize;
    let bestRow = tile.row;
    let bestCol = tile.col;

    for (let s = currentSize; s <= upper; s++) {
      let r, c;
      switch (corner) {
        case 'tl':
          r = anchorRow - s + 1;
          c = anchorCol - s + 1;
          break;
        case 'tr':
          r = anchorRow - s + 1;
          c = anchorCol;
          break;
        case 'bl':
          r = anchorRow;
          c = anchorCol - s + 1;
          break;
        case 'br':
          r = anchorRow;
          c = anchorCol;
          break;
        default:
          r = tile.row;
          c = tile.col;
      }

      if (isAreaFree(tiles, gridRows, gridCols, r, c, s, tile.id)) {
        bestSize = s;
        bestRow = r;
        bestCol = c;
      } else {
        break; // stop at first collision
      }
    }

    return { row: bestRow, col: bestCol, size: bestSize };
  }, [initialLayout, gridRows, gridCols, tile.id, tile.row, tile.col, tiles]);

  // ----- mouse move & up handlers -----
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current || !initialLayout || !resizeCorner) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cellWidth = rect.width / gridCols;
      const cellHeight = rect.height / gridRows;

      // continuous floating‑point cell coordinate of the mouse
      const mouseColFloat = (e.clientX - rect.left) / cellWidth;
      const mouseRowFloat = (e.clientY - rect.top) / cellHeight;

      const { row, col, size: initialSize } = initialLayout;
      let newRow = row,
          newCol = col,
          newSize = initialSize;

      // compute spans from anchor to the mouse (floats) for each corner
      const computeSize = (rowSpan, colSpan) => {
        // raw size (ceiling to integer cells) – used for expansion
        const rawSize = Math.ceil(Math.max(rowSpan, colSpan));
        // shrink helper: if the raw ceil still equals the current size, but the
        // mouse has moved sufficiently inside the tile, force shrink
        if (rawSize === initialSize && initialSize > 1) {
          const maxSpan = Math.max(rowSpan, colSpan);
          if (maxSpan <= initialSize - SHRINK_MARGIN) {
            return initialSize - 1;
          }
        }
        return Math.max(1, rawSize);
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

      // validate and adjust the resize (checks occupancy for expansion, clamps for shrinking)
      const valid = getValidResize(resizeCorner, newRow, newCol, newSize);
      resizeTile(tile.id, valid.row, valid.col, valid.size);
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
  }, [resizing, resizeCorner, initialLayout, containerRef, gridRows, gridCols, tile.id, resizeTile, getValidResize]);

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

      {!( /* suppress titles for : */
        isInfoTile ||
        isImageWithContent ||
        isNoteTile ||
        isBoardWithImage ||
        isYoutubeWithUrl ||
        isCalendarTile ||
        isTimerTile ||
        isPinterestFilled
      ) && <h3 className="tile-title">{tile.title}</h3>}

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