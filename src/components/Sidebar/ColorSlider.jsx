//   src/components/Sidebar/ColorSlider.jsx

// ----- Imports -----
import React from 'react';

// ----- Main -----
/**
 * A minimal colour slider that displays a full‑spectrum gradient
 * and updates its thumb colour to match the selected hue.
 *
 * @param {string}  label   - Label displayed above the slider
 * @param {number}  hue     - Current hue value (0–360)
 * @param {function} setHue - Callback to update the hue
 */
const ColorSlider = ({ label, hue, setHue }) => {
  // Convert hue to a CSS variable so the thumb can read it
  const thumbHue = hue;

  const handleChange = (e) => {
    setHue(Number(e.target.value));
  };

  // Spectrum gradient for WebKit browsers (applied via inline style)
  const spectrumGradient = `linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  )`;

  const sliderStyle = {
    background: spectrumGradient,
    // Provide the thumb colour via a custom property
    '--thumb-hue': thumbHue,
  };

  return (
    <div className="color-slider-wrapper">
      <label>{label} ({hue}°)</label>
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={hue}
        onChange={handleChange}
        className="color-spectrum-slider"
        style={sliderStyle}
        aria-label={label}
      />
    </div>
  );
};

export default ColorSlider;