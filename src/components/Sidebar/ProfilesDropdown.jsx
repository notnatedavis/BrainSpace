//   src/components/Sidebar/ProfilesDropdown.jsx

// ----- Imports -----
import React, { useState, useRef, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { TilesContext } from '../../context/TilesContext';
import './ProfilesDropdown.css';

// ----- Main -----
const ProfilesDropdown = () => {
  const {
    profiles,
    activeProfileId,
    copyCurrentProfile,
    loadProfile,
    deleteProfile,
    loadDemoProfile,
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

  // ---- Action handlers that also close the dropdown (adapted) ----
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

  const handleLoadDemo = () => {
    loadDemoProfile();
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
        {/* ---- User‑saved profiles (unchanged) ---- */}
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

        {/* ---- Copy current action ---- */}
        <button
          className="profiles-dropdown-item"
          onClick={handleCopy}
          role="menuitem"
        >
          + Copy current
        </button>

        {/* ---- Export current as .js file ---- */}
        <button
          className="profiles-dropdown-item"
          onClick={handleExport}
          role="menuitem"
        >
          📥 Export current as file
        </button>

        {/* ---- Import profile from .js file ---- */}
        <button
          className="profiles-dropdown-item"
          onClick={handleImport}
          role="menuitem"
        >
          📤 Import profile from file
        </button>

        {/* ---- Load demo action ---- */}
        <button
          className={`profiles-dropdown-item ${activeProfileId === 'demo' ? 'active' : ''}`}
          onClick={handleLoadDemo}
          role="menuitem"
        >
          Load Demo
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