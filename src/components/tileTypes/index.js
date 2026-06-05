// src/components/tileTypes/index.js

// ----- Imports -----
import InfoTileDef from './InfoTile';
import NoteTileDef from './NoteTile';
import ImageTileDef from './ImageTile';
import TimerTileDef from './TimerTile';
import BoardTileDef from './BoardTile';
import YoutubeTileDef from './YoutubeTile';

// ----- Main -----
const tileTypes = {
  info: InfoTileDef,
  note: NoteTileDef,
  image: ImageTileDef,
  timer: TimerTileDef,
  board: BoardTileDef,
  youtube: YoutubeTileDef,
};

export default tileTypes;