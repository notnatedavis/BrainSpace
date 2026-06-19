// src/components/TileContainer/GridResizeHandles.jsx

// ----- Imports -----
import React, { useContext, useState, useCallback, useRef } from 'react';
import { TilesContext } from '../../context/TilesContext';

// ----- Custom rounding with a lower threshold for earlier triggering -----
const THRESHOLD = 0.1; // smaller = more responsive
const customRound = (val, threshold) => {
  const sign = val >= 0 ? 1 : -1;
  const abs = Math.abs(val);
  return sign * Math.floor(abs + (1 - threshold));
};

// ----- Main -----
const GridResizeHandles = ({ containerRef }) => {
  const { gridRows, gridCols, resizeGrid } = useContext(TilesContext);
  const [resizing, setResizing] = useState(false);
  const [handleType, setHandleType] = useState(null); // 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
  const startPos = useRef({ x: 0, y: 0 });
  const startDims = useRef({ rows: gridRows, cols: gridCols });

  const handleMouseDown = (type) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    setHandleType(type);
    startPos.current = { x: e.clientX, y: e.clientY };
    startDims.current = { rows: gridRows, cols: gridCols };
  };

  const handleMouseMove = useCallback((e) => {
    if (!resizing) return;
    if (!containerRef.current) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const rect = containerRef.current.getBoundingClientRect();
    const cellWidth = rect.width / startDims.current.cols;
    const cellHeight = rect.height / startDims.current.rows;

    let deltaCols = 0;
    let deltaRows = 0;

    switch (handleType) {
      case 'e': // right edge → increase/decrease columns
        deltaCols = customRound(deltaX / cellWidth, THRESHOLD);
        break;
      case 'w': // left edge
        deltaCols = -customRound(deltaX / cellWidth, THRESHOLD);
        break;
      case 's': // bottom edge
        deltaRows = customRound(deltaY / cellHeight, THRESHOLD);
        break;
      case 'n': // top edge
        deltaRows = -customRound(deltaY / cellHeight, THRESHOLD);
        break;
      case 'ne': // top-right corner
        deltaRows = -customRound(deltaY / cellHeight, THRESHOLD);
        deltaCols = customRound(deltaX / cellWidth, THRESHOLD);
        break;
      case 'nw': // top-left
        deltaRows = -customRound(deltaY / cellHeight, THRESHOLD);
        deltaCols = -customRound(deltaX / cellWidth, THRESHOLD);
        break;
      case 'se': // bottom-right
        deltaRows = customRound(deltaY / cellHeight, THRESHOLD);
        deltaCols = customRound(deltaX / cellWidth, THRESHOLD);
        break;
      case 'sw': // bottom-left
        deltaRows = customRound(deltaY / cellHeight, THRESHOLD);
        deltaCols = -customRound(deltaX / cellWidth, THRESHOLD);
        break;
      default:
        break;
    }

    let newRows = Math.min(6, Math.max(3, startDims.current.rows + deltaRows));
    let newCols = Math.min(6, Math.max(3, startDims.current.cols + deltaCols));

    resizeGrid(newRows, newCols);
  }, [resizing, handleType, containerRef, resizeGrid]);

  const handleMouseUp = useCallback(() => {
    setResizing(false);
    setHandleType(null);
  }, []);

  React.useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  // Style for each handle: invisible but large enough to grab
  const handleStyle = {
    position: 'absolute',
    background: 'transparent',
    zIndex: 100,
  };

  // --- Updated sizes and offset for better ergonomics ---
  // pushed outward and enlarged hit areas
  const OFFSET = -15; 
  const cornerSize = 24; 
  const edgeSize = 12; 

  return (
    <>
      {/* Top edge */}
      <div
        style={{
          ...handleStyle,
          top: OFFSET,
          left: cornerSize,
          right: cornerSize,
          height: edgeSize,
          cursor: 'ns-resize',
        }}
        onMouseDown={handleMouseDown('n')}
      />
      {/* Bottom edge */}
      <div
        style={{
          ...handleStyle,
          bottom: OFFSET,
          left: cornerSize,
          right: cornerSize,
          height: edgeSize,
          cursor: 'ns-resize',
        }}
        onMouseDown={handleMouseDown('s')}
      />
      {/* Left edge */}
      <div
        style={{
          ...handleStyle,
          left: OFFSET,
          top: cornerSize,
          bottom: cornerSize,
          width: edgeSize,
          cursor: 'ew-resize',
        }}
        onMouseDown={handleMouseDown('w')}
      />
      {/* Right edge */}
      <div
        style={{
          ...handleStyle,
          right: OFFSET,
          top: cornerSize,
          bottom: cornerSize,
          width: edgeSize,
          cursor: 'ew-resize',
        }}
        onMouseDown={handleMouseDown('e')}
      />
      {/* Corners */}
      <div
        style = {{
          ...handleStyle,
          top: OFFSET,
          left: OFFSET,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nwse-resize',
        }}
        onMouseDown={handleMouseDown('nw')}
      />
      <div
        style = {{
          ...handleStyle,
          top: OFFSET,
          right: OFFSET,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nesw-resize',
        }}
        onMouseDown={handleMouseDown('ne')}
      />
      <div
        style = {{
          ...handleStyle,
          bottom: OFFSET,
          left: OFFSET,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nesw-resize',
        }}
        onMouseDown={handleMouseDown('sw')}
      />
      <div
        style = {{
          ...handleStyle,
          bottom: OFFSET,
          right: OFFSET,
          width: cornerSize,
          height: cornerSize,
          cursor: 'nwse-resize',
        }}
        onMouseDown={handleMouseDown('se')}
      />
    </>
  );
};

export default GridResizeHandles;