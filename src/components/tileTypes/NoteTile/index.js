//   src/components/tiletypes/NoteTile/index.js

// ----- Imports -----
import NoteTile from './NoteTile';
import NoteTileEdit from './NoteTileEdit';

// ----- Main -----
export default {
  type: 'note',
  displayName: 'Note',
  component: NoteTile,
  editComponent: NoteTileEdit,
  defaultData: () => ({
    title: 'New Note',
    content: 'Click to edit',
  }),
};