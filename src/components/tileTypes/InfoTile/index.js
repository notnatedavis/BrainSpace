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
    title: 'Welcome to BrainSpace!',
    content: `# How to Use

- Click the **+ Add Tile** button in the header to add new tiles.
- Hover over a tile to reveal the **remove** (✕) and **drag** (⣿) buttons.
- Drag tiles to rearrange them.
- Click on the content of any tile to edit its properties.

Enjoy your workspace!`,
  }),
};