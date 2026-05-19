//   src/components/tileTypes/index.js

// ----- Imports -----
import InfoTileDef from './InfoTile';
import NoteTileDef from './NoteTile';
import ImageTileDef from './ImageTile';
import TimerTileDef from './TimerTile';
import BoardTileDef from './BoardTile';

// ----- Main -----
const tileTypes = {
  info: InfoTileDef,
  note: NoteTileDef,
  image: ImageTileDef,
  timer: TimerTileDef,
  board: BoardTileDef,
};

export default tileTypes;