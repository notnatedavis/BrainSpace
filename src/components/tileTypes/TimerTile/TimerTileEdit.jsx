//   src/components/tileTypes/TimerTile/TimerTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Helper: parses a "mm:ss" string into total seconds -----
const parseTimeInput = (str) => {
  const trimmed = str.trim();
  if (!trimmed) return null; // treat empty as invalid
  const parts = trimmed.split(':');
  if (parts.length > 2) return null;
  const minutes = parseInt(parts[0], 10);
  const seconds = parts.length === 2 ? parseInt(parts[1], 10) : 0;
  if (
    isNaN(minutes) ||
    isNaN(seconds) ||
    minutes < 0 ||
    seconds < 0 ||
    seconds > 59 ||
    (parts.length === 1 && parts[0].includes(':')) // edge case
  ) {
    return null;
  }
  return minutes * 60 + seconds;
};

// ----- Format total seconds back to a "mm:ss" display string -----
const formatSecondsToMMSS = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// ----- Main -----
const TimerTileEdit = ({ tile, onSave }) => {
  // Form state
  const [title, setTitle] = useState(tile.title || '');
  const [mode, setMode] = useState(tile.mode || 'stopwatch');
  const [timeString, setTimeString] = useState(() => {
    const initialTime = tile.initialTime || 60;
    return formatSecondsToMMSS(initialTime);
  });
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // always include title and mode
    const updateData = { title: title.trim(), mode };

    // only parse and include initialTime for countdown mode
    if (mode === 'countdown') {
      const totalSeconds = parseTimeInput(timeString);
      if (totalSeconds === null) {
        setError('Please enter a valid time in mm:ss format (e.g., 5:00).');
        return;
      }
      updateData.initialTime = totalSeconds;
    } else {
      // stopwatch mode – clear any stored initial time (optional)
      updateData.initialTime = undefined;
    }

    setError(null);
    onSave(updateData);
  };

  // ----- Inline style definitions (consistent with the ImageTile edit modal) -----
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

  // ----- Mode segmented control button styles -----
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

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {/* ---- Optional title ---- */}
      <div>
        <label style={labelStyle}>Title (optional)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My timer"
          style={{ ...inputStyle, width: '100%' }}
          aria-label="Timer title"
        />
      </div>

      {/* ---- Mode selection as a segmented control ---- */}
      <div>
        <label style={labelStyle}>Mode</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            style={segmentStyle(mode === 'stopwatch')}
            onClick={() => {
              setMode('stopwatch');
              setError(null);
            }}
          >
            Stopwatch
          </button>
          <button
            type="button"
            style={segmentStyle(mode === 'countdown')}
            onClick={() => {
              setMode('countdown');
              setError(null);
            }}
          >
            Countdown
          </button>
        </div>
      </div>

      {/* ---- Countdown initial time (only visible when countdown mode is selected) ---- */}
      {mode === 'countdown' && (
        <div>
          <label style={labelStyle}>Initial time (mm:ss)</label>
          <input
            value={timeString}
            onChange={(e) => {
              setTimeString(e.target.value);
              setError(null);
            }}
            placeholder="5:00"
            style={{ ...inputStyle, width: '100%' }}
            aria-label="Initial countdown time"
          />
        </div>
      )}

      {/* ---- Error message ---- */}
      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
          {error}
        </div>
      )}

      {/* ---- Submit button ---- */}
      <button type="submit" style={buttonStyle}>
        Save Timer
      </button>
    </form>
  );
};

export default TimerTileEdit;