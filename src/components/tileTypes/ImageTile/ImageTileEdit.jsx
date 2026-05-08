//   src/components/tileTypes/ImageTile/ImageTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const ImageTileEdit = ({ tile, onSave }) => {
  // Form fields – initialise from existing tile data
  const [src, setSrc] = useState(tile.content || '');
  const [alt, setAlt] = useState(tile.alt || '');
  const [title, setTitle] = useState(tile.title || '');
  const [error, setError] = useState(null);

  // ----- Handles file selection via the upload button -----
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic validation – file type should be an image
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }

    setError(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      setSrc(event.target.result); // base64 data‑URL
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  // ----- Submit handler – packages all data and saves -----
  const handleSubmit = (e) => {
    e.preventDefault();

    // Trim whitespace but allow empty values (the tile component will handle them)
    const trimmedSrc = src.trim();
    const trimmedAlt = alt.trim();
    const trimmedTitle = title.trim();

    onSave({
      content: trimmedSrc,
      alt: trimmedAlt,
      title: trimmedTitle,
    });
  };

  // ----- Inline style definitions (uses global variables where applicable) -----
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  };

  const inputStyle = {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'inherit',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontWeight: '500',
    fontSize: '0.875rem',
    color: 'var(--color-text-light)',
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
    transition: 'background-color 0.2s',
    alignSelf: 'flex-end',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* ---- Preview of current image (if any) ---- */}
      {src && (
        <img
          src={src}
          alt="Preview"
          style={{
            width: '100%',
            maxHeight: '180px',
            objectFit: 'contain',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}
        />
      )}

      {/* ---- URL input and file upload grouped on one row ---- */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Image URL</label>
          <input
            value={src}
            onChange={(e) => {
              setSrc(e.target.value);
              setError(null);
            }}
            placeholder="https://example.com/image.jpg"
            style={{ ...inputStyle, width: '100%' }}
            aria-label="Image URL"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Visual label for the file picker */}
          <label style={{ ...labelStyle, marginBottom: '0.25rem', cursor: 'pointer' }}>
            Upload
          </label>
          <label
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            Choose file
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              hidden
            />
          </label>
        </div>
      </div>

      {/* ---- Error message (file reading or validation) ---- */}
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
          {error}
        </div>
      )}

      {/* ---- Submit button ---- */}
      <button type="submit" style={buttonStyle}>
        Save Image
      </button>
    </form>
  );
};

export default ImageTileEdit;