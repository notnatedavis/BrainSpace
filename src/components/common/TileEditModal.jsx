// src/components/common/TileEditModal.jsx
// Modal for editing tile properties. Only the close button (X) will exit;
// clicking outside the modal does nothing to prevent accidental loss of edits.

import React, { useContext } from 'react';
import { TilesContext } from '../../context/TilesContext';
import tileTypes from '../tileTypes';
import './TileEditModal.css';

// ----- Main -----
const TileEditModal = () => {
  const { editingTileId, setEditingTileId, tiles, updateTile } = useContext(TilesContext);

  if (!editingTileId) return null;

  const tile = tiles.find(t => t && t.id === editingTileId);
  if (!tile) {
    // if tile not found, close modal
    setEditingTileId(null);
    return null;
  }

  const typeDef = tileTypes[tile.type];
  if (!typeDef || !typeDef.editComponent) {
    // no edit component defined – close modal
    setEditingTileId(null);
    return null;
  }

  const EditComponent = typeDef.editComponent;

  const handleSave = (updatedData) => {
    updateTile(tile.id, updatedData);
    setEditingTileId(null);
  };

  const handleClose = () => {
    setEditingTileId(null); // this will unmount the edit component, which may trigger auto‑save
  };

  // stop click propagation on modal content so clicking inside doesn't close
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" /* no onClick handler – prevents accidental close */>
      <div className="modal-content" onClick={handleModalContentClick}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <h2>Edit {typeDef.displayName} Tile</h2>
        <EditComponent tile={tile} onSave={handleSave} />
      </div>
    </div>
  );
};

export default TileEditModal;