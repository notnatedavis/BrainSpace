//   src/components/common/ColorSlider.jsx

// ----- Imports -----
import React from 'react';
import './ColorSlider.css';

// ----- Main -----
/**
 * A colour slider that shows a full‑spectrum gradient (white → hues → black)
 * and updates its thumb colour to match the selected value.
 *
 * @param {string}  label   - Label displayed above the slider
 * @param {number}  hue     - Current value (0–360; 0=white, 360=black, 1-359=vibrant hues)
 * @param {function} setHue - Callback to update the value
 */
const ColorSlider = ({ label, hue, setHue }) => {
  // Compute the thumb colour: white at 0°, black at 360°, full‑saturation colour in between
  let thumbColor;
  if (hue <= 5) {
    thumbColor = '#ffffff';
  } else if (hue >= 355) {
    thumbColor = '#000000';
  } else {
    thumbColor = `hsl(${hue}, 100%, 50%)`;
  }

  const handleChange = (e) => {
    setHue(Number(e.target.value));
  };

  // Vibrant gradient with white on the left, full‑saturation hues, black on the right
  const spectrumGradient = `linear-gradient(
    to right,
    #ffffff 0%,
    hsl(0, 100%, 50%) 5%,
    hsl(30, 100%, 50%) 15%,
    hsl(60, 100%, 50%) 25%,
    hsl(120, 100%, 50%) 40%,
    hsl(180, 100%, 50%) 55%,
    hsl(240, 100%, 50%) 70%,
    hsl(270, 100%, 50%) 80%,
    hsl(300, 100%, 50%) 90%,
    #000000 100%
  )`;

  const sliderStyle = {
    background: spectrumGradient,
    '--thumb-color': thumbColor,
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