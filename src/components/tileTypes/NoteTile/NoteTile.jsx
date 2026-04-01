//   src/components/tileTypes/NoteTile/NoteTile.jsx

// ----- Imports -----
import React from 'react';

// ----- Helper to apply formatting styles -----
const applyStyle = (text, style) => {
  let styledText = text;
  if (style.bold) styledText = <strong>{styledText}</strong>;
  if (style.italic) styledText = <em>{styledText}</em>;
  if (style.underline) styledText = <u>{styledText}</u>;
  return styledText;
};

// ----- Main -----
const NoteTile = ({ tile }) => {
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

  const style = {
    backgroundColor,
    padding: '1rem',
    borderRadius: '8px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily:
      fontFamily === 'sans' ? 'sans-serif' : fontFamily === 'serif' ? 'serif' : 'monospace',
    fontSize:
      fontSize === 'small' ? '0.8rem' : fontSize === 'large' ? '1.2rem' : '1rem',
  };

  const formattedContent = applyStyle(content, { bold, italic, underline });

  const headerElement = () => {
    switch (headerLevel) {
      case 1:
        return <h1 style={{ margin: 0 }}>{formattedContent}</h1>;
      case 2:
        return <h2 style={{ margin: 0 }}>{formattedContent}</h2>;
      case 3:
        return <h3 style={{ margin: 0 }}>{formattedContent}</h3>;
      default:
        return <div>{formattedContent}</div>;
    }
  };

  return <div style={style}>{headerElement()}</div>;
};

export default NoteTile;