// src/components/tileTypes/CalendarTile/index.js

// ----- Imports -----
import CalendarTile from './CalendarTile';
import CalendarTileEdit from './CalendarTileEdit';

// ----- Main -----
const today = new Date();
export default {
  type: 'calendar',
  displayName: 'Calendar',
  component: CalendarTile,
  editComponent: CalendarTileEdit,
  defaultData: () => ({
    title: 'Calendar',              // hidden in view, but keeps tile data consistent
    year: today.getFullYear(),
    month: today.getMonth(),        // 0-indexed
    backgroundColor: { h: 0, s: 0, l: 100 },
    pinnedDate: null,               // ISO date string or null
  }),
};