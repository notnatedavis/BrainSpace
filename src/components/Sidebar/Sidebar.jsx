//   src/components/Sidebar/Sidebar.jsx

// ----- Imports -----
import React from 'react';
import './Sidebar.css';

// ----- Main -----
const Sidebar = ({ gridSize, setGridSize }) => {
  const handleSliderChange = (e) => {
    setGridSize(parseInt(e.target.value, 10));
  };

  return (
    <aside className="sidebar">
      <ul>
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
        <li>Menu Item 3</li>
      </ul>
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
    </aside>
  );
};

export default Sidebar;