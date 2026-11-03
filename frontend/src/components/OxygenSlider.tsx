import React from 'react';

interface OxygenSliderProps {
  value: number;
  onChange: (val: number) => void;
}

export const OxygenSlider: React.FC<OxygenSliderProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <div className="control-label-row">
        <span className="control-label">Oxygen Concentration (% vol)</span>
        <span className="control-value">{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        className="control-slider"
        min="2.0"
        max="40.0"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        <span>2% (Quench)</span>
        <span>21% (Earth Norm)</span>
        <span>40% (Enriched)</span>
      </div>
    </div>
  );
};
