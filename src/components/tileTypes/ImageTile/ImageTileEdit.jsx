//   src/components/tileTypes/ImageTile/ImageTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const ImageTileEdit = ({ tile, onSave }) => {
  // Only keep the image source (content)
  const [src, setSrc] = useState(tile.content || '');

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
    // Save only the content (image source)
    onSave({ content: src });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label>Image URL:</label>
        <input 
          value={src} 
          onChange={(e) => setSrc(e.target.value)} 
          placeholder="https://example.com/image.jpg"
          style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
        />
      </div>
      <div>
        <label>Or upload an image:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload} 
          style={{ marginTop: '0.25rem' }}
        />
      </div>
      <button type="submit" style={{ 
        backgroundColor: 'var(--color-accent)', 
        color: 'white', 
        border: 'none', 
        padding: '0.5rem 1rem', 
        borderRadius: '8px', 
        cursor: 'pointer',
        marginTop: '0.5rem'
      }}>
        Save Image
      </button>
    </form>
  );
};

export default ImageTileEdit;