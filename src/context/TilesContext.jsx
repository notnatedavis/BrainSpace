// src/context/TilesContext.jsx

// ----- Imports -----
import React, { createContext, useState, useCallback, useEffect } from 'react';
import tileTypes from '../components/tileTypes';
import DefaultLandingPage from '../data/DefaultLandingPage';
export const TilesContext = createContext();

// Helper: check if a cell (row, col) is occupied by any tile in given tiles array
const isCellOccupied = (tiles, rows, cols, row, col) => {
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
const isAreaFree = (tiles, rows, cols, row, col, size, excludeId = null) => {
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
        if (isCellOccupied(tiles, rows, cols, r, c)) return false;
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
  const initialTiles = Array.isArray(DefaultLandingPage.tiles) 
    ? DefaultLandingPage.tiles 
    : [];

  // Initialise from DefaultLandingPage
  const [gridRows, setGridRows] = useState(DefaultLandingPage.gridRows || DefaultLandingPage.gridSize || 3);
  const [gridCols, setGridCols] = useState(DefaultLandingPage.gridCols || DefaultLandingPage.gridSize || 3);
  const [tiles, setTiles] = useState(DefaultLandingPage.tiles);
  const [editingTileId, setEditingTileId] = useState(null);
  const [bgColor, setBgColor] = useState(DefaultLandingPage.bgColor);
  const [accentColor, setAccentColor] = useState(DefaultLandingPage.accentColor);
  // NEW: border thickness for TileContainer outline
  const [containerOutlineWidth, setContainerOutlineWidth] = useState(5); // default 5px

  // ----- Background state -----
  const [backgroundType, setBackgroundType] = useState(DefaultLandingPage.backgroundType || 'none');
  const [backgroundValue, setBackgroundValue] = useState(DefaultLandingPage.backgroundValue || '');
  const [backgroundOpacity, setBackgroundOpacity] = useState(DefaultLandingPage.backgroundOpacity ?? 0.3);
  const [backgroundMuted, setBackgroundMuted] = useState(DefaultLandingPage.backgroundMuted ?? true);

  // Wrapped setters (no logging)
  const handleSetBackgroundType = useCallback((type) => {
    setBackgroundType(type);
  }, []);

  const handleSetBackgroundValue = useCallback((value) => {
    setBackgroundValue(value);
  }, []);

  const handleSetBackgroundOpacity = useCallback((opacity) => {
    setBackgroundOpacity(opacity);
  }, []);

  const handleSetBackgroundMuted = useCallback((muted) => {
    setBackgroundMuted(muted);
  }, []);

  // Unified update helper (no logging)
  const updateBackground = useCallback((updates) => {
    if (updates.type !== undefined) setBackgroundType(updates.type);
    if (updates.value !== undefined) setBackgroundValue(updates.value);
    if (updates.opacity !== undefined) setBackgroundOpacity(updates.opacity);
    if (updates.muted !== undefined) setBackgroundMuted(updates.muted);
  }, []);

  // ----- LocalStorage‑based profiles -----
  const [profiles, setProfiles] = useState(loadProfilesFromStorage);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Persist profiles to localStorage
  useEffect(() => {
    saveProfilesToStorage(profiles);
  }, [profiles]);

  // ----- Tile actions (with rows and cols) -----
  const addTile = useCallback((type = 'note') => {
    const typeDef = tileTypes[type];
    if (!typeDef) {
      console.warn(`Unknown tile type: ${type}, defaulting to note`);
      type = 'note';
    }
    const defaultData = tileTypes[type].defaultData();
    const newTileId = Date.now();

    setTiles(prev => {
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          if (!isCellOccupied(prev, gridRows, gridCols, row, col)) {
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
  }, [gridRows, gridCols]);

  const removeTile = useCallback((id) => {
    setTiles(prev => prev.filter(tile => tile.id !== id));
  }, []);

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

      if (!isAreaFree(prev, gridRows, gridCols, targetRow, targetCol, size, id)) return prev;

      return prev.map(tile =>
        tile.id === id ? { ...tile, row: targetRow, col: targetCol } : tile
      );
    });
  }, [gridRows, gridCols]);

  const resizeTile = useCallback((id, newRow, newCol, newSize) => {
    setTiles(prev => {
      const tile = prev.find(t => t.id === id);
      if (!tile) return prev;
      const size = newSize || 1;

      if (newRow < 0 || newCol < 0 || newRow + size > gridRows || newCol + size > gridCols) {
        return prev;
      }

      if (!isAreaFree(prev, gridRows, gridCols, newRow, newCol, size, id)) return prev;

      return prev.map(t =>
        t.id === id
          ? { ...t, row: newRow, col: newCol, size }
          : t
      );
    });
  }, [gridRows, gridCols]);

  const updateTile = useCallback((id, newData) => {
    setTiles(prev =>
      prev.map(tile =>
        tile.id === id ? { ...tile, ...newData } : tile
      )
    );
  }, []);

  // ----- Helper: attempt to shift tiles to fit new grid dimensions -----
  const tryFitTiles = useCallback((currentTiles, newRows, newCols) => {
    // Make a mutable copy
    let newTiles = currentTiles.map(t => ({ ...t }));

    // Helper to check if an area is free given current tile layout
    const isAreaFreeLocal = (tiles, rows, cols, row, col, size, excludeId) => {
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
            if (isCellOccupied(tiles, rows, cols, r, c)) return false;
          }
        }
      }
      return true;
    };

    // ---- Shift rows up if we are shrinking rows ----
    if (newRows < gridRows) {
      let anyOverflow = true;
      let maxIter = 100;
      while (anyOverflow && maxIter > 0) {
        anyOverflow = false;
        maxIter--;
        // Process tiles with larger row first (bottommost)
        const sorted = [...newTiles].sort((a, b) => (b.row + (b.size || 1)) - (a.row + (a.size || 1)));
        for (const tile of sorted) {
          const size = tile.size || 1;
          if (tile.row + size > newRows) {
            // Need to shift up
            if (tile.row > 0) {
              const newRow = tile.row - 1;
              // Check if moving up by 1 is free
              if (isAreaFreeLocal(newTiles, newRows, newCols, newRow, tile.col, size, tile.id)) {
                tile.row = newRow;
                anyOverflow = true; // continue loop
              } else {
                // Cannot shift this tile up by 1 – reject
                return null;
              }
            } else {
              // Already at row 0, cannot shift up
              return null;
            }
          }
        }
        // If no tile overflows, break
        if (!newTiles.some(t => (t.row + (t.size || 1)) > newRows)) {
          anyOverflow = false;
        }
      }
      // After shifting, some tiles might now overflow? The loop should have resolved.
      // Final check: if any still overflow, reject
      if (newTiles.some(t => (t.row + (t.size || 1)) > newRows)) {
        return null;
      }
    }

    // ---- Shift columns left if we are shrinking columns ----
    if (newCols < gridCols) {
      let anyOverflow = true;
      let maxIter = 100;
      while (anyOverflow && maxIter > 0) {
        anyOverflow = false;
        maxIter--;
        // Process tiles with larger col first (rightmost)
        const sorted = [...newTiles].sort((a, b) => (b.col + (b.size || 1)) - (a.col + (a.size || 1)));
        for (const tile of sorted) {
          const size = tile.size || 1;
          if (tile.col + size > newCols) {
            if (tile.col > 0) {
              const newCol = tile.col - 1;
              if (isAreaFreeLocal(newTiles, newRows, newCols, tile.row, newCol, size, tile.id)) {
                tile.col = newCol;
                anyOverflow = true;
              } else {
                return null;
              }
            } else {
              return null;
            }
          }
        }
        if (!newTiles.some(t => (t.col + (t.size || 1)) > newCols)) {
          anyOverflow = false;
        }
      }
      if (newTiles.some(t => (t.col + (t.size || 1)) > newCols)) {
        return null;
      }
    }

    // If we got here, all tiles fit
    return newTiles;
  }, [gridRows, gridCols]);

  // ----- Resize grid with intelligent shifting -----
  const resizeGrid = useCallback((newRows, newCols) => {
    // Clamp dimensions
    const clampedRows = Math.min(6, Math.max(3, newRows));
    const clampedCols = Math.min(6, Math.max(3, newCols));

    // If no change, nothing to do
    if (clampedRows === gridRows && clampedCols === gridCols) return;

    // Attempt to fit tiles into new dimensions by shifting
    const adjustedTiles = tryFitTiles(tiles, clampedRows, clampedCols);
    if (adjustedTiles === null) {
      // Cannot fit tiles – reject resize
      return;
    }

    // Apply new grid size and adjusted tiles
    setGridRows(clampedRows);
    setGridCols(clampedCols);
    setTiles(adjustedTiles);
  }, [gridRows, gridCols, tiles, tryFitTiles]);

  // ----- Profile helpers (including background state and containerOutlineWidth) -----
  const createSnapshot = useCallback(() => ({
    tiles,
    gridRows,
    gridCols,
    bgColor,
    accentColor,
    backgroundType,
    backgroundValue,
    backgroundOpacity,
    backgroundMuted,
    containerOutlineWidth,
  }), [tiles, gridRows, gridCols, bgColor, accentColor, backgroundType, backgroundValue, backgroundOpacity, backgroundMuted, containerOutlineWidth]);

  const copyCurrentProfile = useCallback(() => {
    const name = window.prompt('Profile name:', 'Copy of current');
    if (!name) return;
    const snapshot = createSnapshot();
    const newProfile = {
      id: Date.now(),
      name: name.trim(),
      tiles: snapshot.tiles,
      gridRows: snapshot.gridRows,
      gridCols: snapshot.gridCols,
      bgColor: snapshot.bgColor,
      accentColor: snapshot.accentColor,
      backgroundType: snapshot.backgroundType,
      backgroundValue: snapshot.backgroundValue,
      backgroundOpacity: snapshot.backgroundOpacity,
      backgroundMuted: snapshot.backgroundMuted,
      containerOutlineWidth: snapshot.containerOutlineWidth,
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
    if (profile.gridRows !== undefined && profile.gridCols !== undefined) {
      setGridRows(profile.gridRows);
      setGridCols(profile.gridCols);
    } else if (profile.gridSize !== undefined) {
      setGridRows(profile.gridSize);
      setGridCols(profile.gridSize);
    } else {
      setGridRows(3);
      setGridCols(3);
    }

    if (profile.bgColor && profile.accentColor) {
      setBgColor(profile.bgColor);
      setAccentColor(profile.accentColor);
    } else if (profile.bgHue !== undefined && profile.accentHue !== undefined) {
      const oldBgHue = profile.bgHue;
      const oldAccentHue = profile.accentHue;
      setBgColor(
        oldBgHue === 0 ? { h: 0, s: 0, l: 100 }
        : oldBgHue === 360 ? { h: 0, s: 0, l: 0 }
        : { h: oldBgHue, s: 100, l: 50 }
      );
      setAccentColor(
        oldAccentHue === 0 ? { h: 0, s: 0, l: 100 }
        : oldAccentHue === 360 ? { h: 0, s: 0, l: 0 }
        : { h: oldAccentHue, s: 100, l: 50 }
      );
    } else {
      setBgColor(DefaultLandingPage.bgColor);
      setAccentColor(DefaultLandingPage.accentColor);
    }

    setBackgroundType(profile.backgroundType || 'none');
    setBackgroundValue(profile.backgroundValue || '');
    setBackgroundOpacity(profile.backgroundOpacity ?? 0.3);
    setBackgroundMuted(profile.backgroundMuted ?? true);
    setContainerOutlineWidth(profile.containerOutlineWidth ?? 5);

    setActiveProfileId(profile.id);
  }, []);

  const deleteProfile = useCallback((id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
    }
  }, [activeProfileId]);

  const exportProfile = useCallback(() => {
    const snapshot = createSnapshot();
    const profileName = window.prompt('File name (without extension):', 'Profile');
    if (!profileName) return;
    const profileData = {
      id: 'exported',
      name: profileName.trim(),
      tiles: snapshot.tiles,
      gridRows: snapshot.gridRows,
      gridCols: snapshot.gridCols,
      bgColor: snapshot.bgColor,
      accentColor: snapshot.accentColor,
      backgroundType: snapshot.backgroundType,
      backgroundValue: snapshot.backgroundValue,
      backgroundOpacity: snapshot.backgroundOpacity,
      backgroundMuted: snapshot.backgroundMuted,
      containerOutlineWidth: snapshot.containerOutlineWidth,
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
          backgroundType: profile.backgroundType || 'none',
          backgroundValue: profile.backgroundValue || '',
          backgroundOpacity: profile.backgroundOpacity ?? 0.3,
          backgroundMuted: profile.backgroundMuted ?? true,
          containerOutlineWidth: profile.containerOutlineWidth ?? 5,
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
    gridRows,
    gridCols,
    addTile,
    removeTile,
    moveTile,
    resizeGrid,
    editingTileId,
    setEditingTileId,
    updateTile,
    resizeTile,
    bgColor,
    setBgColor,
    accentColor,
    setAccentColor,
    profiles,
    activeProfileId,
    copyCurrentProfile,
    loadProfile,
    deleteProfile,
    exportProfile,
    importProfileFromFile,
    // Background exports
    backgroundType,
    backgroundValue,
    backgroundOpacity,
    backgroundMuted,
    setBackgroundType: handleSetBackgroundType,
    setBackgroundValue: handleSetBackgroundValue,
    setBackgroundOpacity: handleSetBackgroundOpacity,
    setBackgroundMuted: handleSetBackgroundMuted,
    updateBackground,
    containerOutlineWidth,
    setContainerOutlineWidth,
  };

  return (
    <TilesContext.Provider value={value}>
      {children}
    </TilesContext.Provider>
  );
};