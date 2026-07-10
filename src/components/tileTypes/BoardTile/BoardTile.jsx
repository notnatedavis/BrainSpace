// src/components/tileTypes/BoardTile/BoardTile.jsx
// Displays a random image from a Pinterest board.
// Auto-refreshes at a user-defined interval (if > 0) and shows error state on fetch failure.

// ----- Imports -----
import React, { useEffect, useRef, useContext, useState } from 'react';
import { fetchBoardData, getRandomPinImage } from '../../../utils/pinterestApi';
import { TilesContext } from '../../../context/TilesContext';

// ----- Main -----
const BoardTile = ({ tile }) => {
  const { updateTile } = useContext(TilesContext);
  const intervalRef = useRef(null);
  const [error, setError] = useState(null);

  const { pinImageUrl, boardUrl, boardTitle, title, autoRefreshInterval } = tile;

  // Function to refresh the board image (fetches new random image)
  const refreshBoard = async () => {
    if (!boardUrl) {
      setError('No board URL set');
      return;
    }

    try {
      const { pinImages } = await fetchBoardData(boardUrl);
      const randomImage = getRandomPinImage(pinImages);
      updateTile(tile.id, {
        pinImageUrl: randomImage,
        lastUpdated: Date.now(),
      });
      setError(null); // clear any previous error
    } catch (err) {
      console.warn('BoardTile refresh failed:', err);
      setError(err.message || 'Failed to load board image');
      // Do not clear interval; will retry on next tick
    }
  };

  // Set up auto-refresh interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up interval if URL is present and interval > 0
    if (boardUrl && autoRefreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refreshBoard().catch(err => {
          console.warn('BoardTile auto-refresh error:', err);
          setError(err.message || 'Auto-refresh failed');
        });
      }, autoRefreshInterval * 1000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // We intentionally omit 'refreshBoard' from dependencies to avoid re-creating interval on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardUrl, autoRefreshInterval]);

  // If there's an error, display a message
  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          padding: '0.5rem',
          fontSize: '0.875rem',
        }}
      >
        <span>⚠️</span>
        <span>{error}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setError(null);
            refreshBoard();
          }}
          style={{
            marginTop: '0.5rem',
            background: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.25rem 0.75rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // If no image URL, show a placeholder
  if (!pinImageUrl) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: 'var(--color-text-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
          fontSize: '0.875rem',
        }}
      >
        <span>🖼️</span>
        <span>No board image</span>
        <small>Click to edit and add a Pinterest board URL</small>
      </div>
    );
  }

  // Image fills the tile – no title bar, object-fit cover
  return (
    <img
      src={pinImageUrl}
      alt={boardTitle || title}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        borderRadius: 'var(--border-radius)', // match tile rounding
      }}
    />
  );
};

export default BoardTile;