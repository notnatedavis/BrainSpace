//   src/components/tileTypes/BoardTile/BoardTileEdit.jsx

// ----- Imports -----
import React, { useState, useContext } from 'react';
import { fetchBoardData, getRandomPinImage } from '../../../utils/pinterestApi';
import { TilesContext } from '../../../context/TilesContext';

// ----- Main -----
const BoardTileEdit = ({ tile, onSave }) => {
  const { updateTile } = useContext(TilesContext);

  // form fields
  const [boardUrl, setBoardUrl] = useState(tile.boardUrl || '');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(tile.autoRefreshInterval || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper Function : 
  const handleRefreshBoard = async () => {
    if (!boardUrl.trim()) {
      setError('Please enter a Pinterest board URL first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { title: boardTitle, pinImages } = await fetchBoardData(boardUrl);
      const randomImage = getRandomPinImage(pinImages);

      // update the tile in context (keeps modal open, updates preview)
      updateTile(tile.id, {
        boardUrl: boardUrl.trim(),
        boardTitle,
        pinImageUrl: randomImage,
        lastUpdated: Date.now(),
        title: boardTitle, // tile title remains hidden, but we keep it consistent
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // helper Function :
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!boardUrl.trim()) {
      setError('Please enter a Pinterest board URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // fetch board data from Pinterest via proxy
      const { title: boardTitle, pinImages } = await fetchBoardData(boardUrl);
      const randomImage = getRandomPinImage(pinImages);

      // save tile data: title (board title), boardUrl, pinImageUrl, boardTitle
      onSave({
        title: boardTitle,
        boardUrl: boardUrl.trim(),
        boardTitle,
        pinImageUrl: randomImage,
        lastUpdated: Date.now(),
        autoRefreshInterval,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const labelStyle = {
    fontWeight: '500',
    color: 'var(--color-text)',
  };

  const inputStyle = {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'inherit',
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
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  };

  const refreshButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6366f1',
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  };

  const disabledStyle = loading ? { opacity: 0.6, cursor: 'not-allowed' } : {};

  return (
    <form onSubmit={handleSubmit}>
      {/* Board URL field */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Pinterest Board URL:</label>
        <input
          type="url"
          value={boardUrl}
          onChange={(e) => setBoardUrl(e.target.value)}
          placeholder="https://www.pinterest.com/username/board-name/"
          style={{ ...inputStyle, ...disabledStyle }}
          disabled={loading}
        />
        <small style={{ color: 'var(--color-text-light)' }}>
          Example: https://www.pinterest.com/pinterest/design/
        </small>
      </div>

      {/* Auto‑refresh interval */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Auto‑refresh interval (seconds):</label>
        <input
          type="number"
          min="0"
          step="1"
          value={autoRefreshInterval}
          onChange={(e) =>
            setAutoRefreshInterval(Math.max(0, parseInt(e.target.value, 10) || 0))
          }
          style={inputStyle}
          disabled={loading}
        />
        <small style={{ color: 'var(--color-text-light)' }}>
          Set to 0 to disable. Board will fetch a new random image every N seconds.
        </small>
      </div>

      {/* Error message */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Force reset button – refreshes the image without closing modal */}
      <button
        type="button"
        style={{ ...refreshButtonStyle, ...disabledStyle }}
        disabled={loading}
        onClick={handleRefreshBoard}
      >
        {loading ? 'Refreshing…' : 'Refresh Board Now'}
      </button>

      {/* Save button */}
      <button
        type="submit"
        style={{ ...buttonStyle, ...disabledStyle }}
        disabled={loading}
      >
        {loading ? 'Saving…' : 'Save Board Tile'}
      </button>
    </form>
  );
};

export default BoardTileEdit;