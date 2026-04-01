//   src/components/tileTypes/NoteTile/index.js

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
    noteStyle: {
      backgroundColor: '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 'medium',
      fontFamily: 'sans',
      headerLevel: 0,
    },
  }),
};