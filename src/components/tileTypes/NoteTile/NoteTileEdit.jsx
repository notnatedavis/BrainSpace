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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="5"
        />
      </div>

      {/* Background color */}
      <div>
        <label>Background Color:</label>
        <select
          value={noteStyle.backgroundColor}
          onChange={(e) => updateStyle('backgroundColor', e.target.value)}
        >
          <option value="#ffffff">White</option>
          <option value="#ffcccc">Red</option>
          <option value="#ccccff">Blue</option>
        </select>
      </div>

      {/* Text formatting */}
      <div>
        <label>Formatting:</label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={noteStyle.bold}
              onChange={(e) => updateStyle('bold', e.target.checked)}
            />
            Bold
          </label>
          <label>
            <input
              type="checkbox"
              checked={noteStyle.italic}
              onChange={(e) => updateStyle('italic', e.target.checked)}
            />
            Italic
          </label>
          <label>
            <input
              type="checkbox"
              checked={noteStyle.underline}
              onChange={(e) => updateStyle('underline', e.target.checked)}
            />
            Underline
          </label>
        </div>
      </div>

      {/* Font size */}
      <div>
        <label>Font Size:</label>
        <select
          value={noteStyle.fontSize}
          onChange={(e) => updateStyle('fontSize', e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* Font family */}
      <div>
        <label>Font Family:</label>
        <select
          value={noteStyle.fontFamily}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
        >
          <option value="sans">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </div>

      {/* Header level */}
      <div>
        <label>Header Level:</label>
        <select
          value={noteStyle.headerLevel}
          onChange={(e) => updateStyle('headerLevel', parseInt(e.target.value))}
        >
          <option value={0}>None</option>
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      </div>

      <button type="submit">Save</button>
    </form>
  );
};

export default NoteTileEdit;