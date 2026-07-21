// src/components/tileTypes/index.js

// ----- Imports -----
import InfoTileDef from './InfoTile';
import NoteTileDef from './NoteTile';
import ImageTileDef from './ImageTile';
import TimerTileDef from './TimerTile';
import YoutubeTileDef from './YoutubeTile';
import CalendarTileDef from './CalendarTile';
import ClockTileDef from './ClockTile';
import PinterestTileDef from './PinterestTile';

// ----- Main -----
const tileTypes = {
  info: InfoTileDef,
  note: NoteTileDef,
  image: ImageTileDef,
  timer: TimerTileDef,
  youtube: YoutubeTileDef,
  calendar: CalendarTileDef,
  clock: ClockTileDef,
  pinterest: PinterestTileDef,
};

export default tileTypes;