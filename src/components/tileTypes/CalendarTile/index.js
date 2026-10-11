// src/components/tileTypes/CalendarTile/index.js

// ----- Imports -----
import CalendarTile from './CalendarTile';
import CalendarTileEdit from './CalendarTileEdit';

// ----- Main -----
export default {
  type: 'calendar',
  displayName: 'Calendar',
  component: CalendarTile,
  editComponent: CalendarTileEdit,
  defaultData: () => ({
    title: 'Calendar',
    backgroundColor: { h: 0, s: 0, l: 100 },
    events: [],   // array of ISO date strings (YYYY-MM-DD)
    scale: 0.78,  // default zoom level for new calendars
  }),
};