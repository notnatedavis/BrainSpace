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
    boardUrl: '',           // board shuffle source
    boardTitle: '',
    pinUrl: '',             // board mode -> currently selected pin URL
                            // pin   mode -> static pin URL
    pinImageUrl: '',        // board mode -> validated source image URL
    autoRefreshInterval: 0,
    imageUrl: '',           // pin mode -> resolved source image URL
    lastUpdated: null,
  }),
};