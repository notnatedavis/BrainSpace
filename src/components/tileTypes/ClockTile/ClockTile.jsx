// src/components/tileTypes/ClockTile/ClockTile.jsx
// Displays current time as either a flip-style digital clock or an analog clock.

// ----- Imports -----
import React, { useState, useEffect, useRef, useContext } from 'react';
import { TilesContext } from '../../../context/TilesContext';
import { hslToString } from '../../../utils/colorUtils';

// ----- Helper: format time as HH:MM:SS (24-hour) or H:MM:SS (12-hour, no AM/PM) -----
const formatTime = (date, hourFormat) => {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  if (hourFormat === '12h') {
    // Convert to 12-hour format, 0 -> 12, no AM/PM suffix
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds}`;
  }

  // 24-hour format (default)
  hours = hours.toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// ----- Helper: draw analog clock on canvas with hour numbers -----
const drawAnalogClock = (canvas, time, accentColorStr) => {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const center = size / 2;
  const radius = size * 0.4;

  ctx.clearRect(0, 0, size, size);

  // Outer circle – dynamic accent colour, thinner stroke
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = accentColorStr;
  ctx.lineWidth = size * 0.008;
  ctx.stroke();

  // Hour numbers 1-12
  ctx.font = `bold ${size * 0.08}px system-ui, sans-serif`;
  ctx.fillStyle = 'var(--color-text)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const numberRadius = radius * 0.75;
    const x = center + numberRadius * Math.cos(angle);
    const y = center + numberRadius * Math.sin(angle);
    ctx.fillText(i.toString(), x, y);
  }

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = (hours * 30 + minutes * 0.5 - 90) * Math.PI / 180;
  const minuteAngle = (minutes * 6 - 90) * Math.PI / 180;
  const secondAngle = (seconds * 6 - 90) * Math.PI / 180;

  // Hour hand
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + radius * 0.5 * Math.cos(hourAngle), center + radius * 0.5 * Math.sin(hourAngle));
  ctx.strokeStyle = accentColorStr;
  ctx.lineWidth = size * 0.035;
  ctx.stroke();

  // Minute hand
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + radius * 0.7 * Math.cos(minuteAngle), center + radius * 0.7 * Math.sin(minuteAngle));
  ctx.strokeStyle = accentColorStr;
  ctx.lineWidth = size * 0.025;
  ctx.stroke();

  // Second hand
  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + radius * 0.8 * Math.cos(secondAngle), center + radius * 0.8 * Math.sin(secondAngle));
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = size * 0.01;
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(center, center, size * 0.03, 0, 2 * Math.PI);
  ctx.fillStyle = accentColorStr;
  ctx.fill();
};

// ----- Main -----
const ClockTile = ({ tile }) => {
  const { accentColor } = useContext(TilesContext);
  const {
    displayMode = 'flip',
    bold = false,
    italic = false,
    fontFamily = 'monospace',
    hourFormat = '24h', // '12h' or '24h'
  } = tile;

  const [currentTime, setCurrentTime] = useState(new Date());
  const canvasRef = useRef(null);

  const accentColorStr = hslToString(accentColor);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Analog clock drawing
  useEffect(() => {
    if (displayMode === 'analog' && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
      drawAnalogClock(canvas, currentTime, accentColorStr);
    }
  }, [displayMode, currentTime, accentColorStr, tile.size]);

  // Resize observer for analog clock
  useEffect(() => {
    if (displayMode === 'analog') {
      const handleResize = () => {
        if (canvasRef.current) {
          const container = canvasRef.current.parentElement;
          const size = Math.min(container.clientWidth, container.clientHeight);
          canvasRef.current.width = size;
          canvasRef.current.height = size;
          drawAnalogClock(canvasRef.current, currentTime, accentColorStr);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [displayMode, currentTime, accentColorStr]);

  const getFontFamily = () => {
    switch (fontFamily) {
      case 'sans': return 'system-ui, -apple-system, sans-serif';
      case 'serif': return 'Georgia, Times, serif';
      default: return "'Courier New', monospace";
    }
  };

  if (displayMode === 'flip') {
    const timeStr = formatTime(currentTime, hourFormat);
    // Font size scales with tile span (size) and overall grid scaling.
    const fontSize = `calc(2.6rem * ${tile.size || 1} * var(--tile-scale, 1))`;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          fontSize,
          fontWeight: bold ? 'bold' : 'normal',
          fontStyle: italic ? 'italic' : 'normal',
          color: accentColorStr,
          fontFamily: getFontFamily(),
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {timeStr}
      </div>
    );
  }

  return (
    <div className="clock-analog-container">
      <canvas ref={canvasRef} className="clock-analog-canvas" />
    </div>
  );
};

export default ClockTile;