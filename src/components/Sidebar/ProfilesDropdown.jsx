//   src/components/Sidebar/ProfilesDropdown.jsx

// ----- Imports -----
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ProfilesDropdown.css';

// ----- Main -----
const ProfilesDropdown = ({ onCopyCurrent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const portalContainerRef = useRef(null);

  // ---- Create / destroy the portal container ----
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

  // ---- Calculate menu position below the button when opening ----
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4, // small gap
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  // ---- Close dropdown when clicking outside ----
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

  const handleCopyCurrent = useCallback(() => {
    if (onCopyCurrent) {
      onCopyCurrent();
    }
    setIsOpen(false);
  }, [onCopyCurrent]);

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
        <button
          className="profiles-dropdown-item"
          onClick={handleCopyCurrent}
          role="menuitem"
        >
          + Copy current
        </button>
        {/* Future profiles list will be rendered here */}
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