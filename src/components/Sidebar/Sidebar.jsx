// src/components/Sidebar/Sidebar.jsx

// ----- Imports -----
import React, { useContext, useState, useRef } from 'react';
import { TilesContext } from '../../context/TilesContext';
import HSLColorPicker from '../common/HSLColorPicker';
import ProfilesDropdown from './ProfilesDropdown';
import { extractYouTubeId } from '../../utils/youtubeUtils';
import './Sidebar.css';

// ----- Simple modal for YouTube URL input -----
const YoutubeUrlModal = ({ isOpen, onClose, onSetUrl }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a YouTube URL');
      return;
    }
    const videoId = extractYouTubeId(trimmed);
    if (!videoId) {
      setError('Invalid YouTube URL. Use youtube.com/watch?v=... or youtu.be/...');
      return;
    }
    onSetUrl(trimmed);
    setUrl('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content youtube-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Set YouTube Background</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
              YouTube URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="youtube-input"
              autoFocus
            />
            {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' }}>{error}</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="modal-cancel-btn">Cancel</button>
            <button type="submit" className="modal-submit-btn">Set Background</button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
    backgroundType,
    setBackgroundType,
    setBackgroundValue,
    backgroundOpacity,
    setBackgroundOpacity,
  } = useContext(TilesContext);

  // Hidden file input ref
  const fileInputRef = useRef(null);
  // YouTube modal state
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);

  const handleRowsChange = (e) => {
    resizeGrid(parseInt(e.target.value, 10), gridCols);
  };
  
  const handleColsChange = (e) => {
    resizeGrid(gridRows, parseInt(e.target.value, 10));
  };

  // ----- File upload handler (static image) -----
  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const onFileSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Warn about large GIFs (>5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (!window.confirm('File is larger than 5MB. Large GIFs may impact performance. Continue?')) {
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setBackgroundValue(dataUrl);
      setBackgroundType('image');
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re‑selected
    event.target.value = '';
  };

  // ----- YouTube background -----
  const handleYoutubeClick = () => {
    setShowYoutubeModal(true);
  };

  const setYouTubeBackground = (url) => {
    setBackgroundValue(url);
    setBackgroundType('youtube');
  };

  // ----- Clear background -----
  const handleClearBackground = () => {
    setBackgroundType('none');
    setBackgroundValue('');
  };

  return (
    <aside className="sidebar">
      <ul>
        <li onClick={handleFileUpload} style={{ cursor: 'pointer' }}>
          Background: File
        </li>
        <li onClick={handleYoutubeClick} style={{ cursor: 'pointer' }}>
          Background: YouTube
        </li>
        <li onClick={handleClearBackground} style={{ cursor: 'pointer' }}>
          Background: None
        </li>
      </ul>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.gif"
        style={{ display: 'none' }}
        onChange={onFileSelected}
      />

      {/* YouTube URL modal */}
      <YoutubeUrlModal
        isOpen={showYoutubeModal}
        onClose={() => setShowYoutubeModal(false)}
        onSetUrl={setYouTubeBackground}
      />

      {/* ---- Profiles dropdown ---- */}
      <div className="sidebar-section">
        <ProfilesDropdown />
      </div>

      {/* ---- Grid size sliders ---- */}
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
      
      {/* ---- Background opacity slider (visible only when background is active) ---- */}
      {backgroundType !== 'none' && (
        <div className="sidebar-slider">
          <label htmlFor="bg-opacity">Background Opacity: {Math.round(backgroundOpacity * 100)}%</label>
          <input
            type="range"
            id="bg-opacity"
            min="0"
            max="1"
            step="0.01"
            value={backgroundOpacity}
            onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
          />
        </div>
      )}

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