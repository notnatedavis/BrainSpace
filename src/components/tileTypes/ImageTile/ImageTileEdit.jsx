//   src/components/tileTypes/ImageTile/ImageTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const ImageTileEdit = ({ tile, onSave }) => {
  const [title, setTitle] = useState(tile.title || '');
  const [src, setSrc] = useState(tile.content || '');
  const [alt, setAlt] = useState(tile.alt || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, content: src, alt });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Image source (filename):</label>
        <input value={src} onChange={(e) => setSrc(e.target.value)} />
      </div>
      <div>
        <label>Alt text:</label>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} />
      </div>
      <button type="submit">Save</button>
    </form>
  );
};

export default ImageTileEdit;