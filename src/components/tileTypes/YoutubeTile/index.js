// src/components/tileTypes/YoutubeTile/index.js

// ----- Imports -----
import YoutubeTile from './YoutubeTile';
import YoutubeTileEdit from './YoutubeTileEdit';

// ----- Main -----
export default {
  type: 'youtube',
  displayName: 'YouTube',
  component: YoutubeTile,
  editComponent: YoutubeTileEdit,
  defaultData: () => ({
    url: '',
  }),
};