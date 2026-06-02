//   src/components/tileTypes/TimerTile/TimerTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Helper: parses a time string (H:MM:SS, MM:SS, or SS) into total seconds -----
const parseTimeInput = (str) => {
  const trimmed = str.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':');

  let totalSeconds = null;
  if (parts.length === 3) {
    // H:MM:SS
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    if (
      isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
      hours < 0 || minutes < 0 || seconds < 0 ||
      minutes > 59 || seconds > 59
    ) {
      return null;
    }
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    // MM:SS
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (
      isNaN(minutes) || isNaN(seconds) ||
      minutes < 0 || seconds < 0 || seconds > 59
    ) {
      return null;
    }
    totalSeconds = minutes * 60 + seconds;
  } else if (parts.length === 1) {
    // SS (plain seconds)
    const seconds = parseInt(parts[0], 10);
    if (isNaN(seconds) || seconds < 0) return null;
    totalSeconds = seconds;
  } else {
    return null;
  }

  // Max allowed: 24 hours
  const MAX_SECONDS = 24 * 3600; // 86400
  if (totalSeconds > MAX_SECONDS) return null;

  return totalSeconds;
};

// ----- Format total seconds back to a "H:MM:SS" display string (hours optional) -----
const formatSecondsToHMS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ----- Main -----
const TimerTileEdit = ({ tile, onSave }) => {
  // Form state
  const [title, setTitle] = useState(tile.title || '');
  const [mode, setMode] = useState(tile.mode || 'stopwatch');
  const [timeString, setTimeString] = useState(() => {
    const initialTime = tile.initialTime || 60;
    return formatSecondsToHMS(initialTime);
  });
  const [visualStyle, setVisualStyle] = useState(tile.visualStyle || 'none');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updateData = { title: title.trim(), mode, visualStyle };

    if (mode === 'countdown') {
      const totalSeconds = parseTimeInput(timeString);
      if (totalSeconds === null) {
        setError('Enter valid time (max 24h), Use HH:MM:SS / MM:SS / SS');
        return;
      }
      updateData.initialTime = totalSeconds;
    } else {
      updateData.initialTime = undefined;
    }

    setError(null);
    onSave(updateData);
  };

  // ----- Inline style definitions (consistent with other edit modals) -----
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
        <label style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My timer"
          style={{ ...inputStyle, width: '100%' }}
          aria-label="Timer title"
        />
      </div>

      {/* ---- Mode selection ---- */}
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

      {/* ---- Countdown initial time ---- */}
      {mode === 'countdown' && (
        <div>
          <label style={labelStyle}>(max 24h) HH:MM:SS / MM:SS / SS</label>
          <input
            value={timeString}
            onChange={(e) => {
              setTimeString(e.target.value);
              setError(null);
            }}
            placeholder="1:30:00"
            style={{ ...inputStyle, width: '100%' }}
            aria-label="Initial countdown time"
          />
        </div>
      )}

      {/* ---- Visual style selector ---- */}
      <div>
        <label style={labelStyle}>Visual Animation</label>
        <select
          value={visualStyle}
          onChange={(e) => setVisualStyle(e.target.value)}
          style={{ ...inputStyle, width: '100%' }}
        >
          <option value="none">None</option>
          <option value="circular">Circular Progress</option>
        </select>
      </div>

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