//   src/components/tileTypes/TimerTile/TimerTile.jsx
//   Displays a stopwatch or countdown timer with optional visual animations.
//   Animations are only available for countdown mode.
//   All visual elements scale with the tile size (tile.size).
//   Uses time‑based calculation to remain accurate even when tab is inactive.
//   When a countdown reaches zero, it plays a single beep and continues
//   counting upward, displayed as negative time (overrun).

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

// ----- Helper: play a short beep using Web Audio API -----
const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.2);
  } catch (e) {
    // Silently fail – audio not critical
    console.warn('Could not play beep:', e);
  }
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
  const [overrun, setOverrun] = useState(false); // true when countdown has passed zero

  // ----- Refs for time‑based calculations -----
  const startTimeRef = useRef(null);        // timestamp when the current run started
  const remainingTimeRef = useRef(null);    // remaining time at the start of current countdown run
  const pausedTimeRef = useRef(null);       // stored time at pause (for resume)
  const intervalRef = useRef(null);
  const modeRef = useRef(mode);
  const overrunTriggeredRef = useRef(false); // ensure beep & transition happen only once

  // Keep modeRef in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Reset overrun trigger when tile props change (e.g., new initialTime)
  useEffect(() => {
    overrunTriggeredRef.current = false;
    setOverrun(false);
  }, [initialTime]);

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
      // console.debug('[Timer] tick (stopwatch): elapsed =', elapsed);
    } else {
      // countdown mode
      if (overrun) {
        // Already past zero – simply count elapsed time
        newTime = elapsed; // elapsed is seconds since startTimeRef was set to the moment we crossed zero
        // console.debug('[Timer] tick (overrun): elapsed =', elapsed);
      } else {
        // Normal countdown: remaining = stored remaining - elapsed
        const remaining = (remainingTimeRef.current ?? 0) - elapsed;
        newTime = Math.max(0, remaining);
        // console.debug('[Timer] tick (countdown): remainingRef =', remainingTimeRef.current, 'elapsed =', elapsed, 'newTime =', newTime);
      }
    }

    // Guard against NaN
    if (isNaN(newTime)) {
      // console.warn('[Timer] tick produced NaN, resetting to 0');
      newTime = 0;
    }

    // ----- Transition to overrun when countdown reaches zero -----
    if (!overrun && currentMode === 'countdown' && newTime <= 0) {
      // Only trigger once per countdown
      if (!overrunTriggeredRef.current) {
        overrunTriggeredRef.current = true;
        // Play a single beep
        playBeep();
        // Enter overrun state: start counting upward from zero
        setOverrun(true);
        // Reset startTimeRef to now, so elapsed = 0 at this moment
        startTimeRef.current = Date.now();
        // pausedTimeRef for overrun starts at 0
        pausedTimeRef.current = 0;
        // Keep timer running
        setIsRunning(true);
        // Set time to 0 (display will show "-00:00:00" briefly)
        setTime(0);
        // console.log('[Timer] Entered overrun mode');
        return; // exit early – the next tick will handle the elapsed time
      }
    }

    // For normal countdown (including first tick that hits zero, we skip due to early return)
    // For stopwatch or overrun, update time normally.
    setTime(newTime);

    // Stop if countdown reaches zero and we are NOT in overrun (should not happen because we transition)
    // but keep as safety: if countdown reaches zero and overrun is false (should be caught above)
    if (currentMode === 'countdown' && newTime <= 0 && !overrun) {
      // This should not occur because we set overrun above; but just in case
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [overrun]);

  // ----- Timer control handlers -----
  const startTimer = useCallback(
    (e) => {
      e.stopPropagation();
      if (isRunning) {
        // console.log('[Timer] start ignored – already running');
        return;
      }

      // console.log('[Timer] start – mode:', mode, 'current time:', time, 'initialTime:', initialTime, 'overrun:', overrun);

      // Determine the base time for this run
      let baseTime;
      if (mode === 'stopwatch') {
        // For stopwatch, start from 0 (or the paused time if resuming)
        baseTime = pausedTimeRef.current ?? 0;
        remainingTimeRef.current = null; // unused
      } else {
        // countdown
        if (overrun) {
          // Resuming overrun: continue from the elapsed time we paused at
          baseTime = pausedTimeRef.current ?? 0;
          // We don't use remainingTimeRef for overrun
        } else {
          // Normal countdown: start from stored remaining time (or initial if first start)
          baseTime = pausedTimeRef.current ?? initialTime;
          if (baseTime <= 0) {
            // If we somehow try to start from zero or negative, reset to initial
            baseTime = initialTime;
            pausedTimeRef.current = initialTime;
          }
          remainingTimeRef.current = baseTime;
        }
      }

      // Set the start timestamp so that elapsed = (now - startTimeRef) / 1000
      if (overrun) {
        // For overrun, we want elapsed = baseTime at start, so startTimeRef = now - baseTime*1000
        startTimeRef.current = Date.now() - baseTime * 1000;
      } else {
        // For normal countdown/stopwatch, startTimeRef = now
        startTimeRef.current = Date.now();
      }

      // console.log('[Timer] start – baseTime:', baseTime, 'startTimeRef:', startTimeRef.current);
      setIsRunning(true);
    },
    [isRunning, mode, time, initialTime, overrun]
  );

  const pauseTimer = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isRunning) {
        // console.log('[Timer] pause ignored – not running');
        return;
      }

      // Store the current time for later resume
      pausedTimeRef.current = time;
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // console.log('[Timer] pause – stored time:', pausedTimeRef.current);
    },
    [isRunning, time]
  );

  const resetTimer = useCallback(
    (e) => {
      e.stopPropagation();
      // console.log('[Timer] reset – mode:', mode, 'initialTime:', initialTime);
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Reset overrun state
      setOverrun(false);
      overrunTriggeredRef.current = false;

      const resetValue = mode === 'stopwatch' ? 0 : initialTime;
      setTime(resetValue);
      pausedTimeRef.current = resetValue;
      remainingTimeRef.current = mode === 'countdown' ? resetValue : null;
      startTimeRef.current = null;
      // console.log('[Timer] reset – set time to:', resetValue);
    },
    [mode, initialTime]
  );

  // ----- Set up interval when running -----
  useEffect(() => {
    if (isRunning) {
      // Tick immediately to avoid a 100ms delay on start
      tick();
      intervalRef.current = setInterval(tick, 100); // update every 100ms for smoothness
      // console.log('[Timer] interval started');
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      // console.log('[Timer] interval cleared');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // ----- Estimated finish time (countdown only, hidden during overrun) -----
  const finishTime = useMemo(() => {
    if (mode !== 'countdown' || overrun || time <= 0) return null;
    const finishDate = new Date(Date.now() + time * 1000);
    return finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [mode, time, overrun]);

  // ----- Animation data (only for countdown) -----
  const isCountdown = mode === 'countdown';
  // Clamp progress to 1 for overrun (full ring/bar)
  const progress = isCountdown && initialTime > 0
    ? (overrun ? 1 : Math.min(1, time / initialTime))
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

  // ----- Display time (negative sign if overrun) -----
  const displayTime = overrun ? `-${formatTime(time)}` : formatTime(time);
  // Overrun colour: red
  const displayColor = overrun ? '#ef4444' : 'var(--color-text)';

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
        <div className="timer-display" style={{ color: displayColor }}>
          {displayTime}
        </div>
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