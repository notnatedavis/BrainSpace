//   src/components/common/HSLColorPicker.jsx
//   Compact HSL colour selector with three sliders (Hue, Saturation, Lightness).

// ----- Imports -----
import React from 'react';
import './HSLColorPicker.css';

// ----- Helpers -----
const hslToString = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

// ----- Main -----
const HSLColorPicker = ({ label, hsl, onChange }) => {
  const { h, s, l } = hsl;

  const handleHue = (e) => onChange({ ...hsl, h: Number(e.target.value) });
  const handleSat = (e) => onChange({ ...hsl, s: Number(e.target.value) });
  const handleLight = (e) => onChange({ ...hsl, l: Number(e.target.value) });

  // Compute track gradients and thumb colours
  const hueGradient = `linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))`;
  const satGradient = `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))`;
  const lightGradient = `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`;

  // Thumb colours: show the currently selected colour on the saturation and lightness sliders
  const hueThumb = hslToString(h, 100, 50);
  const satThumb = hslToString(h, s, l);
  const lightThumb = hslToString(h, s, l);

  return (
    <div className="hsl-picker">
      <div className="hsl-picker-label">{label}</div>

      {/* Hue */}
      <div className="hsl-slider-row">
        <span className="hsl-slider-badge">H</span>
        <input
          type="range"
          min="0"
          max="360"
          value={h}
          onChange={handleHue}
          className="hsl-slider"
          style={{ background: hueGradient, '--thumb-color': hueThumb }}
          aria-label={`${label} Hue`}
        />
      </div>

      {/* Saturation */}
      <div className="hsl-slider-row">
        <span className="hsl-slider-badge">S</span>
        <input
          type="range"
          min="0"
          max="100"
          value={s}
          onChange={handleSat}
          className="hsl-slider"
          style={{ background: satGradient, '--thumb-color': satThumb }}
          aria-label={`${label} Saturation`}
        />
      </div>

      {/* Lightness */}
      <div className="hsl-slider-row">
        <span className="hsl-slider-badge">L</span>
        <input
          type="range"
          min="0"
          max="100"
          value={l}
          onChange={handleLight}
          className="hsl-slider"
          style={{ background: lightGradient, '--thumb-color': lightThumb }}
          aria-label={`${label} Lightness`}
        />
      </div>
    </div>
  );
};

export default HSLColorPicker;