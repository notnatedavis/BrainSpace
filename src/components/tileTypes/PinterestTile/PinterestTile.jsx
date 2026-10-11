//   src/components/tileTypes/PinterestTile/PinterestTile.jsx

// ----- Imports -----
import React, { useEffect, useRef, useContext } from 'react';
import { fetchRandomValidPin } from '../../../utils/pinterestApi';
import { logger } from '../../../utils/logger';
import { TilesContext } from '../../../context/TilesContext';

// ----- Main -----
const PinterestTile = ({ tile }) => {
  const { updateTile } = useContext(TilesContext);
  const intervalRef = useRef(null);

  const {
    mode,
    boardUrl,
    pinImageUrl,
    imageUrl,
    autoRefreshInterval,
  } = tile;

  // Auto‑refresh for board mode – fetches a fresh, validated pin each tick.
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mode === 'board' && boardUrl && autoRefreshInterval > 0) {
      logger.debug(
        `[PinterestTile] Auto-refresh armed (${autoRefreshInterval}s) for ${boardUrl}`
      );

      intervalRef.current = setInterval(async () => {
        try {
          logger.debug('[PinterestTile] Auto-refresh tick – fetching validated pin…');
          const result = await fetchRandomValidPin(boardUrl, { maxAttempts: 8 });
          updateTile(tile.id, {
            pinUrl: result.pinUrl,
            pinImageUrl: result.imageUrl,
            boardTitle: result.boardTitle || tile.boardTitle,
            lastUpdated: Date.now(),
          });
          logger.debug(`[PinterestTile] Auto-refresh OK: ${result.imageUrl}`);
        } catch (err) {
          logger.warn(`[PinterestTile] Auto-refresh failed: ${err.message}`);
        }
      }, autoRefreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, boardUrl, autoRefreshInterval, tile.id, tile.boardTitle, updateTile]);

  // Determine which image to display
  let displayImage = null;
  if (mode === 'board' && pinImageUrl) {
    displayImage = pinImageUrl;
  } else if (mode === 'pin' && imageUrl) {
    displayImage = imageUrl;
  }

  if (!displayImage) {
    return (
      <div
        style={{
          textAlign: 'center',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        {mode === 'board' ? 'No board image' : 'No pin image set'}
        <br />
        <small>Click to edit and configure</small>
      </div>
    );
  }

  return (
    <img
      src={displayImage}
      alt={tile.boardTitle || tile.title || 'Pinterest'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        borderRadius: 'var(--border-radius)',
      }}
    />
  );
};

export default PinterestTile;