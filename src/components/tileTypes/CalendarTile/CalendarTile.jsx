//   src/components/tileTypes/CalendarTile/CalendarTile.jsx

// ----- Imports -----
import React, { useContext, useState } from 'react';
import { TilesContext } from '../../../context/TilesContext';
import { hslToString } from '../../../utils/colorUtils';
import './CalendarTile.css';

// ----- Helpers -----
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Build a stable ISO date string (YYYY-MM-DD). Using a plain string key
 * avoids timezone drift when comparing "same day" across months/years.
 */
const toISODate = (year, month, day) => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

// ----- Main -----
const CalendarTile = ({ tile }) => {
  const { updateTile, accentColor } = useContext(TilesContext);

  // View state – ALWAYS initialised to the user's current date on mount.
  // Intentionally NOT synced with (or persisted from) tile.year / tile.month,
  // so every mount of this tile opens on the current month. Arrow navigation
  // mutates only this local state for the duration of the session.
  const [viewYear, setViewYear]   = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const scale  = typeof tile.scale === 'number' ? tile.scale : 0.78; // per‑tile zoom
  const events = Array.isArray(tile.events) ? tile.events : [];

  // Compute calendar grid data from the current VIEW month
  const firstDay     = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Today check – only highlight when the VIEWED month IS the current month
  const currentDate = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === viewYear && currentDate.getMonth() === viewMonth;
  const todayDate = currentDate.getDate();

  // Colours
  const bgColorStr     = hslToString(tile.backgroundColor);
  const accentColorStr = hslToString(accentColor);

  // Month navigation (shared by arrow buttons and keyboard)
  const navigateMonth = (delta) => {
    let newMonth = viewMonth + delta;
    let newYear  = viewYear;
    if (newMonth < 0)  { newMonth = 11; newYear -= 1; }
    if (newMonth > 11) { newMonth = 0;  newYear += 1; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const goToPreviousMonth = (e) => {
    e.stopPropagation();
    navigateMonth(-1);
  };

  const goToNextMonth = (e) => {
    e.stopPropagation();
    navigateMonth(1);
  };

  // Keyboard: ← / → traverse months when the calendar has focus.
  // The wrapper is tabIndex=0 so it receives focus on click.
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      navigateMonth(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      navigateMonth(1);
    }
  };

  // Clicking a day toggles an event on that date. stopPropagation prevents
  // the tile's own edit-modal click handler from firing.
  const handleDayClick = (e, day) => {
    e.stopPropagation();
    if (!day) return;
    const dateStr = toISODate(viewYear, viewMonth, day);
    const nextEvents = events.includes(dateStr)
      ? events.filter((d) => d !== dateStr)
      : [...events, dateStr];
    updateTile(tile.id, { events: nextEvents });
  };

  // Apply scale via CSS variable
  const wrapperStyle = {
    backgroundColor: bgColorStr,
    '--calendar-scale': scale,
  };

  return (
    <div
      className="calendar-tile-wrapper"
      style={wrapperStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Calendar – click a date to toggle an event, use arrow keys to change month"
    >
      {/* Navigation row */}
      <div className="calendar-nav">
        <button
          className="calendar-nav-btn"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          style={{ backgroundColor: accentColorStr }}
        >
          &lt;
        </button>
        <span className="calendar-month-label">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          className="calendar-nav-btn"
          onClick={goToNextMonth}
          aria-label="Next month"
          style={{ backgroundColor: accentColorStr }}
        >
          &gt;
        </button>
      </div>

      {/* Weekday headers – duplicate keys fixed with index */}
      <div className="calendar-weekdays">
        {DAY_NAMES.map((name, idx) => (
          <div key={`${name}-${idx}`} className="calendar-weekday">
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="calendar-grid">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-day empty" />;
          }

          const isToday  = isCurrentMonth && day === todayDate;
          const dateStr  = toISODate(viewYear, viewMonth, day);
          const hasEvent = events.includes(dateStr);

          const dayStyle = {};
          if (isToday) {
            dayStyle.backgroundColor = accentColorStr;
            dayStyle.color = '#ffffff';
            dayStyle.fontWeight = '700';
          }

          return (
            <div
              key={`day-${day}`}
              className={
                'calendar-day' +
                (isToday ? ' today' : '') +
                (hasEvent ? ' has-event' : '')
              }
              style={dayStyle}
              onClick={(e) => handleDayClick(e, day)}
              title={hasEvent ? 'Click to remove event' : 'Click to add event'}
            >
              <span>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarTile;