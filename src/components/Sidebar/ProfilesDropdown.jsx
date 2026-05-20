//   src/components/Sidebar/ProfilesDropdown.jsx

// ----- Imports -----
import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { TilesContext } from '../../context/TilesContext';
// Import the three new demo profiles
import DemoProfile1 from '../../data/DemoProfile1';
import DemoProfile2 from '../../data/DemoProfile2';
import DemoProfile3 from '../../data/DemoProfile3';
import './ProfilesDropdown.css';

// ----- Main -----
const ProfilesDropdown = () => {
  const {
    profiles,
    activeProfileId,
    copyCurrentProfile,
    loadProfile,
    deleteProfile,
    exportProfile,
    importProfileFromFile,
  } = useContext(TilesContext);

  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const portalContainerRef = useRef(null);

  // ---- Create / destroy the portal container (unchanged) ----
  useEffect(() => {
    const portalDiv = document.createElement('div');
    portalDiv.className = 'profiles-dropdown-portal';
    document.body.appendChild(portalDiv);
    portalContainerRef.current = portalDiv;

    return () => {
      document.body.removeChild(portalDiv);
      portalContainerRef.current = null;
    };
  }, []);

  // ---- Calculate menu position below the button when opening (unchanged) ----
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  // ---- Close dropdown when clicking outside (unchanged) ----
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const menuEl = menuRef.current;
      const buttonEl = buttonRef.current;
      if (
        menuEl && !menuEl.contains(event.target) &&
        buttonEl && !buttonEl.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ---- Action handlers that also close the dropdown ----
  const handleCopy = () => {
    copyCurrentProfile();
    setIsOpen(false);
  };

  const handleLoad = (profile) => {
    loadProfile(profile);
    setIsOpen(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteProfile(id);
  };

  // Handlers for the three demo profiles
  const handleLoadDemo1 = () => {
    loadProfile(DemoProfile1);
    setIsOpen(false);
  };

  const handleLoadDemo2 = () => {
    loadProfile(DemoProfile2);
    setIsOpen(false);
  };

  const handleLoadDemo3 = () => {
    loadProfile(DemoProfile3);
    setIsOpen(false);
  };

  const handleExport = () => {
    exportProfile();
    setIsOpen(false);
  };

  const handleImport = () => {
    importProfileFromFile();
    setIsOpen(false);
  };

  // ---- Render menu into the portal ----
  const renderMenu = isOpen && portalContainerRef.current && (
    createPortal(
      <div
        ref={menuRef}
        className="profiles-dropdown-menu"
        role="menu"
        style={{
          position: 'absolute',
          top: `${menuPos.top}px`,
          left: `${menuPos.left}px`,
        }}
      >
        {/* ---- User‑saved profiles ---- */}
        {profiles.length > 0 && (
          <>
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className={`profiles-dropdown-item ${activeProfileId === profile.id ? 'active' : ''}`}
                onClick={() => handleLoad(profile)}
                role="menuitem"
                tabIndex={0}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{profile.name}</span>
                <button
                  className="profile-delete-btn"
                  onClick={(e) => handleDelete(e, profile.id)}
                  title="Delete profile"
                  aria-label={`Delete ${profile.name}`}
                >
                  ×
                </button>
              </div>
            ))}
            <hr className="profiles-divider" />
          </>
        )}

        {/* ---- Export / Import actions ---- */}
        <button
          className="profiles-dropdown-item"
          onClick={handleExport}
          role="menuitem"
        >
          📥 Export current as file
        </button>

        <button
          className="profiles-dropdown-item"
          onClick={handleImport}
          role="menuitem"
        >
          📤 Import profile from file
        </button>

        {/* ---- Demo Profiles ---- */}
        <button
          className="profiles-dropdown-item"
          onClick={handleLoadDemo1}
          role="menuitem"
        >
          DemoProfile1
        </button>
        <button
          className="profiles-dropdown-item"
          onClick={handleLoadDemo2}
          role="menuitem"
        >
          DemoProfile2
        </button>
        <button
          className="profiles-dropdown-item"
          onClick={handleLoadDemo3}
          role="menuitem"
        >
          DemoProfile3
        </button>
      </div>,
      portalContainerRef.current
    )
  );

  return (
    <div className="profiles-dropdown-container">
      <button
        ref={buttonRef}
        className="profiles-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Profiles
      </button>

      {renderMenu}
    </div>
  );
};

export default ProfilesDropdown;