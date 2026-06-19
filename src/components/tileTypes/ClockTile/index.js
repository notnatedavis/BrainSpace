// src/components/tileTypes/ClockTile/index.js

// ----- Imports -----
import ClockTile from './ClockTile';
import ClockTileEdit from './ClockTileEdit';
import './ClockTile.css';

// ----- Main -----
export default {
  type: 'clock',
  displayName: 'Clock',
  component: ClockTile,
  editComponent: ClockTileEdit,
  defaultData: () => ({
    displayMode: 'flip',
    bold: false,
    italic: false,
    fontFamily: 'monospace',
    hourFormat: '24h',
    showDate: false,
  }),
};