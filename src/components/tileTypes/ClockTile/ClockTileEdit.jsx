// src/components/tileTypes/ClockTile/ClockTileEdit.jsx
// Edit modal for ClockTile – choose display mode, font, text styling, hour format, and date visibility.

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const ClockTileEdit = ({ tile, onSave }) => {
  const [displayMode, setDisplayMode] = useState(tile.displayMode || 'flip');
  const [bold, setBold] = useState(tile.bold || false);
  const [italic, setItalic] = useState(tile.italic || false);
  const [fontFamily, setFontFamily] = useState(tile.fontFamily || 'monospace');
  const [hourFormat, setHourFormat] = useState(tile.hourFormat || '24h');
  const [showDate, setShowDate] = useState(tile.showDate || false); // new

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      displayMode,
      bold,
      italic,
      fontFamily,
      hourFormat,
      showDate,
    });
  };

  // Inline styles consistent with other edit modals
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

  const selectStyle = {
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
      {/* Display mode selector */}
      <div>
        <label style={labelStyle}>Display Mode</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            style={segmentStyle(displayMode === 'flip')}
            onClick={() => setDisplayMode('flip')}
          >
            Flip Clock
          </button>
          <button
            type="button"
            style={segmentStyle(displayMode === 'analog')}
            onClick={() => setDisplayMode('analog')}
          >
            Analog Clock
          </button>
        </div>
      </div>

      {/* Text styling – only visible for flip mode */}
      {displayMode === 'flip' && (
        <>
          <div>
            <label style={labelStyle}>Text Style</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={bold}
                  onChange={(e) => setBold(e.target.checked)}
                />
                Bold
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={italic}
                  onChange={(e) => setItalic(e.target.checked)}
                />
                Italic
              </label>
              {/* New Date checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                />
                Date
              </label>
            </div>
          </div>

          {/* Font family dropdown */}
          <div>
            <label style={labelStyle}>Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={selectStyle}
            >
              <option value="monospace">Monospace</option>
              <option value="sans">Sans‑serif</option>
              <option value="serif">Serif</option>
            </select>
          </div>

          {/* Hour format toggle */}
          <div>
            <label style={labelStyle}>Hour Format</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <button
                type="button"
                style={segmentStyle(hourFormat === '24h')}
                onClick={() => setHourFormat('24h')}
              >
                24‑hour
              </button>
              <button
                type="button"
                style={segmentStyle(hourFormat === '12h')}
                onClick={() => setHourFormat('12h')}
              >
                12‑hour (AM/PM)
              </button>
            </div>
          </div>
        </>
      )}

      <button type="submit" style={buttonStyle}>
        Save Clock
      </button>
    </form>
  );
};

export default ClockTileEdit;