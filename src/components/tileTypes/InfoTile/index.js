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
    title: 'Welcome to BrainSpace !',
    content: `Click around and explore the workspace`,
  }),
};