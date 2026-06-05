// src/components/tileTypes/YoutubeTile/YoutubeTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Helper: Validate YouTube URL (same as display helper) -----
const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

// ----- Main -----
const YoutubeTileEdit = ({ tile, onSave }) => {
  const [url, setUrl] = useState(tile.url || '');
  const [title, setTitle] = useState(tile.title || '');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = getYoutubeVideoId(trimmedUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Use formats like:\n• youtube.com/watch?v=...\n• youtu.be/...\n• youtube.com/embed/...');
      return;
    }

    setError(null);
    onSave({
      url: trimmedUrl,
      title: title.trim() || 'YouTube Video',
    });
  };

  // Inline styles consistent with other edit modals
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

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.85rem',
    marginTop: '-0.5rem',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* Title field */}
      <div>
        <label style={labelStyle}>Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My favourite video"
          style={{ ...inputStyle, width: '100%' }}
          aria-label="Video title"
        />
      </div>

      {/* YouTube URL field */}
      <div>
        <label style={labelStyle}>YouTube URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{ ...inputStyle, width: '100%' }}
          aria-label="YouTube URL"
        />
      </div>

      {/* Error message */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Submit button */}
      <button type="submit" style={buttonStyle}>
        Save YouTube Tile
      </button>
    </form>
  );
};

export default YoutubeTileEdit;