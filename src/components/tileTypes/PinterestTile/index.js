//   src/components/tileTypes/PinterestTile/index.js

// ----- Imports -----
import PinterestTile from './PinterestTile';
import PinterestTileEdit from './PinterestTileEdit';

// ----- Main -----
export default {
  type: 'pinterest',
  displayName: 'Pinterest',
  component: PinterestTile,
  editComponent: PinterestTileEdit,
  defaultData: () => ({
    title: 'Pinterest Tile',
    mode: 'board',          // 'board' or 'pin'
    boardUrl: '',           // board shuffle
    boardTitle: '',
    pinImageUrl: '',        // board mode auto‑refreshed image
    autoRefreshInterval: 0,
    pinUrl: '',             // static pin
    imageUrl: '',           // static pin resolved image
    lastUpdated: null,
  }),
};