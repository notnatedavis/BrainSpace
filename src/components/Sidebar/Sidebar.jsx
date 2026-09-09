// src/components/Sidebar/Sidebar.jsx

// ----- Imports -----
import React, { useContext, useState, useRef } from 'react';
import { TilesContext } from '../../context/TilesContext';
import HSLColorPicker from '../common/HSLColorPicker';
import ProfilesDropdown from './ProfilesDropdown';
import { extractYouTubeId } from '../../utils/youtubeUtils';
import './Sidebar.css';

// ----- Simple modal for YouTube URL input (unchanged) -----
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

// ----- New modal for file/URL upload (image background) -----
const FileUploadModal = ({ isOpen, onClose, onSetImage }) => {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState(null);      // data URL or image URL
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUrl('');
      setPreview(null);
      setError('');
    }
  }, [isOpen]);

  // Handle file selection via file input
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re‑selected
    e.target.value = '';
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    // Clear error when user types
    if (error) setError('');
  };

  // When URL input loses focus, attempt to load preview
  const handleUrlBlur = () => {
    const trimmed = url.trim();
    if (trimmed) {
      // Set preview to the URL; the <img> will handle loading errors
      setPreview(trimmed);
      setError('');
    }
  };

  // Drag‑and‑drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Drop a file
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Dropped file is not an image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target.result);
        setError('');
      };
      reader.onerror = () => {
        setError('Failed to read dropped file.');
      };
      reader.readAsDataURL(file);
      return;
    }

    // Try to get URL from text/uri-list or plain text
    const uriList = e.dataTransfer.getData('text/uri-list');
    const plainText = e.dataTransfer.getData('text/plain');
    const droppedUrl = uriList || plainText;
    if (droppedUrl && droppedUrl.trim()) {
      setUrl(droppedUrl.trim());
      setPreview(droppedUrl.trim());
      setError('');
    } else {
      setError('No valid image or URL dropped.');
    }
  };

  // Set the image and close
  const handleSet = () => {
    if (!preview) {
      setError('No image loaded. Please select a file or enter a URL.');
      return;
    }
    onSetImage(preview); // preview can be data URL or image URL
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content file-modal"
        onClick={(e) => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Upload File / Image URL</h2>

        {/* URL input */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Image URL
          </label>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="https://example.com/image.jpg"
            className="youtube-input"
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
            Paste an image URL or drag and drop a file/URL onto this modal.
          </div>
        </div>

        {/* File picker */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="modal-cancel-btn" // reuse cancel style for neutral button
            onClick={() => fileInputRef.current.click()}
            style={{ marginRight: '0.5rem' }}
          >
            Choose File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            (supports JPG, PNG, GIF, etc.)
          </span>
        </div>

        {/* Preview area */}
        {preview && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500, fontSize: '0.9rem' }}>Preview</p>
            <img
              src={preview}
              alt="background preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--color-border)',
                objectFit: 'contain',
              }}
              onError={() => {
                setError('Failed to load image. Please check the URL or file.');
                setPreview(null);
              }}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" onClick={onClose} className="modal-cancel-btn">Cancel</button>
          <button
            type="button"
            onClick={handleSet}
            className="modal-submit-btn"
            disabled={!preview}
          >
            Set Background
          </button>
        </div>
      </div>
    </div>
  );
};

// ----- Main Sidebar component -----
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
    containerOutlineWidth,
    setContainerOutlineWidth,
  } = useContext(TilesContext);

  // State for modals
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);

  // ----- Handlers for background types -----
  const handleFileBackgroundClick = () => {
    setShowFileModal(true);
  };

  const handleYoutubeBackgroundClick = () => {
    setShowYoutubeModal(true);
  };

  const handleClearBackground = () => {
    setBackgroundType('none');
    setBackgroundValue('');
  };

  // ----- File upload modal callback -----
  const setImageBackground = (imageData) => {
    setBackgroundValue(imageData);
    setBackgroundType('image');
  };

  // ----- YouTube modal callback -----
  const setYouTubeBackground = (url) => {
    setBackgroundValue(url);
    setBackgroundType('youtube');
  };

  // ----- Grid sliders -----
  const handleRowsChange = (e) => {
    resizeGrid(parseInt(e.target.value, 10), gridCols);
  };

  const handleColsChange = (e) => {
    resizeGrid(gridRows, parseInt(e.target.value, 10));
  };

  // ----- Render -----
  return (
    <aside className="sidebar">
      <ul>
        <li onClick={handleFileBackgroundClick} style={{ cursor: 'pointer' }}>
          Background: File
        </li>
        <li onClick={handleYoutubeBackgroundClick} style={{ cursor: 'pointer' }}>
          Background: YouTube
        </li>
        <li onClick={handleClearBackground} style={{ cursor: 'pointer' }}>
          Background: None
        </li>
      </ul>

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

      {/* ---- Border thickness slider ---- */}
      <div className="sidebar-slider">
        <label htmlFor="border-thickness">Border Thickness: {containerOutlineWidth}px</label>
        <input
          type="range"
          id="border-thickness"
          min="0"
          max="20"
          step="1"
          value={containerOutlineWidth}
          onChange={(e) => setContainerOutlineWidth(parseInt(e.target.value, 10))}
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

      {/* ---- Modals ---- */}
      <YoutubeUrlModal
        isOpen={showYoutubeModal}
        onClose={() => setShowYoutubeModal(false)}
        onSetUrl={setYouTubeBackground}
      />
      <FileUploadModal
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onSetImage={setImageBackground}
      />
    </aside>
  );
};

export default Sidebar;