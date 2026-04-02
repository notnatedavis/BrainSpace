//   src/components/common/TileEditModal.jsx

// ----- Imports -----
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
    // If tile not found, close modal
    setEditingTileId(null);
    return null;
  }

  const typeDef = tileTypes[tile.type];
  if (!typeDef || !typeDef.editComponent) {
    // No edit component defined – close modal
    setEditingTileId(null);
    return null;
  }

  const EditComponent = typeDef.editComponent;

  const handleSave = (updatedData) => {
    updateTile(tile.id, updatedData);
    setEditingTileId(null);
  };

  const handleClose = () => {
    setEditingTileId(null);
  };

  // Stop click propagation on modal content so clicking inside doesn't close
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={handleModalContentClick}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <h2>Edit {typeDef.displayName} Tile</h2>
        <EditComponent tile={tile} onSave={handleSave} />
      </div>
    </div>
  );
};

export default TileEditModal;