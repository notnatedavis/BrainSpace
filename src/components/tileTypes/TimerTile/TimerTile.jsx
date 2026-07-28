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
  const startTimeRef = useRef(null);        // timestamp when the current run started
  const remainingTimeRef = useRef(null);    // remaining time at the start of current countdown run
  const pausedTimeRef = useRef(null);       // stored time at pause (for resume)
  const intervalRef = useRef(null);
  const modeRef = useRef(mode);

  // Keep modeRef in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ----- Core tick function: compute current time from start timestamp -----
  const tick = useCallback(() => {
    if (!startTimeRef.current) {
      // console.warn('[Timer] tick called without startTimeRef'); // debug
      return;
    }

    const currentMode = modeRef.current;
    const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds since start

    let newTime;
    if (currentMode === 'stopwatch') {
      newTime = elapsed;
      // console.debug('[Timer] tick (stopwatch): elapsed =', elapsed); // debug
    } else {
      // countdown: remaining = stored remaining - elapsed
      const remaining = (remainingTimeRef.current ?? 0) - elapsed;
      newTime = Math.max(0, remaining);
      // console.debug( // debug
      //   '[Timer] tick (countdown): remainingRef =',
      //   remainingTimeRef.current,
      //   'elapsed =',
      //   elapsed,
      //   'newTime =',
      //   newTime
      // );
    }

    // Guard against NaN
    if (isNaN(newTime)) {
      // console.warn('[Timer] tick produced NaN, resetting to 0'); // debug
      newTime = 0;
    }

    setTime(newTime);

    // Stop if countdown reaches zero
    if (currentMode === 'countdown' && newTime <= 0) {
      // console.log('[Timer] countdown reached zero, stopping'); // debug
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  // ----- Timer control handlers -----
  const startTimer = useCallback(
    (e) => {
      e.stopPropagation();
      if (isRunning) {
        // console.log('[Timer] start ignored – already running'); // debug
        return;
      }

      // console.log('[Timer] start – mode:', mode, 'current time:', time, 'initialTime:', initialTime); // debug

      // Determine the base time for this run
      let baseTime;
      if (mode === 'stopwatch') {
        // For stopwatch, start from 0 (or the paused time if resuming)
        baseTime = pausedTimeRef.current ?? 0;
        // For stopwatch, we don't need remainingTimeRef; we just use elapsed directly.
        remainingTimeRef.current = null; // unused
      } else {
        // For countdown, start from the stored remaining time (or initial if first start)
        baseTime = pausedTimeRef.current ?? initialTime;
        // Ensure we don't start from zero
        if (baseTime <= 0) {
          // console.log('[Timer] countdown baseTime <= 0, resetting to initialTime'); // debug
          baseTime = initialTime;
          pausedTimeRef.current = initialTime;
        }
        remainingTimeRef.current = baseTime;
      }

      // Set the start timestamp so that elapsed = (now - startTimeRef) / 1000
      startTimeRef.current = Date.now();
      // console.log( // debug
      //   '[Timer] start – baseTime:',
      //   baseTime,
      //   'startTimeRef:',
      //   startTimeRef.current,
      //   'remainingTimeRef:',
      //   remainingTimeRef.current
      // );

      setIsRunning(true);
    },
    [isRunning, mode, time, initialTime]
  );

  const pauseTimer = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isRunning) {
        // console.log('[Timer] pause ignored – not running'); // debug
        return;
      }

      // console.log('[Timer] pause – current time:', time); // debug
      // Store the current time for later resume
      pausedTimeRef.current = time;
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    [isRunning, time]
  );

  const resetTimer = useCallback(
    (e) => {
      e.stopPropagation();
      // console.log('[Timer] reset – mode:', mode, 'initialTime:', initialTime); // debug
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const resetValue = mode === 'stopwatch' ? 0 : initialTime;
      setTime(resetValue);
      pausedTimeRef.current = resetValue; // store so that next start uses this
      remainingTimeRef.current = mode === 'countdown' ? resetValue : null;
      startTimeRef.current = null;
      // console.log('[Timer] reset – set time to:', resetValue); // debug
    },
    [mode, initialTime]
  );

  // ----- Set up interval when running -----
  useEffect(() => {
    if (isRunning) {
      // Tick immediately to avoid a 100ms delay on start
      tick();
      intervalRef.current = setInterval(tick, 100); // update every 100ms for smoothness
      // console.log('[Timer] interval started'); // debug
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // console.log('[Timer] interval cleared'); // debug
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
  const progress = isCountdown && initialTime > 0 ? Math.min(1, time / initialTime) : 0;

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