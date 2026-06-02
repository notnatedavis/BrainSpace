//   src/components/tileTypes/TimerTile/TimerTile.jsx

// ----- Imports -----
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './TimerTile.css';

// ----- Helper: format seconds to HH:MM:SS -----
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ----- Circular progress ring constants -----
const CIRCLE_RADIUS = 40;       // SVG radius
const CIRCLE_CIRCUM = 2 * Math.PI * CIRCLE_RADIUS;

// ----- Main -----
const TimerTile = ({ tile }) => {
  const { mode, initialTime, visualStyle } = tile;
  const [time, setTime] = useState(mode === 'stopwatch' ? 0 : initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = (e) => {
    e.stopPropagation(); // prevent tile edit modal
    if (isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (mode === 'stopwatch') {
          return prev + 1;
        } else {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);
  };

  const pauseTimer = (e) => {
    e.stopPropagation(); // prevent tile edit modal
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = (e) => {
    e.stopPropagation(); // prevent tile edit modal
    pauseTimer(e);
    setTime(mode === 'stopwatch' ? 0 : initialTime);
  };

  // ----- Estimated finish time (countdown only) -----
  const finishTime = useMemo(() => {
    if (mode !== 'countdown' || time <= 0) return null;
    const finishDate = new Date(Date.now() + time * 1000);
    return finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [mode, time]);

  // ----- Circular progress ring (only for countdown with visualStyle === 'circular') -----
  const showRing = mode === 'countdown' && visualStyle === 'circular';
  const ringProgress = mode === 'countdown' ? time / initialTime : 0; // 1 = full, 0 = empty
  const dashOffset = CIRCLE_CIRCUM * (1 - ringProgress);

  return (
    <div className="timer-tile">
      {/* ---- Visual indicator + time display (wrapped together) ---- */}
      <div className="timer-visual">
        {showRing && (
          <svg className="timer-ring" viewBox="0 0 96 96">
            <circle
              className="timer-ring-track"
              cx="48"
              cy="48"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="5"
            />
            <circle
              className="timer-ring-progress"
              cx="48"
              cy="48"
              r={CIRCLE_RADIUS}
              fill="none"
              strokeWidth="5"
              strokeDasharray={CIRCLE_CIRCUM}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
            />
          </svg>
        )}
        <div className="timer-display">{formatTime(time)}</div>
        {finishTime && <div className="timer-finish-time">~ {finishTime}</div>}
      </div>

      {/* ---- Controls ---- */}
      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={pauseTimer}>Pause</button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
};

export default TimerTile;