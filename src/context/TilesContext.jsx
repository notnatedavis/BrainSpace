//   src/context/TilesContext.jsx

// ----- Imports -----
import React, { createContext, useState, useCallback, useEffect } from 'react';
import tileTypes from '../components/tileTypes';
import demoProfile from '../data/demoProfile';
export const TilesContext = createContext();

const INITIAL_GRID_SIZE = 3;

// Helper: check if a cell (row, col) is occupied by any tile in given tiles array
const isCellOccupied = (tiles, row, col) => {
  for (const tile of tiles) {
    const r = tile.row;
    const c = tile.col;
    const s = tile.size || 1;
    if (row >= r && row < r + s && col >= c && col < c + s) {
      return true;
    }
  }
  return false;
};

// Helper: check if a rectangular area is free (excluding a tile with given excludeId)
const isAreaFree = (tiles, row, col, size, excludeId = null) => {
  for (let r = row; r < row + size; r++) {
    for (let c = col; c < col + size; c++) {
      if (excludeId) {
        for (const tile of tiles) {
          if (tile.id !== excludeId) {
            const ts = tile.size || 1;
            if (r >= tile.row && r < tile.row + ts && c >= tile.col && c < tile.col + ts) {
              return false;
            }
          }
        }
      } else {
        if (isCellOccupied(tiles, r, c)) return false;
      }
    }
  }
  return true;
};

// ----- Persistence helpers -----
const PROFILES_STORAGE_KEY = 'brainspace_profiles';

const loadProfilesFromStorage = () => {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse profiles from localStorage:', e);
  }
  return [];
};

const saveProfilesToStorage = (profiles) => {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn('Failed to save profiles to localStorage:', e);
  }
};

