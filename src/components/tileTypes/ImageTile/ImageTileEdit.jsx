//   src/components/tileTypes/ImageTile/ImageTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const ImageTileEdit = ({ tile, onSave }) => {
  const [title, setTitle] = useState(tile.title || '');
  const [src, setSrc] = useState(tile.content || '');
  const [alt, setAlt] = useState(tile.alt || '');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSrc(event.target.result); // base64 string
    };
    reader.readAsDataURL(file);
  };

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
        <label>Image URL:</label>
        <input value={src} onChange={(e) => setSrc(e.target.value)} />
      </div>
      <div>
        <label>Or upload an image:</label>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
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