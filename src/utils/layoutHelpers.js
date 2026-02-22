//   src/utils/layoutHelpers.js

/**
 * Returns a scale factor for tiles based on the grid size (columns/rows).
 * @param {number} gridSize - The grid dimension (e.g., 4 for a 4×4 grid).
 * @returns {number} Scale factor between 0.9 and 1.2.
 */
export const getTileScale = (gridSize) => {
  // Example: 3 → 1
  return 1 - (gridSize - 3) * 0.1;
};