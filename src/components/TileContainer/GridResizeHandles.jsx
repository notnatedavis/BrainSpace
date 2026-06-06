// src/components/TileContainer/GridResizeHandles.jsx

// ----- Imports -----
import React, { useContext, useState, useCallback, useRef } from 'react';
import { TilesContext } from '../../context/TilesContext';

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
        deltaCols = Math.round(deltaX / cellWidth);
        break;
      case 'w': // left edge
        deltaCols = -Math.round(deltaX / cellWidth);
        break;
      case 's': // bottom edge
        deltaRows = Math.round(deltaY / cellHeight);
        break;
      case 'n': // top edge
        deltaRows = -Math.round(deltaY / cellHeight);
        break;
      case 'ne': // top-right corner
        deltaRows = -Math.round(deltaY / cellHeight);
        deltaCols = Math.round(deltaX / cellWidth);
        break;
      case 'nw': // top-left
        deltaRows = -Math.round(deltaY / cellHeight);
        deltaCols = -Math.round(deltaX / cellWidth);
        break;
      case 'se': // bottom-right
        deltaRows = Math.round(deltaY / cellHeight);
        deltaCols = Math.round(deltaX / cellWidth);
        break;
      case 'sw': // bottom-left
        deltaRows = Math.round(deltaY / cellHeight);
        deltaCols = -Math.round(deltaX / cellWidth);
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

  // Corner handles: 16x16px squares at corners
  const cornerSize = 16;
  const edgeSize = 8;

  return (
    <>
      {/* Top edge */}
      <div
        style={{
          ...handleStyle,
          top: -edgeSize / 2,
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
          bottom: -edgeSize / 2,
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
          left: -edgeSize / 2,
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
          right: -edgeSize / 2,
          top: cornerSize,
          bottom: cornerSize,
          width: edgeSize,
          cursor: 'ew-resize',
        }}
        onMouseDown={handleMouseDown('e')}
      />
      {/* Corners */}
      <div
        style={{ ...handleStyle, top: -cornerSize / 2, left: -cornerSize / 2, width: cornerSize, height: cornerSize, cursor: 'nwse-resize' }}
        onMouseDown={handleMouseDown('nw')}
      />
      <div
        style={{ ...handleStyle, top: -cornerSize / 2, right: -cornerSize / 2, width: cornerSize, height: cornerSize, cursor: 'nesw-resize' }}
        onMouseDown={handleMouseDown('ne')}
      />
      <div
        style={{ ...handleStyle, bottom: -cornerSize / 2, left: -cornerSize / 2, width: cornerSize, height: cornerSize, cursor: 'nesw-resize' }}
        onMouseDown={handleMouseDown('sw')}
      />
      <div
        style={{ ...handleStyle, bottom: -cornerSize / 2, right: -cornerSize / 2, width: cornerSize, height: cornerSize, cursor: 'nwse-resize' }}
        onMouseDown={handleMouseDown('se')}
      />
    </>
  );
};

export default GridResizeHandles;