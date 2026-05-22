//   src/components/tileTypes/BoardTile/BoardTile.jsx

// ----- Imports -----
import React, { useEffect, useRef, useContext } from 'react';
import { fetchBoardData, getRandomPinImage } from '../../../utils/pinterestApi';
import { TilesContext } from '../../../context/TilesContext';

// ----- Main -----
const BoardTile = ({ tile }) => {
  const { updateTile } = useContext(TilesContext);
  const intervalRef = useRef(null);
  const { pinImageUrl, boardUrl, boardTitle, title, autoRefreshInterval } = tile;

  useEffect(() => {
    // clear any existing interval when props change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // only set up interval if URL is present and interval > 0
    if (boardUrl && autoRefreshInterval > 0) {
      intervalRef.current = setInterval(async () => {
        try {
          const { pinImages } = await fetchBoardData(boardUrl);
          const randomImage = getRandomPinImage(pinImages);
          updateTile(tile.id, {
            pinImageUrl: randomImage,
            lastUpdated: Date.now(),
            // keep everything else the same
          });
        } catch (err) {
          console.warn('BoardTile auto‑refresh failed:', err);
          // silently fail – we don't want to break the tile
        }
      }, autoRefreshInterval * 1000);
    }

    // cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [boardUrl, autoRefreshInterval, tile.id, updateTile]);
  
  // if no image URL, show a placeholder
  if (!pinImageUrl) {
    return (
      <div
        className="board-placeholder"
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
        No board image<br />
        <small>Click to edit and add a Pinterest board URL</small>
      </div>
    );
  }

  // image fills the tile – no title bar, object-fit cover
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