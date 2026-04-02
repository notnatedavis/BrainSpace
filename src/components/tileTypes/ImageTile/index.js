//   src/components/tileTypes/ImageTile/index.js

// ----- Imports -----
import ImageTile from './ImageTile';
import ImageTileEdit from './ImageTileEdit';

// ----- Main -----
export default {
  type: 'image',
  displayName: 'Image',
  component: ImageTile,
  editComponent: ImageTileEdit,
  defaultData: () => ({
    title: 'New Image',
    content: '', 
    alt: 'Image description',
  }),
};