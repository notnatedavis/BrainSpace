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
    title: 'Calendar',
    year: today.getFullYear(),
    month: today.getMonth(),
    backgroundColor: { h: 0, s: 0, l: 100 },
    pinnedDate: null,
    scale: 1,
  }),
};