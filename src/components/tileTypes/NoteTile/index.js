//   src/components/tileTypes/NoteTile/index.js

// ----- Imports -----
import NoteTile from './NoteTile';
import NoteTileEdit from './NoteTileEdit'; // kept for reference, not used in modal

// ----- Main -----
export default {
  type: 'note',
  displayName: 'Note',
  component: NoteTile,
  editComponent: null, // note tiles edited inline, modal not used
  defaultData: () => ({
    title: 'New Note', // hidden in UI
    content: 'edit this note !',
    noteStyle: {
      backgroundColor: '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 'medium',
      fontFamily: 'sans',
      headerLevel: 0,
      bgHue: 60,       // default background hue (light yellow)
    },
  }),
};