import React from 'react';

interface AirflowControlProps {
  value: number;
  onChange: (val: number) => void;
}

export const AirflowControl: React.FC<AirflowControlProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <div className="control-label-row">
        <span className="control-label">Forced Cross-Ventilation (m/s)</span>
        <span className="control-value">{value.toFixed(2)} m/s</span>
      </div>
      <input
        type="range"
        className="control-slider"
        min="-1.5"
        max="1.5"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
        <span>-1.5 m/s (Left)</span>
        <span>0.0 (Quiescent)</span>
        <span>+1.5 m/s (Right)</span>
      </div>
    </div>
  );
};
