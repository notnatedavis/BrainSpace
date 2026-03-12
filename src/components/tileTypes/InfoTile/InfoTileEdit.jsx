//   src/components/tileTypes/InfoTile/InfoTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const InfoTileEdit = ({ tile, onSave }) => {
  const [title, setTitle] = useState(tile.title || '');
  const [content, setContent] = useState(tile.content || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Content:</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default InfoTileEdit;