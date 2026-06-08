// src/components/tileTypes/NoteTile/index.js

import NoteTile from './NoteTile';
import NoteTileEdit from './NoteTileEdit';

export default {
  type: 'note',
  displayName: 'Note',
  component: NoteTile,
  editComponent: NoteTileEdit,
  defaultData: () => ({
    title: 'New Note',
    content: 'edit this note !',
    noteStyle: {
      backgroundColor: '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      fontSize: 'medium',
      fontFamily: 'sans',
      headerLevel: 0,
      bgHue: 60,
    },
  }),
};