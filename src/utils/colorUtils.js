//   src/utils/colorUtils.js

/**
 * Returns the CSS colour at a given slider value (0–360).
 * 0         → white
 * 360       → black
 * 1 … 359   → full‑saturation HSL colour hsl(value, 100%, 50%)
 */
export const getGradientColor = (hue) => {
  const clamped = Math.max(0, Math.min(360, Math.round(hue)));
  if (clamped === 0) return '#ffffff';
  if (clamped === 360) return '#000000';
  return `hsl(${clamped}, 100%, 50%)`;
};