// src/components/tileTypes/BoardTile/index.js

// ----- Imports -----
import BoardTile from './BoardTile';
import BoardTileEdit from './BoardTileEdit';

// ----- Main -----
export default {
  type: 'board',
  displayName: 'Pinterest Board',
  component: BoardTile,
  editComponent: BoardTileEdit,
  defaultData: () => ({
    title: 'Pinterest Board',
    boardUrl: '',
    boardTitle: '',
    pinImageUrl: '',
    lastUpdated: null,
    autoRefreshInterval: 0,
  }),
};