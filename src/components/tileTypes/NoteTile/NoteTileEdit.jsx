//   src/components/tileTypes/NoteTile/NoteTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const NoteTileEdit = ({ tile, onSave }) => {
  const [title, setTitle] = useState(tile.title || '');
  const [content, setContent] = useState(tile.content || '');
  const [noteStyle, setNoteStyle] = useState(
    tile.noteStyle || {
      backgroundColor: '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 'medium',
      fontFamily: 'sans',
      headerLevel: 0,
    }
  );

  const updateStyle = (key, value) => {
    setNoteStyle((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content, noteStyle });
  };

  // Inline styles for consistent form elements
  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const labelStyle = {
    fontWeight: '500',
    color: 'var(--color-text)',
  };

  const inputStyle = {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'inherit',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '80px',
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: 'var(--color-surface)',
  };

  const checkboxGroupStyle = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  };

  const buttonStyle = {
    backgroundColor: 'var(--color-accent)',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: 'var(--font-size-base)',
    fontWeight: '500',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title field */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          placeholder="Note title"
        />
      </div>

      {/* Content field */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          style={textareaStyle}
          placeholder="Write your note here..."
        />
      </div>

      {/* Background color */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Background Color:</label>
        <select
          value={noteStyle.backgroundColor}
          onChange={(e) => updateStyle('backgroundColor', e.target.value)}
          style={selectStyle}
        >
          <option value="#ffffff">White</option>
          <option value="#ffcccc">Light Red</option>
          <option value="#ccccff">Light Blue</option>
          <option value="#ccffcc">Light Green</option>
          <option value="#ffffcc">Light Yellow</option>
        </select>
      </div>

      {/* Text formatting (bold, italic, underline) */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Text Style:</label>
        <div style={checkboxGroupStyle}>
          <label>
            <input
              type="checkbox"
              checked={noteStyle.bold}
              onChange={(e) => updateStyle('bold', e.target.checked)}
            />{' '}
            Bold
          </label>
          <label>
            <input
              type="checkbox"
              checked={noteStyle.italic}
              onChange={(e) => updateStyle('italic', e.target.checked)}
            />{' '}
            Italic
          </label>
          <label>
            <input
              type="checkbox"
              checked={noteStyle.underline}
              onChange={(e) => updateStyle('underline', e.target.checked)}
            />{' '}
            Underline
          </label>
        </div>
      </div>

      {/* Font size and family in a two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Font Size:</label>
          <select
            value={noteStyle.fontSize}
            onChange={(e) => updateStyle('fontSize', e.target.value)}
            style={selectStyle}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Font Family:</label>
          <select
            value={noteStyle.fontFamily}
            onChange={(e) => updateStyle('fontFamily', e.target.value)}
            style={selectStyle}
          >
            <option value="sans">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
          </select>
        </div>
      </div>

      {/* Header level */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Header Level:</label>
        <select
          value={noteStyle.headerLevel}
          onChange={(e) => updateStyle('headerLevel', parseInt(e.target.value))}
          style={selectStyle}
        >
          <option value={0}>None (normal text)</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>
      </div>

      <button type="submit" style={buttonStyle}>
        Save Note
      </button>
    </form>
  );
};

export default NoteTileEdit;