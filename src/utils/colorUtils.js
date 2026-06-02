//   src/utils/colorUtils.js

/**
 * Returns the CSS colour for a given hue (0–360) – used for legacy note tile backgrounds.
 * 0 → white, 360 → black, else full‑saturation HSL.
 */
export const getGradientColor = (hue) => {
  const clamped = Math.max(0, Math.min(360, Math.round(hue)));
  if (clamped === 0) return '#ffffff';
  if (clamped === 360) return '#000000';
  return `hsl(${clamped}, 100%, 50%)`;
};

/**
 * Converts an HSL object { h, s, l } to a CSS hsl() string
 */
export const hslToString = ({ h, s, l }) => `hsl(${h}, ${s}%, ${l}%)`;