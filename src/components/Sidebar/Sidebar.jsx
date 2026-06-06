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
    gridRows,
    gridCols,
    resizeGrid,
    bgColor,
    setBgColor,
    accentColor,
    setAccentColor,
  } = useContext(TilesContext);

  const handleRowsChange = (e) => {
    resizeGrid(parseInt(e.target.value, 10), gridCols);
  };
  
  const handleColsChange = (e) => {
    resizeGrid(gridRows, parseInt(e.target.value, 10));
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
      {/* Row slider */}
      <div className="sidebar-slider">
        <label htmlFor="rows-slider">Rows: {gridRows}</label>
        <input
          type="range"
          id="rows-slider"
          min="3"
          max="6"
          step="1"
          value={gridRows}
          onChange={handleRowsChange}
        />
      </div>

      {/* Column slider */}
      <div className="sidebar-slider">
        <label htmlFor="cols-slider">Cols: {gridCols}</label>
        <input
          type="range"
          id="cols-slider"
          min="3"
          max="6"
          step="1"
          value={gridCols}
          onChange={handleColsChange}
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