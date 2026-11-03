import React from 'react';

interface PressureControlProps {
  value: number;
  onChange: (val: number) => void;
}

export const PressureControl: React.FC<PressureControlProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <div className="control-label-row">
        <span className="control-label">Chamber Pressure (kPa)</span>
        <span className="control-value">{value.toFixed(1)} kPa</span>
      </div>
      <input
        type="range"
        className="control-slider"
        min="20.0"
        max="200.0"
        step="1.0"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        <span>20 kPa (Low)</span>
        <span>101.3 kPa (1 atm)</span>
        <span>200 kPa</span>
      </div>
    </div>
  );
};
