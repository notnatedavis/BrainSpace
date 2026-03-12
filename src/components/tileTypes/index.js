//   src/components/tileTypes/index.js

// ----- Imports -----
import InfoTileDef from './InfoTile';
import NoteTileDef from './NoteTile';
import ImageTileDef from './ImageTile';

// ----- Main -----
const tileTypes = {
  info: InfoTileDef,
  note: NoteTileDef,
  image: ImageTileDef,
};

export default tileTypes;