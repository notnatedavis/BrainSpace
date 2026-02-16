//   src/components/Header/Header.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import TilesContext from '../../context/TilesContext';
import './Header.css';

// ----- Main -----
const Header = () => {
  const { addTile } = useContext(TilesContext);

  return (
    <header className="header">
      <h1>BrainSpace</h1>
      <button className="green-button" onClick={addTile}>
        + Add Tile
      </button>
    </header>
  );
};

export default Header;