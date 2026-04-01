//   src/components/tiletypes/TimerTile/index.js

// ----- Imports -----
import TimerTile from './TimerTile';
import TimerTileEdit from './TimerTileEdit';

// ----- Main -----
export default {
  type: 'timer',
  displayName: 'Timer',
  component: TimerTile,
  editComponent: TimerTileEdit,
  defaultData: () => ({
    title: 'New Timer',
    mode: 'stopwatch',   // 'stopwatch' or 'countdown'
    initialTime: 60,     // seconds for countdown
  }),
};