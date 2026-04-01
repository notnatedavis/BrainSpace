//   src/components/tileTypes/TimerTile/TimerTileEdit.jsx

// ----- Imports -----
import React, { useState } from 'react';

// ----- Main -----
const TimerTileEdit = ({ tile, onSave }) => {
  const [title, setTitle] = useState(tile.title || '');
  const [mode, setMode] = useState(tile.mode || 'stopwatch');
  const [initialMinutes, setInitialMinutes] = useState(
    Math.floor((tile.initialTime || 60) / 60)
  );
  const [initialSeconds, setInitialSeconds] = useState(
    (tile.initialTime || 60) % 60
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const initialTime = mode === 'countdown' ? initialMinutes * 60 + initialSeconds : undefined;
    onSave({ title, mode, initialTime });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label>Mode:</label>
        <label>
          <input
            type="radio"
            value="stopwatch"
            checked={mode === 'stopwatch'}
            onChange={() => setMode('stopwatch')}
          />
          Stopwatch
        </label>
        <label>
          <input
            type="radio"
            value="countdown"
            checked={mode === 'countdown'}
            onChange={() => setMode('countdown')}
          />
          Countdown
        </label>
      </div>
      {mode === 'countdown' && (
        <div>
          <label>Initial Time:</label>
          <input
            type="number"
            min="0"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || 0)}
            style={{ width: '80px' }}
          />
          <span> min </span>
          <input
            type="number"
            min="0"
            max="59"
            value={initialSeconds}
            onChange={(e) => setInitialSeconds(parseInt(e.target.value) || 0)}
            style={{ width: '80px' }}
          />
          <span> sec</span>
        </div>
      )}
      <button type="submit">Save</button>
    </form>
  );
};

export default TimerTileEdit;