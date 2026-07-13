//   src/components/tileTypes/TimerTile/TimerTile.jsx
//   Displays a stopwatch or countdown timer with optional visual animations.
//   Animations are only available for countdown mode.
//   All visual elements scale with the tile size (tile.size).
//   Uses time‑based calculation to remain accurate even when tab is inactive.

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
  const scaleFactor = 1 + (size - 1) * 0.5;

  // ----- State -----
  const [time, setTime] = useState(mode === 'stopwatch' ? 0 : initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // ----- Refs for time‑based calculations -----
  const startTimeRef = useRef(null);      // timestamp when timer started (or resumed)
  const pausedTimeRef = useRef(null);    // stored time (seconds) at pause
  const intervalRef = useRef(null);
  const modeRef = useRef(mode);

  // Keep modeRef in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ----- Core tick function: compute current time from start timestamp -----
  const tick = useCallback(() => {
    if (!startTimeRef.current) return;

    const currentMode = modeRef.current;
    const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds

    let newTime;
    if (currentMode === 'stopwatch') {
      newTime = elapsed;
    } else {
      // countdown: remaining = stored initial - elapsed
      const remaining = pausedTimeRef.current - elapsed;
      newTime = Math.max(0, remaining);
    }

    setTime(newTime);

    // Stop if countdown reaches zero
    if (currentMode === 'countdown' && newTime <= 0) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ----- Timer control handlers -----
  const startTimer = useCallback((e) => {
    e.stopPropagation();
    if (isRunning) return;

    // If countdown already at zero, reset to initial time
    if (mode === 'countdown' && time === 0) {
      pausedTimeRef.current = initialTime;
      setTime(initialTime);
    }

    // Set start time based on the current stored time
    // For stopwatch, pausedTimeRef holds elapsed seconds; for countdown, remaining seconds.
    const currentTime = mode === 'stopwatch' ? time : pausedTimeRef.current ?? initialTime;
    startTimeRef.current = Date.now() - currentTime * 1000;

    setIsRunning(true);
  }, [isRunning, mode, time, initialTime]);

  const pauseTimer = useCallback((e) => {
    e.stopPropagation();
    if (!isRunning) return;

    // Store the current time (elapsed or remaining) at pause
    pausedTimeRef.current = time;
    setIsRunning(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, [isRunning, time]);

  const resetTimer = useCallback((e) => {
    e.stopPropagation();
    setIsRunning(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;

    const resetValue = mode === 'stopwatch' ? 0 : initialTime;
    setTime(resetValue);
    pausedTimeRef.current = resetValue;
    startTimeRef.current = null;
  }, [mode, initialTime]);

  // ----- Set up interval when running -----
  useEffect(() => {
    if (isRunning) {
      // Tick immediately to avoid a 100ms delay on start
      tick();
      intervalRef.current = setInterval(tick, 100); // update every 100ms for smoothness
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
  }, [isRunning, tick]);

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