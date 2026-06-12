//   src/components/tileTypes/CalendarTile/CalendarTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';
import HSLColorPicker from '../../common/HSLColorPicker';

// ----- Main -----
const CalendarTileEdit = ({ tile, onSave }) => {
  const [backgroundColor, setBackgroundColor] = useState(
    tile.backgroundColor || { h: 0, s: 0, l: 100 }
  );
  const [pinnedDate, setPinnedDate] = useState(tile.pinnedDate || '');
  const [scale, setScale] = useState(tile.scale ?? 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    let validPinned = null;
    if (pinnedDate.trim()) {
      const date = new Date(pinnedDate);
      if (!isNaN(date)) {
        validPinned = date.toISOString().split('T')[0];
      }
    }
    onSave({
      backgroundColor,
      pinnedDate: validPinned,
      scale: Math.min(1.5, Math.max(0.5, scale)),
      title: tile.title,
    });
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  };

  const labelStyle = {
    fontWeight: '500',
    fontSize: '0.875rem',
    color: 'var(--color-text-light)',
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
    width: '100%',
  };

  const sliderStyle = {
    ...inputStyle,
    padding: 0,
    accentColor: 'var(--color-accent)',
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
      {/* Background colour */}
      <div>
        <HSLColorPicker
          label="Background"
          hsl={backgroundColor}
          onChange={setBackgroundColor}
        />
      </div>

      {/* Pinned date (optional) */}
      <div>
        <label style={labelStyle}>Pinned date (optional)</label>
        <input
          type="date"
          value={pinnedDate}
          onChange={(e) => setPinnedDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Zoom / scale slider */}
      <div>
        <label style={labelStyle}>Zoom level: {scale.toFixed(2)}x</label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          style={sliderStyle}
        />
        <small style={{ color: 'var(--color-text-light)' }}>
          Smaller = more content fits (e.g., for 1x1 tiles)
        </small>
      </div>

      <button type="submit" style={buttonStyle}>
        Save Calendar
      </button>
    </form>
  );
};

export default CalendarTileEdit;