// src/components/tileTypes/InfoTile/index.js
// InfoTile definition – read‑only, no edit modal.

// ----- Imports -----
import InfoTile from './InfoTile';

// ----- Main -----
export default {
  type: 'info',
  displayName: 'Info',
  component: InfoTile,
  editComponent: null,       // no edit modal – content is hardcoded
  defaultData: () => ({
    title: '',
    content: '',
  }),
};