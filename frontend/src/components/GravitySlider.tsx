import React from 'react';
import { formatGravity } from '../utils/formatters';

interface GravitySliderProps {
  value: number;
  onChange: (val: number) => void;
  onSelectPreset: (g: number, o2?: number, p?: number) => void;
}

export const GravitySlider: React.FC<GravitySliderProps> = ({ value, onChange, onSelectPreset }) => {
  const { gStr, ms2Str } = formatGravity(value);

  return (
    <div className="control-group">
      <label className="control-label" style={{ display: 'block', marginBottom: '0.4rem' }}>Planetary Presets</label>
      <div className="preset-grid">
        <button className={`preset-btn ${Math.abs(value - 1.0) < 0.01 ? 'active' : ''}`} onClick={() => onSelectPreset(1.0, 20.95, 101.325)}>
          <strong>Earth Surface</strong>
          <span className="preset-val">1.00 g (9.81 m/s²)</span>
        </button>
        <button className={`preset-btn ${Math.abs(value - 0.38) < 0.01 ? 'active' : ''}`} onClick={() => onSelectPreset(0.38, 20.95, 101.325)}>
          <strong>Mars Gravity</strong>
          <span className="preset-val">0.38 g (3.71 m/s²)</span>
        </button>
        <button className={`preset-btn ${Math.abs(value - 0.165) < 0.01 ? 'active' : ''}`} onClick={() => onSelectPreset(0.165, 20.95, 101.325)}>
          <strong>Lunar Gravity</strong>
          <span className="preset-val">0.165 g (1.62 m/s²)</span>
        </button>
        <button className={`preset-btn ${value < 0.005 ? 'active' : ''}`} onClick={() => onSelectPreset(0.0001, 20.95, 101.325)}>
          <strong>Microgravity</strong>
          <span className="preset-val">~10⁻⁴ g (Orbit/ISS)</span>
        </button>
        <button className="preset-btn" onClick={() => onSelectPreset(0.0001, 34.0, 56.0)} style={{ gridColumn: 'span 2' }}>
          <strong>Artemis Exploration Habitat</strong>
          <span className="preset-val">34% O₂ @ 56 kPa (0.00 g)</span>
        </button>
      </div>

      <div className="control-label-row" style={{ marginTop: '0.75rem' }}>
        <span className="control-label">Gravitational Acceleration (g)</span>
        <span className="control-value">{gStr}</span>
      </div>
      <input
        type="range"
        className="control-slider orange-slider"
        min="0.0001"
        max="3.0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        <span>0.00 g (Micro-g)</span>
        <span>{ms2Str}</span>
        <span>3.00 g</span>
      </div>
    </div>
  );
};
