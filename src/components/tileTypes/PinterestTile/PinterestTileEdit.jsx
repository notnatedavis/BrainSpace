//   src/components/tileTypes/PinterestTile/PinterestTileEdit.jsx

// ----- Imports -----
import React, { useState, useContext } from 'react';
import {
  fetchBoardData,
  getRandomPinImage,
  fetchPinImageData,
} from '../../../utils/pinterestApi';
import { TilesContext } from '../../../context/TilesContext';

// ----- Main -----
const PinterestTileEdit = ({ tile, onSave }) => {
  const { updateTile } = useContext(TilesContext);

  const [mode, setMode] = useState(tile.mode || 'board');

  // Board fields
  const [boardUrl, setBoardUrl] = useState(tile.boardUrl || '');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(
    tile.autoRefreshInterval || 0
  );

  // Pin fields
  const [pinUrl, setPinUrl] = useState(tile.pinUrl || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ----- Fetch helpers -----
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
      updateTile(tile.id, {
        boardUrl: boardUrl.trim(),
        boardTitle,
        pinImageUrl: randomImage,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPin = async () => {
    if (!pinUrl.trim()) {
      setError('Please enter a Pinterest pin URL first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { imageUrl, title } = await fetchPinImageData(pinUrl.trim());
      updateTile(tile.id, {
        pinUrl: pinUrl.trim(),
        imageUrl,
        title: title || tile.title,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----- Save handler -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'board') {
        if (!boardUrl.trim()) {
          setError('Board URL is required.');
          setLoading(false);
          return;
        }
        const { title: boardTitle, pinImages } = await fetchBoardData(boardUrl);
        const randomImage = getRandomPinImage(pinImages);
        onSave({
          mode: 'board',
          boardUrl: boardUrl.trim(),
          boardTitle,
          pinImageUrl: randomImage,
          autoRefreshInterval,
          lastUpdated: Date.now(),
          title: boardTitle,
          pinUrl: '',
          imageUrl: '',   // clear static fields
        });
      } else {
        if (!pinUrl.trim()) {
          setError('Pin URL is required.');
          setLoading(false);
          return;
        }
        const { imageUrl, title } = await fetchPinImageData(pinUrl.trim());
        onSave({
          mode: 'pin',
          pinUrl: pinUrl.trim(),
          imageUrl,
          title: title || tile.title,
          // clear board fields
          boardUrl: '',
          boardTitle: '',
          pinImageUrl: '',
          autoRefreshInterval: 0,
          lastUpdated: null,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ----- Styles -----
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
    width: '100%',
    boxSizing: 'border-box',
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

  const segmentStyle = (isActive) => ({
    flex: 1,
    padding: '0.5rem',
    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
    color: isActive ? 'white' : 'var(--color-text)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    outline: 'none',
  });

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  };

  const disabledStyle = loading ? { opacity: 0.6, cursor: 'not-allowed' } : {};

  return (
    <form onSubmit={handleSubmit}>
      {/* Mode selector */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Mode</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            style={segmentStyle(mode === 'board')}
            onClick={() => { setMode('board'); setError(''); }}
          >
            Board Shuffle
          </button>
          <button
            type="button"
            style={segmentStyle(mode === 'pin')}
            onClick={() => { setMode('pin'); setError(''); }}
          >
            Static Pin
          </button>
        </div>
      </div>

      {/* Board fields */}
      {mode === 'board' && (
        <>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Pinterest Board URL:</label>
            <input
              type="url"
              value={boardUrl}
              onChange={(e) => { setBoardUrl(e.target.value); setError(''); }}
              placeholder="https://www.pinterest.com/username/board-name/"
              style={{ ...inputStyle, ...disabledStyle }}
              disabled={loading}
            />
          </div>
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
              style={{ ...inputStyle, width: '120px' }}
              disabled={loading}
            />
            <small style={{ color: 'var(--color-text-light)' }}>
              0 = disabled. Board image will refresh every N seconds.
            </small>
          </div>
          <button
            type="button"
            style={{ ...buttonStyle, backgroundColor: '#6366f1', ...disabledStyle }}
            disabled={loading}
            onClick={handleRefreshBoard}
          >
            {loading ? 'Refreshing…' : 'Refresh Board Now'}
          </button>
        </>
      )}

      {/* Pin fields */}
      {mode === 'pin' && (
        <>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Pinterest Pin URL:</label>
            <input
              type="url"
              value={pinUrl}
              onChange={(e) => { setPinUrl(e.target.value); setError(''); }}
              placeholder="https://www.pinterest.com/pin/578360777206614341/"
              style={{ ...inputStyle, ...disabledStyle }}
              disabled={loading}
            />
          </div>
          <button
            type="button"
            style={{ ...buttonStyle, backgroundColor: '#6366f1', ...disabledStyle }}
            disabled={loading}
            onClick={handleFetchPin}
          >
            {loading ? 'Fetching…' : 'Fetch Pin Image'}
          </button>
        </>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      {/* Save */}
      <button
        type="submit"
        style={{ ...buttonStyle, ...disabledStyle }}
        disabled={loading}
      >
        {loading ? 'Saving…' : 'Save Pinterest Tile'}
      </button>
    </form>
  );
};

export default PinterestTileEdit;