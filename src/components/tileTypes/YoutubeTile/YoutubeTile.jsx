// src/components/tileTypes/YoutubeTile/YoutubeTile.jsx

// ----- Imports -----
import React from 'react';

// ----- Helper: Extract YouTube video ID from various URL formats -----
const getYoutubeVideoId = (url) => {
  if (!url) return null;

  // Regular expressions for common YouTube URL patterns
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
const YoutubeTile = ({ tile }) => {
  const { url } = tile;
  const videoId = getYoutubeVideoId(url);

  // No URL or invalid URL: show placeholder
  if (!url || !videoId) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          textAlign: 'center',
          color: 'var(--color-text-light)',
          fontSize: '0.875rem',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <span>📺</span>
        <span>No YouTube link set</span>
        <small>Click to edit</small>
      </div>
    );
  }

  const embedSrc = `https://www.youtube.com/embed/${videoId}`;

  // Video fills entire tile – no padding, full width/height
  return (
    <div
      style={{
        background: '#000000',
        width: '100%',
        height: '100%',
        borderRadius: 'var(--border-radius)',
        overflow: 'hidden',
      }}
    >
      <iframe
        src={embedSrc}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

export default YoutubeTile;