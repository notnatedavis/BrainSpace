// src/components/tileTypes/NoteTile/NoteTile.jsx
import React, { useContext } from 'react';
import { TilesContext } from '../../../context/TilesContext';
import '../../Tile/Tile.css'; // Correct path to the CSS file

const NoteTile = ({ tile }) => {
  const { updateTile } = useContext(TilesContext);

  const { content, noteStyle = {} } = tile;
  const {
    backgroundColor = '#ffffff',
    bold = false,
    italic = false,
    underline = false,
    fontSize = 'medium',
    fontFamily = 'sans',
    headerLevel = 0,
  } = noteStyle;

  // Predefined color options for the toolbar button
  const colorOptions = ['#ffffff', '#ffcccc', '#ccccff', '#ccffcc', '#ffffcc'];

  const cycleColor = () => {
    const currentIndex = colorOptions.indexOf(backgroundColor);
    const nextIndex = (currentIndex + 1) % colorOptions.length;
    updateTile(tile.id, {
      noteStyle: { ...noteStyle, backgroundColor: colorOptions[nextIndex] }
    });
  };

  const toggleBold = () => {
    updateTile(tile.id, {
      noteStyle: { ...noteStyle, bold: !bold }
    });
  };

  // Build inline styles for the note content
  const textStyles = {
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    textDecoration: underline ? 'underline' : 'none',
    fontSize: fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.25rem' : '1rem',
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'monospace' : 'sans-serif',
    margin: 0,
  };

  // Render header if headerLevel > 0
  const renderContent = () => {
    const HeaderTag = headerLevel >= 1 && headerLevel <= 3 ? `h${headerLevel}` : 'div';
    return (
      <HeaderTag style={textStyles}>
        {content || 'Click to edit note'}
      </HeaderTag>
    );
  };

  return (
    <div className="note-tile" style={{ backgroundColor }}>
      <div className="toolbar">
        <button onClick={cycleColor} className="tool-btn" title="Change background color">
          🎨 Color
        </button>
        <button onClick={toggleBold} className="tool-btn" title="Toggle bold">
          <strong>B</strong>
        </button>
        {/* Add more buttons if needed */}
      </div>
      <div className="note-body">
        {renderContent()}
      </div>
    </div>
  );
};

export default NoteTile;