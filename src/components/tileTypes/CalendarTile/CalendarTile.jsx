//   src/components/tileTypes/CalendarTile/CalendarTile.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import { TilesContext } from '../../../context/TilesContext';
import { hslToString } from '../../../utils/colorUtils';
import './CalendarTile.css';

// ----- Helpers -----
const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ----- Main -----
const CalendarTile = ({ tile }) => {
  const { updateTile, accentColor } = useContext(TilesContext);

  // Safely extract year/month, defaulting to today if missing
  const today = new Date();
  const year = typeof tile.year === 'number' ? tile.year : today.getFullYear();
  const month = typeof tile.month === 'number' ? tile.month : today.getMonth();
  const scale = typeof tile.scale === 'number' ? tile.scale : 1; // per‑tile zoom

  // Compute calendar grid data
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  // Today check
  const currentDate = new Date();
  const isCurrentMonth =
    currentDate.getFullYear() === year && currentDate.getMonth() === month;
  const todayDate = currentDate.getDate();

  // Pinned date (if any)
  let pinnedDay = null;
  if (tile.pinnedDate) {
    try {
      const pinned = new Date(tile.pinnedDate);
      if (
        !isNaN(pinned) &&
        pinned.getFullYear() === year &&
        pinned.getMonth() === month
      ) {
        pinnedDay = pinned.getDate();
      }
    } catch { /* ignore */ }
  }

  // Colours
  const bgColorStr = hslToString(tile.backgroundColor);
  const accentColorStr = hslToString(accentColor);

  // Navigation handlers
  const goToPreviousMonth = (e) => {
    e.stopPropagation();
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    updateTile(tile.id, { month: newMonth, year: newYear });
  };

  const goToNextMonth = (e) => {
    e.stopPropagation();
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    updateTile(tile.id, { month: newMonth, year: newYear });
  };

  const handleCalendarClick = (e) => {
    e.stopPropagation();
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
      onClick={handleCalendarClick}
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
          {MONTH_NAMES[month]} {year}
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

      {/* Weekday headers – fix duplicate keys by adding index */}
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
          const isToday = isCurrentMonth && day === todayDate;
          const isPinned = day === pinnedDay;
          const dayStyle = {};
          if (isToday) {
            dayStyle.backgroundColor = accentColorStr;
            dayStyle.color = '#ffffff';
            dayStyle.fontWeight = '700';
          }
          return (
            <div
              key={`day-${day}`}
              className={`calendar-day${isToday ? ' today' : ''}${isPinned ? ' pinned' : ''}`}
              style={dayStyle}
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