//   src/components/Sidebar/Sidebar.jsx

// ----- Imports -----
import React from 'react';
import './Sidebar.css';

// ----- Main -----
const Sidebar = ({ columnCount, setColumnCount }) => {
  const handleSliderChange = (e) => {
    setColumnCount(parseInt(e.target.value, 10));
  };

  return (
    <aside className="sidebar">
      <ul>
        <li>Menu Item 1</li>
        <li>Menu Item 2</li>
        <li>Menu Item 3</li>
      </ul>
      <div className="sidebar-slider">
        <label htmlFor="column-slider">Columns: {columnCount}</label>
        <input
          type="range"
          id="column-slider"
          min="3"
          max="6"
          step="1"
          value={columnCount}
          onChange={handleSliderChange}
        />
      </div>
    </aside>
  );
};

export default Sidebar;