// ----- Main -----
export const TilesProvider = ({ children }) => {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [tiles, setTiles] = useState(() => {
    const infoDefault = tileTypes.info.defaultData();
    return [
      {
        id: 1,
        type: 'info',
        row: 0,
        col: 0,
        size: 1,
        ...infoDefault,
      },
    ];
  });

  const [editingTileId, setEditingTileId] = useState(null);
  const [bgHue, setBgHue] = useState(210);
  const [accentHue, setAccentHue] = useState(160);

  // LocalStorage‑based profiles
  const [profiles, setProfiles] = useState(loadProfilesFromStorage);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Persist profiles to localStorage
  useEffect(() => {
    saveProfilesToStorage(profiles);
  }, [profiles]);

  // ----- Tile actions (with row/col and size) -----
  const addTile = useCallback((type = 'note') => {
    const typeDef = tileTypes[type];
    if (!typeDef) {
      console.warn(`Unknown tile type: ${type}, defaulting to note`);
      type = 'note';
    }
    const defaultData = tileTypes[type].defaultData();
    const newTileId = Date.now();

    setTiles(prev => {
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          if (!isCellOccupied(prev, row, col)) {
            return [...prev, {
              id: newTileId,
              type,
              row,
              col,
              size: 1,
              ...defaultData,
            }];
          }
        }
      }
      return prev; // no space
    });
  }, [gridSize]);

  const removeTile = useCallback((id) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  }, []);

  // Move a tile to (targetRow, targetCol). If target cell is occupied by another 1×1 tile, swap them.
  const moveTile = useCallback((id, targetRow, targetCol) => {
    setTiles(prev => {
      const draggedTile = prev.find(t => t.id === id);
      if (!draggedTile) return prev;
      const currentRow = draggedTile.row;
      const currentCol = draggedTile.col;
      const size = draggedTile.size || 1;

      if (currentRow === targetRow && currentCol === targetCol) return prev;

      const occupant = prev.find(t =>
        t.id !== id &&
        t.row <= targetRow && t.row + (t.size || 1) > targetRow &&
        t.col <= targetCol && t.col + (t.size || 1) > targetCol
      );

      if (occupant) {
        if (size === 1 && (occupant.size || 1) === 1) {
          return prev.map(tile => {
            if (tile.id === id)         return { ...tile, row: occupant.row, col: occupant.col };
            if (tile.id === occupant.id) return { ...tile, row: currentRow, col: currentCol };
            return tile;
          });
        }
        return prev;
      }

      if (!isAreaFree(prev, targetRow, targetCol, size, id)) return prev;

      return prev.map(tile =>
        tile.id === id ? { ...tile, row: targetRow, col: targetCol } : tile
      );
    });
  }, []);

  // Resize tile to new row, col, size after checking bounds and free area
  const resizeTile = useCallback((id, newRow, newCol, newSize) => {
    setTiles(prev => {
      const tile = prev.find(t => t.id === id);
      if (!tile) return prev;
      const size = newSize || 1;

      // Out of grid bounds
      if (newRow < 0 || newCol < 0 || newRow + size > gridSize || newCol + size > gridSize) {
        return prev;
      }

      // Check that the target area is free (excluding the tile itself)
      if (!isAreaFree(prev, newRow, newCol, size, id)) return prev;

      return prev.map(t =>
        t.id === id
          ? { ...t, row: newRow, col: newCol, size }
          : t
      );
    });
  }, [gridSize]);

  const updateTile = useCallback((id, newData) => {
    setTiles(prev =>
      prev.map(tile =>
        tile.id === id ? { ...tile, ...newData } : tile
      )
    );
  }, []);

  // Grid resizing – filters tiles that would be out of bounds
  const resizeGrid = useCallback((newSize) => {
    setGridSize(newSize);
    setTiles(prev => prev.filter(tile => {
      const s = tile.size || 1;
      return tile.row + s <= newSize && tile.col + s <= newSize;
    }));
  }, []);

  // ----- Profile helpers -----
  const createSnapshot = useCallback(() => ({
    tiles,
    gridSize,
    bgHue,
    accentHue,
  }), [tiles, gridSize, bgHue, accentHue]);

  const copyCurrentProfile = useCallback(() => {
    const name = window.prompt('Profile name:', 'Copy of current');
    if (!name) return;
    const snapshot = createSnapshot();
    const newProfile = {
      id: Date.now(),
      name: name.trim(),
      tiles: snapshot.tiles,
      gridSize: snapshot.gridSize,
      bgHue: snapshot.bgHue,
      accentHue: snapshot.accentHue,
      createdAt: Date.now(),
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  }, [createSnapshot]);

  const loadProfile = useCallback((profile) => {
    if (!profile || !Array.isArray(profile.tiles)) {
      console.error('Invalid profile data');
      return;
    }
    setTiles(profile.tiles);
    setGridSize(profile.gridSize);
    setBgHue(profile.bgHue);
    setAccentHue(profile.accentHue);
    setActiveProfileId(profile.id);
  }, []);

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
    }
  }, [activeProfileId]);

  const loadDemoProfile = useCallback(() => {
    loadProfile(demoProfile);
  }, [loadProfile]);

  const exportProfile = useCallback(() => {
    const snapshot = createSnapshot();
    const profileName = window.prompt('File name (without extension):', 'Profile');
    if (!profileName) return;
    const profileData = {
      id: 'exported',
      name: profileName.trim(),
      tiles: snapshot.tiles,
      gridSize: snapshot.gridSize,
      bgHue: snapshot.bgHue,
      accentHue: snapshot.accentHue,
    };
    const fileContent = `// Exported BrainSpace profile: ${profileData.name}
const profile = ${JSON.stringify(profileData, null, 2)};
export default profile;
`;
    const blob = new Blob([fileContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profileData.name}.js`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [createSnapshot]);

  const importProfileFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const blob = new Blob([text], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const module = await import(/* @vite-ignore */ url);
        const profile = module.default;
        if (!profile || !profile.tiles) {
          alert('Invalid profile file: missing default export with tiles');
          return;
        }
        const newProfile = {
          ...profile,
          id: Date.now(),
        };
        setProfiles(prev => [...prev, newProfile]);
        loadProfile(newProfile);
      } catch (err) {
        console.error('Failed to import profile:', err);
        alert('Could not read profile file. Make sure it is a valid BrainSpace export.');
      }
    };
    input.click();
  }, [loadProfile]);

  const value = {
    tiles,
    gridSize,
    addTile,
    removeTile,
    moveTile,
    resizeGrid,
    editingTileId,
    setEditingTileId,
    updateTile,
    resizeTile,
    bgHue,
    setBgHue,
    accentHue,
    setAccentHue,
    profiles,
    activeProfileId,
    copyCurrentProfile,
    loadProfile,
    deleteProfile,
    loadDemoProfile,
    exportProfile,
    importProfileFromFile,
  };

  return (
    <TilesContext.Provider value={value}>
      {children}
    </TilesContext.Provider>
  );
};