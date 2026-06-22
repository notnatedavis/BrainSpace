//   src/components/tileTypes/TimerTile/TimerTile.jsx
//   Displays a stopwatch or countdown timer with optional visual animations.
//   Animations are only available for countdown mode.
//   All visual elements scale with the tile size (tile.size).

// ----- Imports -----
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './TimerTile.css';

// ----- Helper: format seconds to HH:MM:SS (always 2‑digit hours) -----
const formatTime = (seconds) => {
  const clamped = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ----- Circular progress ring constants (base size, scaled later) -----
const BASE_CIRCLE_RADIUS = 40;
const BASE_CIRCLE_CIRCUM = 2 * Math.PI * BASE_CIRCLE_RADIUS;

// ----- Helper: map progress (0..1) to a colour (green → red) -----
const getColorFromProgress = (progress) => {
  const hue = 120 * progress; // 120 (green) at 1, 0 (red) at 0
  return `hsl(${hue}, 80%, 50%)`;
};

// ----- Main -----
const TimerTile = ({ tile }) => {
  const { mode, initialTime, visualStyle, size = 1 } = tile;

  // Scale factor based on tile size (grid cells)
  // 1x1 → 1.0, 2x2 → 1.5, 3x3 → 2.0, etc.
  const scaleFactor = 1 + (size - 1) * 0.5;

  // State
  const [time, setTime] = useState(mode === 'stopwatch' ? 0 : initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // Refs
  const intervalRef = useRef(null);
  const modeRef = useRef(mode);

  // Keep modeRef in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ----- Timer logic (cleans up interval on unmount or when running state changes) -----
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const currentMode = modeRef.current;
          let newTime;
          if (currentMode === 'stopwatch') {
            newTime = prev + 1;
          } else { // countdown
            if (prev <= 1) {
              setIsRunning(false);
              clearInterval(intervalRef.current);
              return 0;
            }
            newTime = prev - 1;
          }
          return Math.max(0, newTime);
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // ----- Control handlers -----
  const startTimer = useCallback((e) => {
    e.stopPropagation();
    if (isRunning) return;
    if (mode === 'countdown' && time === 0) {
      setTime(initialTime);
    }
    setIsRunning(true);
  }, [isRunning, mode, time, initialTime]);

  const pauseTimer = useCallback((e) => {
    e.stopPropagation();
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((e) => {
    e.stopPropagation();
    setIsRunning(false);
    setTime(mode === 'stopwatch' ? 0 : initialTime);
  }, [mode, initialTime]);

  // ----- Estimated finish time (countdown only) -----
  const finishTime = useMemo(() => {
    if (mode !== 'countdown' || time <= 0) return null;
    const finishDate = new Date(Date.now() + time * 1000);
    return finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [mode, time]);

  // ----- Animation data (only for countdown) -----
  const isCountdown = mode === 'countdown';
  const progress = isCountdown && initialTime > 0
    ? Math.min(1, time / initialTime)
    : 0;

  // ----- Visual rendering based on visualStyle (only when countdown) -----
  let animationElement = null;
  let tileStyle = {};

  if (isCountdown) {
    // Scale the ring geometry
    const scaledRadius = BASE_CIRCLE_RADIUS * scaleFactor;
    const scaledCircum = 2 * Math.PI * scaledRadius;
    const dashOffset = scaledCircum * (1 - progress);

    switch (visualStyle) {
      case 'circular':
        animationElement = (
          <svg className="timer-ring" viewBox={`0 0 ${96 * scaleFactor} ${96 * scaleFactor}`}>
            <circle
              className="timer-ring-track"
              cx={48 * scaleFactor}
              cy={48 * scaleFactor}
              r={scaledRadius}
              fill="none"
              strokeWidth={5 * scaleFactor}
            />
            <circle
              className="timer-ring-progress"
              cx={48 * scaleFactor}
              cy={48 * scaleFactor}
              r={scaledRadius}
              fill="none"
              strokeWidth={5 * scaleFactor}
              strokeDasharray={scaledCircum}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${48 * scaleFactor} ${48 * scaleFactor})`}
            />
          </svg>
        );
        break;

      case 'bar':
        animationElement = (
          <div className="timer-bar-container">
            <div
              className="timer-bar-progress"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        );
        break;

      case 'color':
        // Change the tile background based on progress (green → red)
        const bgColor = getColorFromProgress(progress);
        tileStyle = { backgroundColor: bgColor };
        break;

      default: // 'none' or any other
        break;
    }
  }

  return (
    <div
      className="timer-tile"
      style={{
        ...tileStyle,
        '--timer-scale': scaleFactor,
      }}
    >
      {/* ---- Visual indicator + time display (wrapped together) ---- */}
      <div className="timer-visual">
        {animationElement}
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