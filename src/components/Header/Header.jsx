//   src/components/Header/Header.jsx

// ----- Imports -----
import React, { useContext, useState, useRef, useEffect } from 'react';
import { TilesContext } from '../../context/TilesContext';
import tileTypes from '../tileTypes'; // for display names
import { hslToString } from '../../utils/colorUtils';
import './Header.css';

// ----- Main -----
const Header = () => {
  const { addTile, accentColor } = useContext(TilesContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type) => {
    addTile(type);
    setIsDropdownOpen(false);
  };

  // get tileType entries for dropdown
  const tileTypeEntries = Object.entries(tileTypes).map(([key, def]) => ({
    type: key,
    displayName: def.displayName,
  }));

  // Convert the dynamic accent colour to CSS string
  const accentColorStr = hslToString(accentColor);

  return (
    <header className="header">
      <h1>
        <span className="title-brain">Brain</span>
        <span className="title-space" style={{ color: accentColorStr }}>
          Space
        </span>
      </h1>
      <div className="dropdown-container">
        <button
          ref={buttonRef}
          className="green-button"
          onClick={() => setIsDropdownOpen(prev => !prev)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          + Add Tile
        </button>
        {isDropdownOpen && (
          <div ref={dropdownRef} className="dropdown-menu" role="menu">
            {tileTypeEntries.map(({ type, displayName }) => (
              <button
                key={type}
                className="dropdown-item"
                onClick={() => handleSelect(type)}
                role="menuitem"
              >
                {displayName}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;