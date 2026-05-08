//   src/components/tileTypes/NoteTile/NoteTile.jsx

// ----- Imports -----
import React, { useState, useContext, useRef, useEffect } from 'react';
import { TilesContext } from '../../../context/TilesContext';

// ----- Main -----
const NoteTile = ({ tile }) => {
  const { updateTile } = useContext(TilesContext);
  const [isEditing, setIsEditing] = useState(false);

  // Local state during editing – initialised from the current tile data
  const [editContent, setEditContent] = useState(tile.content || '');
  const [editStyle, setEditStyle] = useState(
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

  // Reference to the contenteditable div for applying formatting commands
  const editorRef = useRef(null);

  // Keep the editor’s innerHTML in sync with editContent when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.innerHTML = editContent;
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- Enter / leave editing -----
  const handleTileClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    // Get the current HTML from the contenteditable div
    const html = editorRef.current ? editorRef.current.innerHTML : editContent;
    updateTile(tile.id, {
      content: html,
      noteStyle: editStyle,
      title: '', // title not displayed anymore
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset local state to the original (unchanged) tile data
    setEditContent(tile.content || '');
    setEditStyle(
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
  };

  // ----- Text formatting helpers (only operate on the contenteditable div) -----
  const applyBold = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('bold', false, null);
    }
  };

  const applyItalic = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('italic', false, null);
    }
  };

  const applyUnderline = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('underline', false, null);
    }
  };

  // ----- Color circle prototype: red, green, blue -----
  const colorOptions = ['#ff0000', '#00ff00', '#0000ff'];
  const currentColor = editStyle.backgroundColor || '#ffffff';

  // ----- Display mode -----
  if (!isEditing) {
    const { backgroundColor = '#ffffff', bold = false, italic = false, underline = false, fontSize = 'medium', fontFamily = 'sans', headerLevel = 0 } = tile.noteStyle || {};
    const textStyles = {
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : 'none',
      fontSize:
        fontSize === 'small' ? '0.875rem' : fontSize === 'large' ? '1.25rem' : '1rem',
      fontFamily:
        fontFamily === 'serif'
          ? 'Georgia, serif'
          : fontFamily === 'mono'
          ? 'monospace'
          : 'sans-serif',
      margin: 0,
      color: '#1e293b',
    };

    const HeaderTag = headerLevel >= 1 && headerLevel <= 3 ? `h${headerLevel}` : 'div';

    return (
      <div
        className="note-tile-display"
        style={{
          backgroundColor,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.75rem',
          cursor: 'pointer',
          borderRadius: 'var(--border-radius)',
          boxSizing: 'border-box',
        }}
        onClick={handleTileClick}
      >
        <HeaderTag style={textStyles}>
          {/* Render saved HTML safely (content may be plain text or HTML) */}
          <span dangerouslySetInnerHTML={{ __html: tile.content || 'note pad' }} />
        </HeaderTag>
      </div>
    );
  }

  // ----- Editing mode -----
  return (
    <div
      className="note-tile-edit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: '2.5rem 0.5rem 0.5rem 0.5rem',   /* top right bottom left */
        backgroundColor: editStyle.backgroundColor,
        boxSizing: 'border-box',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ---------- Toolbar row 1: bold / italic / underline ---------- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={applyBold}
          style={{
            fontWeight: 'bold',
            padding: '0.2rem 0.6rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          B
        </button>
        <button
          type="button"
          onClick={applyItalic}
          style={{
            fontStyle: 'italic',
            padding: '0.2rem 0.6rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          I
        </button>
        <button
          type="button"
          onClick={applyUnderline}
          style={{
            textDecoration: 'underline',
            padding: '0.2rem 0.6rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          U
        </button>
      </div>

      {/* ---------- Toolbar row 2: color circles ---------- */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem' }}>
        {colorOptions.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setEditStyle((prev) => ({ ...prev, backgroundColor: color }))}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: color,
              border: currentColor === color ? '2px solid #333' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
            }}
            title={`Set background to ${color}`}
          />
        ))}
      </div>

      {/* ---------- Editable area (contenteditable div) ---------- */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        style={{
          flex: 1,
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '0.5rem',
          fontFamily: 'inherit',
          fontSize: '1rem',
          background: 'rgba(255,255,255,0.9)',
          outline: 'none',
          overflowY: 'auto',
          minHeight: 0,
        }}
        // Placeholder text when empty
        onFocus={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.setAttribute('data-placeholder', 'Write your note…');
          }
        }}
        onBlur={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.removeAttribute('data-placeholder');
          }
        }}
      />

      {/* ---------- Save / Cancel actions ---------- */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: '0.3rem 0.8rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '0.3rem 0.8rem',
            border: 'none',
            borderRadius: '4px',
            background: 'var(--color-accent)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NoteTile;