//   src/components/Sidebar/Sidebar.jsx

// ----- Imports -----
import React from 'react';
import ColorSlider from './ColorSlider';
import ProfilesDropdown from './ProfilesDropdown';
import './Sidebar.css';

// ----- Main -----
const Sidebar = ({ gridSize, setGridSize, bgHue, setBgHue, accentHue, setAccentHue }) => {
  const handleSliderChange = (e) => {
    setGridSize(parseInt(e.target.value, 10));
  };

  // Placeholder for profile copy action – will be implemented with context later
  const handleCopyCurrent = () => {
    // TODO: capture current state (tiles, grid size, hues) and save as profile
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
        <ProfilesDropdown onCopyCurrent={handleCopyCurrent} />
      </div>

      {/* ---- Grid size slider (existing) ---- */}
      <div className="sidebar-slider">
        <label htmlFor="grid-slider">Grid: {gridSize}×{gridSize}</label>
        <input
          type="range"
          id="grid-slider"
          min="3"
          max="6"
          step="1"
          value={gridSize}
          onChange={handleSliderChange}
        />
      </div>

      {/* ---- Colour 1 (background) spectrum slider ---- */}
      <div className="sidebar-slider">
        <ColorSlider
          label="Background"
          hue={bgHue}
          setHue={setBgHue}
        />
      </div>

      {/* ---- Colour 2 (accent) spectrum slider ---- */}
      <div className="sidebar-slider">
        <ColorSlider
          label="Secondary"
          hue={accentHue}
          setHue={setAccentHue}
        />
      </div>
    </aside>
  );
};

export default Sidebar;