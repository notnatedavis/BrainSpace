//   src/components/Sidebar/Sidebar.jsx

// ----- Imports -----
import React, { useContext } from 'react';
import { TilesContext } from '../../context/TilesContext';
import HSLColorPicker from '../common/HSLColorPicker';
import ProfilesDropdown from './ProfilesDropdown';
import './Sidebar.css';

// ----- Main -----
const Sidebar = () => {
  const {
    gridSize, resizeGrid,
    bgColor, setBgColor,
    accentColor, setAccentColor,
  } = useContext(TilesContext);

  const handleGridSliderChange = (e) => {
    resizeGrid(parseInt(e.target.value, 10));
  };

  return (
    <aside className="sidebar">
      <ul>
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
        <li>Menu Item 3</li>
      </ul>

      {/* ---- Profiles dropdown ---- */}
      <div className="sidebar-section">
        <ProfilesDropdown />
      </div>

      {/* ---- Grid size slider ---- */}
      <div className="sidebar-slider">
        <label htmlFor="grid-slider">Grid: {gridSize}×{gridSize}</label>
        <input
          type="range"
          id="grid-slider"
          min="3"
          max="6"
          step="1"
          value={gridSize}
          onChange={handleGridSliderChange}
        />
      </div>

      {/* ---- Background colour picker ---- */}
      <div className="sidebar-slider">
        <HSLColorPicker
          label="Background"
          hsl={bgColor}
          onChange={setBgColor}
        />
      </div>

      {/* ---- Accent colour picker ---- */}
      <div className="sidebar-slider">
        <HSLColorPicker
          label="Secondary"
          hsl={accentColor}
          onChange={setAccentColor}
        />
      </div>
    </aside>
  );
};

export default Sidebar;