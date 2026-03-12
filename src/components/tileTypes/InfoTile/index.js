//   src/components/tileTypes/InfoTile/index.js

// ----- Imports -----
import InfoTile from './InfoTile';
import InfoTileEdit from './InfoTileEdit';

// ----- Main -----
export default {
  type: 'info',
  displayName: 'Info',
  component: InfoTile,
  editComponent: InfoTileEdit,
  defaultData: () => ({
    title: 'New Info',
    content: 'Some information',
  }),
};